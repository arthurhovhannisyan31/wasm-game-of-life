/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const webpack = require("webpack");
const { merge } = require("webpack-merge");

const baseConfig = require("./webpack.base");

require("dotenv").config();

/** @type { import('webpack').Configuration } */
const devConfig = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    allowedHosts: "all",
    historyApiFallback: true,
    port: process.env.PORT || 4000,
    static: {
      directory: path.join(__dirname, "dist"),
      watch: {
        ignored: ["**/node_modules"],
        usePolling: true,
      },
    },
    server: {
      type: "http",
    },
  },
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

module.exports = merge(baseConfig, devConfig);
