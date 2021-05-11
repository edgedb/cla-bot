const {parsed: localEnv} = require("dotenv").config();

module.exports = {
  trailingSlash: false,
  devIndicators: {
    autoPrerender: false,
  },
  env: localEnv || {},
};
