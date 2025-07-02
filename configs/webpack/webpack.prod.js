/* eslint-disable @typescript-eslint/no-require-imports */
const { WebpackAssetsManifest } = require("webpack-assets-manifest");
const { merge } = require("webpack-merge");

const baseConfig = require("./webpack.base");

const excludedAssetsRegExp = new RegExp([
  "index.html",
  "manifest",
  "service-worker",
].join("|"), "gm");

const prefetchedAssetsRegExp = /\.(mp4|webm)$/;

require("dotenv").config();

/** @type { import('webpack').Configuration } */
const prodConfig = {
  mode: "production",
  plugins: [
    new WebpackAssetsManifest({
      enabled: true,
      customize(entry, _, __, asset) {
        if (entry.key.match(excludedAssetsRegExp)) {
          return false;
        }

        return {
          key: entry.key,
          value: {
            path: entry.value,
            size: asset.source.size(),
            prefetch: prefetchedAssetsRegExp.test(entry.key),
          },
        };
      },
      async done(manifest) {
        await manifest.writeTo("public/assets-manifest.json");
      },
    }),
  ],
};

module.exports = merge(baseConfig, prodConfig);
