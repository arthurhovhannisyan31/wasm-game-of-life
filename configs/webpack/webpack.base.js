/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const dotenv = require("dotenv").config();
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { DefinePlugin } = require("webpack");

const isProd = process.env.NODE_ENV === "production";
const hash = "contenthash:20";

/** @type { import('webpack').Configuration } */
module.exports = {
  target: ["web", "es2020"],
  entry: [path.resolve("web", "index.tsx")],
  output: {
    path: path.resolve("dist"),
    filename: `[${hash}].[name].js`,
    publicPath: "",
    chunkFilename: `[${hash}].[name].chunk.js`,
  },
  optimization: {
    minimize: true,
  },
  experiments: {
    topLevelAwait: true,
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)x?$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: { outputPath: "public" },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `[${hash}].[name].css`,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve("public", "index.html"),
      cache: false,
      favicon: path.resolve("public", "favicon.ico"),
    }),
    new DefinePlugin({
      "process.env": JSON.stringify(isProd ? process.env : dotenv.parsed),
    }),
  ],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  stats: "minimal",
};
