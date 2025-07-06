import { useCallback, useEffect, useRef, useState } from "react";

import { Box, Button } from "@mui/material";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

import { containerStyles, contentStyles } from "./styles";
import { Universe } from "../../../wasm-pkg";

export const App = () => {
  const wasm = useInitWasm();
  const [universe, setUniverse] = useState<Universe>();

  const preContainerRef = useRef<HTMLPreElement>(null);
  const renderLoop = useCallback(() => {
    if (preContainerRef.current && universe) {
      preContainerRef.current.textContent = universe.render();
      universe.tick();
    }

    requestAnimationFrame(renderLoop);
  }, [universe]);

  const handleCanvasReset = () => {
    setUniverse(wasm?.Universe.new());
  };

  useEffect(() => {
    if (wasm && !universe) {
      setUniverse(wasm.Universe.new());
    }
  }, [universe, wasm]);

  useEffect(() => {
    requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  useInitSW();

  return (
    <Layout>
      <Box sx={containerStyles}>
        <Box sx={contentStyles}>
          <pre ref={preContainerRef}>
            hello
            kitty
          </pre>
        </Box>
        <Button onClick={handleCanvasReset}>
          Restart
        </Button>
      </Box>
    </Layout>
  );
};
