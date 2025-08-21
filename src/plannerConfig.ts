export interface ObstacleConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const WORLD_SIZE = 10;
export const CANVAS_SIZE = 600;
export const SCALE = CANVAS_SIZE / WORLD_SIZE;

export const START_POSITION = { x: 1.0, y: 5.0 };
export const GOAL_POSITION = { x: 9.0, y: 5.0 };
export const GOAL_RADIUS = 0.5;

export const OBSTACLES: ObstacleConfig[] = [
  { x: 5.0, y: 2.0, width: 0.5, height: 6.0 },
  { x: 2.5, y: 7.0, width: 2.0, height: 0.5 },
  { x: 7.0, y: 1.5, width: 0.5, height: 2.0 },
];

export const DEFAULT_PLANNER_CONFIG = {
  type: "RRT" as const,
  maxDistance: 0.5,
  goalBias: 0.05,
  timeoutSecs: 5.0,
  searchRadius: 1.0,
  connectionRadius: 1.0,
};