const {parsed: localEnv} = require("dotenv").config();

module.exports = {
  exportTrailingSlash: false,
  trailingSlash: false,
  devIndicators: {
    autoPrerender: false,
  },
  env: localEnv || {},
};
