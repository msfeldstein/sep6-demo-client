const Config = require("src/config");
const get = require("src/util/get");
const prop = require("lodash.get");

module.exports = {
  instruction: "Check /info endpoint to see if we need to authenticate",
  action: "GET /info (SEP-0006)",
  execute: async function(state, { request, response, instruction, expect }) {
    const transfer_server = state.transfer_server;
    request("GET /info");
    const result = await get(`${transfer_server}/info`);
    response("GET /info", result);
    expect(
      prop(result, ["deposit", Config.get("ASSET_CODE"), "enabled"]),
      `${Config.get("ASSET_CODE")} is not enabled for deposit`,
    );
    state.authentication_required = prop(result, [
      "deposit",
      Config.get("ASSET_CODE"),
      "authentication_required",
    ]);
    if (state.authentication_required) {
      instruction(
        "Deposit is enabled, and requires authentication so we should go through SEP-0010",
      );
    } else {
      instruction("Deposit is enabled with no authentication required");
    }

    state.interactive_url = transfer_server + result.url;
  },
};
