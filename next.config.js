const {parsed: localEnv} = require("dotenv").config();

module.exports = {
  exportTrailingSlash: true,
  devIndicators: {
    autoPrerender: false,
  },
  env: localEnv || {},
};
