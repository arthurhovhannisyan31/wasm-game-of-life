/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");

const dotenv = require("dotenv").config();
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");

const isProd = process.env.NODE_ENV === "production";

/** @type { import('webpack').Configuration } */
module.exports = {
  mode: "production",
  target: ["web", "es2020"],
  entry: {
    "service-worker": {
      import: path.resolve("web", "lib", "workers", "service-worker", "index.ts"),
      filename: "service-worker.js",
    },
  },
  output: {
    path: path.resolve("dist"),
    publicPath: "",
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({
      configFile: "./tsconfig.json",
    })],
    extensions: [".ts", ".js"],
  },
  stats: "minimal",
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)?$/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            noEmit: false,
            outDir: "dist",
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(isProd ? process.env : dotenv.parsed),
    }),
  ],
};
