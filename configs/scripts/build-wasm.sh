#!/bin/bash

# TODO Delete since GH Actions dependencies are restored from cache, check Vercel deployment caching
if ! which wasm-pack; then
  echo Init rustup
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -sSf | sh -s -- -y
  . $HOME/.cargo/env

  echo Init wasm-pack
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

rm -rf ./wasm-pkg
echo Build wasm-pkg
wasm-pack build \
          --quiet \
          --out-dir wasm-pkg \
          --release
