import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

import { Box, Button } from "@mui/material";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

import { CELL_SIZE } from "./constants";
import { drawCells, drawGrid } from "./helpers";
import { containerStyles, contentStyles } from "./styles";
import { Universe } from "../../../wasm-pkg";

export const App = () => {
  const wasmConfig = useInitWasm();

  const [universe, setUniverse] = useState<Universe>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderLoop = useCallback(() => {
    if (canvasRef.current && universe && wasmConfig?.memory) {
      universe.tick();

      const ctx = canvasRef.current.getContext("2d");

      if (!ctx) return;

      drawGrid(ctx, universe.width(), universe.height());
      drawCells(ctx, universe.cells(), wasmConfig.memory, universe.width(), universe.height());
    }

    requestAnimationFrame(renderLoop);
  }, [universe, wasmConfig?.memory]);

  const handleCanvasReset = () => {
    setUniverse(wasmConfig?.module?.Universe.new());
  };

  const clickHandler = (e: MouseEvent) => {
    if (!canvasRef.current || !universe) return;

    const { top, left } = canvasRef.current.getBoundingClientRect();
    const { clientY, clientX } = e;

    const x = clientX - left;
    const y = clientY - top;

    const col = Math.floor(x / (CELL_SIZE + 1));
    const row = Math.floor(y / (CELL_SIZE + 1));

    universe.toggle_cell(col, row);
  };

  useEffect(() => {
    if (canvasRef.current && universe) {
      canvasRef.current.height = (CELL_SIZE + 1) * universe.height() + 1;
      canvasRef.current.width = (CELL_SIZE + 1) * universe.width() + 1;
    }
  }, [universe]);

  useEffect(() => {
    if (wasmConfig?.module && !universe) {
      setUniverse(wasmConfig?.module.Universe.new());
    }
  }, [universe, wasmConfig?.module]);

  useEffect(() => {
    requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  useInitSW();

  return (
    <Layout>
      <Box sx={containerStyles}>
        <Box sx={contentStyles}>
          <canvas
            onClick={clickHandler}
            ref={canvasRef}
          >
          </canvas>
        </Box>
        <Button onClick={handleCanvasReset}>
          Restart
        </Button>
      </Box>
    </Layout>
  );
};
