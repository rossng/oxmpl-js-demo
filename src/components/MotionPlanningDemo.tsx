import { useRef, useState } from "react";
import * as oxmpl from "oxmpl-js";
import { CircularGoal } from "../utils/CircularGoal";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import PlannerControls, { PlannerConfig } from "./PlannerControls";
import Legend from "./Legend";
import {
  WORLD_SIZE,
  CANVAS_SIZE,
  START_POSITION,
  GOAL_POSITION,
  GOAL_RADIUS,
  OBSTACLES,
  DEFAULT_PLANNER_CONFIG,
} from "../constants/plannerConfig";

const MotionPlanningDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [pathStates, setPathStates] = useState<number[][]>([]);
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_PLANNER_CONFIG);

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

  const createPlanner = () => {
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

  const runPlanner = () => {
    setIsPlanning(true);
    setPathStates([]);

    try {
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

      const planner = createPlanner();
      planner.setup(problemDef, validityChecker);

      // PRM requires building a roadmap before solving
      if (config.type === "PRM" && "constructRoadmap" in planner) {
        (planner as oxmpl.PRM).constructRoadmap();
      }

      const path = planner.solve(config.timeoutSecs);
      const states = path.getStates();

      setPathStates(states.map((s: Float64Array) => Array.from(s)));
    } catch (error) {
      console.error("Planning failed:", error);
    } finally {
      setIsPlanning(false);
    }
  };

  useCanvasRenderer({ canvasRef, pathStates });

  return (
    <div className="demo-container">
      <h1>OxMPL Motion Planning Demo</h1>
      <p>Interactive motion planning algorithms with obstacle avoidance</p>

      <PlannerControls
        config={config}
        setConfig={setConfig}
        isPlanning={isPlanning}
        runPlanner={runPlanner}
      />

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="planning-canvas"
        />
        <Legend />
      </div>

      {pathStates.length > 0 && (
        <div className="stats">
          <h3>Solution Statistics</h3>
          <p>Path found with {pathStates.length} waypoints</p>
        </div>
      )}
    </div>
  );
};

export default MotionPlanningDemo;