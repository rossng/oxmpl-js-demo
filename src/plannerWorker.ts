import * as oxmpl from "oxmpl-js";
import { CircularGoal } from "./CircularGoal";
import {
  WORLD_SIZE,
  START_POSITION,
  GOAL_POSITION,
  GOAL_RADIUS,
  OBSTACLES,
} from "./plannerConfig";

export interface PlannerWorkerMessage {
  type: "runPlanner";
  config: {
    type: "RRT" | "RRTStar" | "RRTConnect" | "PRM";
    maxDistance: number;
    goalBias: number;
    timeoutSecs: number;
    searchRadius?: number;
    connectionRadius?: number;
  };
}

export interface PlannerWorkerResult {
  type: "plannerResult" | "plannerError";
  pathStates?: number[][];
  error?: string;
}

const isStateValid = (state: Float64Array | number[]): boolean => {
  const [x, y] = state;

  for (const obstacle of OBSTACLES) {
    if (
      x >= obstacle.x - obstacle.width / 2 &&
      x <= obstacle.x + obstacle.width / 2 &&
      y >= obstacle.y - obstacle.height / 2 &&
      y <= obstacle.y + obstacle.height / 2
    ) {
      return false;
    }
  }

  return x >= 0 && x <= WORLD_SIZE && y >= 0 && y <= WORLD_SIZE;
};

const createPlanner = (config: PlannerWorkerMessage["config"]) => {
  switch (config.type) {
    case "RRT":
      return new oxmpl.RRT(config.maxDistance, config.goalBias);
    case "RRTStar":
      return new oxmpl.RRTStar(
        config.maxDistance,
        config.goalBias,
        config.searchRadius!
      );
    case "RRTConnect":
      return new oxmpl.RRTConnect(config.maxDistance, config.goalBias);
    case "PRM":
      return new oxmpl.PRM(config.timeoutSecs, config.connectionRadius!);
    default:
      return new oxmpl.RRT(config.maxDistance, config.goalBias);
  }
};

self.addEventListener(
  "message",
  (event: MessageEvent<PlannerWorkerMessage>) => {
    if (event.data.type === "runPlanner") {
      try {
        const { config } = event.data;

        const space = new oxmpl.RealVectorStateSpace(
          2,
          new Float64Array([0.0, WORLD_SIZE, 0.0, WORLD_SIZE])
        );

        const goalRegion = new CircularGoal(
          GOAL_POSITION.x,
          GOAL_POSITION.y,
          GOAL_RADIUS
        );

        const goal = new oxmpl.Goal(
          goalRegion.isSatisfied,
          goalRegion.distanceToGoal,
          goalRegion.sampleGoal
        );

        const problemDef = new oxmpl.ProblemDefinition(
          space,
          new Float64Array([START_POSITION.x, START_POSITION.y]),
          goal
        );

        const validityChecker = new oxmpl.StateValidityChecker(isStateValid);

        const planner = createPlanner(config);
        planner.setup(problemDef, validityChecker);

        if (config.type === "PRM" && "constructRoadmap" in planner) {
          (planner as oxmpl.PRM).constructRoadmap();
        }

        const path = planner.solve(config.timeoutSecs);
        const states = path.getStates();

        const pathStates = states.map((s: Float64Array) => Array.from(s));

        const result: PlannerWorkerResult = {
          type: "plannerResult",
          pathStates,
        };

        self.postMessage(result);
      } catch (error) {
        const result: PlannerWorkerResult = {
          type: "plannerError",
          error: error instanceof Error ? error.message : "Planning failed",
        };
        self.postMessage(result);
      }
    }
  }
);
