import { useCallback, useEffect, useRef, useState, type MouseEvent, type ChangeEvent } from "react";

import { Box, Button, Stack, Slider, Typography, Alert, FormControlLabel, Checkbox } from "@mui/material";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

import { CELL_SIZE, RENDER_PER_SECOND_RATE } from "./constants";
import { drawCells, drawGrid } from "./helpers";
import {
  buttonsContainerStyles,
  containerStyles,
  contentStyles,
  controlsContainerStyles, emptyCheckboxContainerStyles, sliderMarks,
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
  const [empty, setEmpty] = useState(false);

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

  const clickHandler = (
    e: MouseEvent
  ) => {
    if (!canvasRef.current || !universe) return;

    const boundingRect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / boundingRect.width;
    const scaleY = canvasRef.current.height / boundingRect.height;

    const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
    const canvasTop = (e.clientY - boundingRect.top) * scaleY;

    const row = Math.floor(canvasTop / (CELL_SIZE + 1));
    const col = Math.floor(canvasLeft / (CELL_SIZE + 1));

    if (e.shiftKey) {
      universe.set_glider(col, row);
    } else {
      universe.toggle_cell(col, row);
    }

    handleDrawCells();
  };

  const handleCanvasReset = () => {
    setPlay(false);

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }

    setUniverse(wasmConfig?.module?.Universe.new(empty));
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

  const handleChangeCheckbox = (
    event: ChangeEvent<HTMLInputElement>) => {
    setEmpty(event.target.checked);
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
  }, [empty, universe, wasmConfig?.module]);

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
          <Box sx={buttonsContainerStyles}>
            <Button
              onClick={togglePlay}
              variant="contained"
              sx={{ width: "100px" }}
              color="success"
            >
              {play ? "Stop" : "Play"}
            </Button>
            <Button
              onClick={handleCanvasReset}
              variant="contained"
              color="info"
            >
              Reset
            </Button>
          </Box>
          <Stack alignItems="center">
            <Typography gutterBottom>
              Renders per second rate
            </Typography>
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
          </Stack>
          <FormControlLabel
            style={emptyCheckboxContainerStyles}
            control={(
              <Checkbox
                value={empty}
                onChange={handleChangeCheckbox}
              />
            )}
            label="Empty canvas"
          />
          <Alert severity="info">
            Use `shift + click` to land a
            <a
              href="https://en.wikipedia.org/wiki/Glider_(Conway%27s_Game_of_Life)"
              target="_blank"
            >
              {" "}
              glider
            </a>
          </Alert>
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
