import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

import { Box, Button } from "@mui/material";
import Slider from "@mui/material/Slider";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

import { CELL_SIZE, RENDER_PER_SECOND_RATE } from "./constants";
import { drawCells, drawGrid } from "./helpers";
import {
  containerStyles,
  contentStyles,
  controlsContainerStyles, sliderMarks,
  sliderStyles
} from "./styles";
import { Universe } from "../../../wasm-pkg";

let count = 0;
/* requestAnimationFrame catches the old version of the function and avoids new */
let rpsValue = RENDER_PER_SECOND_RATE;

export const App = () => {
  const wasmConfig = useInitWasm();

  const [universe, setUniverse] = useState<Universe>();
  const [play, setPlay] = useState(false);
  const [rps, setRps] = useState(rpsValue);

  const animationId = useRef<number>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrawGrid = useCallback(() => {
    if (!canvasRef.current || !universe || !wasmConfig?.memory) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    drawGrid(ctx, universe.width(), universe.height());
  }, [universe, wasmConfig?.memory]);

  const handleDrawCells = useCallback(() => {
    if (!canvasRef.current || !universe || !wasmConfig?.memory) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    drawCells(ctx, universe.cells(), wasmConfig.memory, universe.width(), universe.height());
  }, [universe, wasmConfig?.memory]);

  const renderLoop = useCallback(() => {
    count++;
    const skipCount = Math.ceil(RENDER_PER_SECOND_RATE / rpsValue);

    if (universe && count >= skipCount) {
      count = 0;

      universe.tick();

      handleDrawGrid();
      handleDrawCells();
    }

    animationId.current = requestAnimationFrame(renderLoop);
  }, [handleDrawCells, handleDrawGrid, universe]);

  const handleCanvasReset = () => {
    setUniverse(wasmConfig?.module?.Universe.new());
  };

  const clickHandler = (e: MouseEvent) => {
    if (!canvasRef.current || !universe) return;

    const boundingRect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / boundingRect.width;
    const scaleY = canvasRef.current.height / boundingRect.height;

    const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
    const canvasTop = (e.clientY - boundingRect.top) * scaleY;

    const row = Math.floor(canvasTop / (CELL_SIZE + 1));
    const col = Math.floor(canvasLeft / (CELL_SIZE + 1));

    universe.toggle_cell(col, row);

    handleDrawCells();
  };

  const start = () => {
    setPlay(true);
    renderLoop();
  };

  const pause = () => {
    setPlay(false);
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
  };

  const togglePlay = () => play ? pause() : start();

  const handleRpsChange = (
    _: Event,
    newValue: number
  ) => {
    setRps(newValue);
    rpsValue = newValue;
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
    handleDrawGrid();
    handleDrawCells();
  }, [handleDrawGrid, handleDrawCells]);

  useEffect(() => {
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  useInitSW();

  return (
    <Layout>
      <Box sx={containerStyles}>
        <Box sx={controlsContainerStyles}>
          <Button
            onClick={togglePlay}
            variant="outlined"
            sx={{ width: "100px" }}
          >
            {play ? "Stop" : "Play"}
          </Button>
          <Slider
            min={0}
            max={60}
            step={null}
            value={rps}
            onChange={handleRpsChange}
            sx={sliderStyles}
            marks={sliderMarks}
            valueLabelDisplay="auto"
          />
          <Button
            onClick={handleCanvasReset}
            variant="outlined"
          >
            Restart
          </Button>
        </Box>
        <Box sx={contentStyles}>
          <canvas
            onClick={clickHandler}
            ref={canvasRef}
          >
          </canvas>
        </Box>
      </Box>
    </Layout>
  );
};
