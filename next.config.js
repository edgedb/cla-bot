const {parsed: localEnv} = require("dotenv").config();

module.exports = {
  exportTrailingSlash: true,
  trailingSlash: false,
  devIndicators: {
    autoPrerender: false,
  },
  env: localEnv || {},
};
