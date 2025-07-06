/* eslint import/no-unresolved: 0 */

import { useEffect, useState } from "react";

type WasmModule = typeof import("../../wasm-pkg");

export const useInitWasm = () => {
  const [wasmModule, setWasmModule] = useState<WasmModule>();

  useEffect(() => {
    async function loadWasm(): Promise<void> {
      try {
        const wasm = await import("../../wasm-pkg") as unknown as WasmModule;

        if (wasm) {
          setWasmModule(wasm);
        }
      } catch (e) {
        console.log(e);
      }
    }

    loadWasm();
  }, []);

  return wasmModule;
};
