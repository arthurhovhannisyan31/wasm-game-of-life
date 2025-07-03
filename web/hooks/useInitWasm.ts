/* eslint import/no-unresolved: 0 */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useEffect, useState } from "react";

// @ts-ignore
type WasmModule = typeof import("../../../wasm-pkg");

export const useInitWasm = () => {
  const [wasmModule, setWasmModule] = useState<WasmModule>();

  useEffect(() => {
    async function loadWasm(): Promise<void> {
      try {
        // @ts-ignore
        const wasm = await import("../../../wasm-pkg") as unknown as WasmModule;

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
/* eslint-enable @typescript-eslint/ban-ts-comment */
