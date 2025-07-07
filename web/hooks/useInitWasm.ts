/* eslint import/no-unresolved: 0 */

import { useEffect, useState } from "react";

export interface WasmConfig {
  module: typeof import("../../wasm-pkg");
  memory: WebAssembly.Memory;
}

export const useInitWasm = (): WasmConfig | undefined => {
  const [wasmConfig, setWasmConfig] = useState<WasmConfig>();

  useEffect(() => {
    async function loadWasm(): Promise<void> {
      try {
        const [module, memory] = await Promise.all([
          import("../../wasm-pkg"),
          import("../../wasm-pkg/wasm_game_of_life_bg.wasm")
        ]);
        if (module && memory.memory) {
          setWasmConfig({
            module,
            memory: memory.memory
          });
        }
      } catch (e) {
        console.log(e);
      }
    }

    loadWasm();
  }, []);

  return wasmConfig;
};
