#!/bin/bash

. "$(dirname "$0")/setup-sw.sh"

__PROD__=true
yarn webpack --config configs/webpack/webpack.prod.js
yarn webpack --config configs/webpack/webpack.sw.js
