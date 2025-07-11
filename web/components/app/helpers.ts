import { ALIVE_COLOR, CELL_SIZE, DEAD_COLOR, GRID_COLOR } from "./constants";
import { Cell } from "../../../wasm-pkg";

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines
  for (let i = 0; i <= height; i++) {
    ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, i * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

export const getIndex = (
  row: number,
  width: number,
  column: number
): number => row * width + column;

export const drawCells = (
  ctx: CanvasRenderingContext2D,
  cellsPtr: number,
  memory: WebAssembly.Memory,
  width: number,
  height: number
): void => {
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, width, col);

      ctx.fillStyle = (cells[idx] as Cell) === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

export interface FPSProps {
  latest: number;
  avg: number;
  min: number;
  max: number;
}

export const fpsPropsInitState: FPSProps = {
  latest: 0,
  avg: 0,
  min: 0,
  max: 0,
};

export class FPS {
  private frames: number[] = [];
  private lastFrameTimeStamp = performance.now();

  render(): FPSProps {
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    this.frames.push(fps);

    if (this.frames.length > 100) {
      this.frames.shift();
    }

    const {
      min,
      max,
      sum,
    } = this.frames.reduce((
      acc,
      val
    ) => {
      acc.sum += val;
      acc.min = Math.min(val, acc.min);
      acc.max = Math.max(val, acc.max);

      return acc;
    }, {
      min: Infinity,
      max: -Infinity,
      sum: 0
    });
    const mean = sum / this.frames.length;

    return {
      latest: Math.round(fps),
      avg: Math.round(mean),
      min: Math.round(min),
      max: Math.round(max)
    };
  }
}
