import { useEffect, RefObject } from "react";
import {
  WORLD_SIZE,
  CANVAS_SIZE,
  SCALE,
  START_POSITION,
  GOAL_POSITION,
  GOAL_RADIUS,
  OBSTACLES,
} from "../constants/plannerConfig";

interface UseCanvasRendererProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  pathStates: number[][];
}

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  for (let i = 0; i <= WORLD_SIZE; i++) {
    const pos = i * SCALE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, CANVAS_SIZE);
    ctx.moveTo(0, pos);
    ctx.lineTo(CANVAS_SIZE, pos);
    ctx.stroke();
  }
};

const drawObstacles = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#333";
  OBSTACLES.forEach((obstacle) => {
    ctx.fillRect(
      (obstacle.x - obstacle.width / 2) * SCALE,
      (WORLD_SIZE - obstacle.y - obstacle.height / 2) * SCALE,
      obstacle.width * SCALE,
      obstacle.height * SCALE
    );
  });
};

const drawGoal = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "rgba(76, 175, 80, 0.3)";
  ctx.strokeStyle = "#4CAF50";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    GOAL_POSITION.x * SCALE,
    (WORLD_SIZE - GOAL_POSITION.y) * SCALE,
    GOAL_RADIUS * SCALE,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.stroke();
};

const drawStart = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#2196F3";
  ctx.beginPath();
  ctx.arc(
    START_POSITION.x * SCALE,
    (WORLD_SIZE - START_POSITION.y) * SCALE,
    8,
    0,
    2 * Math.PI
  );
  ctx.fill();
};

const drawPath = (ctx: CanvasRenderingContext2D, pathStates: number[][]) => {
  if (pathStates.length === 0) return;

  ctx.strokeStyle = "#FF5722";
  ctx.lineWidth = 3;
  ctx.beginPath();
  pathStates.forEach((state, index) => {
    const x = state[0] * SCALE;
    const y = (WORLD_SIZE - state[1]) * SCALE;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = "#FF5722";
  pathStates.forEach((state) => {
    ctx.beginPath();
    ctx.arc(
      state[0] * SCALE,
      (WORLD_SIZE - state[1]) * SCALE,
      4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });
};

export const useCanvasRenderer = ({
  canvasRef,
  pathStates,
}: UseCanvasRendererProps) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawGrid(ctx);
    drawObstacles(ctx);
    drawGoal(ctx);
    drawStart(ctx);
    drawPath(ctx, pathStates);
  }, [canvasRef, pathStates]);
};