import { useCallback, useEffect, useRef, useState, type MouseEvent, type ChangeEvent } from "react";

import { Box, Button, Stack, Slider, Typography, Alert, FormControlLabel, Checkbox, TextField } from "@mui/material";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

import { CELL_SIZE, GRID_SIZE, RENDER_PER_SECOND_RATE } from "./constants";
import { drawCells, drawGrid, FPS, FPSProps, fpsPropsInitState } from "./helpers";
import {
  containerStyles,
  contentStyles,
  controlsContainerStyles,
  emptyCheckboxContainerStyles,
  fpsContainerStyles,
  sliderMarks,
  sliderStyles
} from "./styles";
import { Universe } from "../../../wasm-pkg";

let count = 0;
/* requestAnimationFrame catches the old version of the function and avoids new */
let rpsValue = RENDER_PER_SECOND_RATE;
const fpsCount = new FPS();

export const App = () => {
  const wasmConfig = useInitWasm();

  const [universe, setUniverse] = useState<Universe>();
  const [play, setPlay] = useState(false);
  const [rps, setRps] = useState(rpsValue);
  const [empty, setEmpty] = useState(false);
  const [fpsProps, setFpsProps] = useState<FPSProps>(fpsPropsInitState);
  const [gridSize, setGridSize] = useState(GRID_SIZE);
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  const animationId = useRef<number>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDrawGrid = useCallback(() => {
    if (!canvasRef.current || !universe || !wasmConfig?.memory) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    drawGrid(ctx, universe.width(), universe.height(), cellSize);
  }, [cellSize, universe, wasmConfig?.memory]);

  const handleDrawCells = useCallback(() => {
    if (!canvasRef.current || !universe || !wasmConfig?.memory) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) return;

    drawCells(ctx, universe.cells(), wasmConfig.memory, universe.width(), universe.height(), cellSize);
  }, [cellSize, universe, wasmConfig?.memory]);

  const renderLoop = useCallback(() => {
    count++;
    setFpsProps(fpsCount.render());

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

    const row = Math.floor(canvasTop / (cellSize + 1));
    const col = Math.floor(canvasLeft / (cellSize + 1));

    if (e.shiftKey) {
      universe.set_glider(col, row);
    } else {
      universe.toggle_cell(col, row);
    }

    handleDrawCells();
  };

  const handleCanvasReset = (gridSize: number) => () => {
    setPlay(false);

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }

    setUniverse(wasmConfig?.module?.Universe.new(empty, gridSize));
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

  const handleSetGridSize = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const val = +e.target.value;
    if (!Number.isFinite(val) || val === 0) {
      return;
    }

    setGridSize(val);
    handleCanvasReset(val)();
  };

  const handleSetCellSize = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const val = +e.target.value;
    if (!Number.isFinite(val) || val === 0) {
      return;
    }

    setCellSize(val);
    handleCanvasReset(gridSize)();
  };

  useEffect(() => {
    if (canvasRef.current && universe) {
      canvasRef.current.height = (cellSize + 1) * universe.height() + 1;
      canvasRef.current.width = (cellSize + 1) * universe.width() + 1;
    }
  }, [cellSize, universe]);

  useEffect(() => {
    if (wasmConfig?.module && !universe) {
      setUniverse(wasmConfig?.module.Universe.new(empty, gridSize));
    }
  }, [empty, universe, wasmConfig?.module, gridSize]);

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
          <Box display="flex" gap="16px" justifyContent="space-between">
            <Button
              onClick={togglePlay}
              variant="contained"
              sx={{ width: "100px" }}
              color="success"
            >
              {play ? "Stop" : "Play"}
            </Button>
            <Button
              onClick={handleCanvasReset(gridSize)}
              variant="contained"
              color="info"
            >
              Reset
            </Button>
            <TextField
              style={{
                width: "90px"
              }}
              label="Grid size"
              type="number"
              value={gridSize}
              onChange={handleSetGridSize}
            />
            <TextField
              style={{
                width: "90px"
              }}
              label="Cell size"
              type="number"
              value={cellSize}
              onChange={handleSetCellSize}
            />
          </Box>
          <Box sx={fpsContainerStyles}>
            <Typography>
              FPS:
            </Typography>
            <Typography>
              Current:
              {" "}
              {fpsProps.latest}
            </Typography>
            <Typography>
              Avg:
              {" "}
              {fpsProps.avg}
            </Typography>
            <Typography>
              Min:
              {" "}
              {fpsProps.min}
            </Typography>
            <Typography>
              Max:
              {" "}
              {fpsProps.max}
            </Typography>
          </Box>
          <Box display="flex" gap="16px" justifyContent="space-between">
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
            <Stack alignItems="center">
              <Typography gutterBottom>
                Renders per second
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
          </Box>
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
