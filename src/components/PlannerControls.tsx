import React from "react";

export interface PlannerConfig {
  type: "RRT" | "RRTStar" | "RRTConnect" | "PRM";
  maxDistance: number;
  goalBias: number;
  timeoutSecs: number;
  searchRadius?: number;
  connectionRadius?: number;
}

interface PlannerControlsProps {
  config: PlannerConfig;
  setConfig: (config: PlannerConfig) => void;
  isPlanning: boolean;
  runPlanner: () => void;
}

const PlannerControls: React.FC<PlannerControlsProps> = ({
  config,
  setConfig,
  isPlanning,
  runPlanner,
}) => {
  return (
    <div className="controls">
      <div className="control-group planner-select">
        <label>
          Planner Algorithm:
          <select
            value={config.type}
            onChange={(e) =>
              setConfig({
                ...config,
                type: e.target.value as PlannerConfig["type"],
              })
            }
            disabled={isPlanning}
          >
            <option value="RRT">RRT</option>
            <option value="RRTStar">RRT*</option>
            <option value="RRTConnect">RRT-Connect</option>
            <option value="PRM">PRM</option>
          </select>
        </label>
      </div>

      <div className="control-parameters">
        <div className="control-group">
          <label className={config.type === "PRM" ? "disabled" : ""}>
            Max Step Distance: {config.maxDistance}
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={config.maxDistance}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxDistance: parseFloat(e.target.value),
                })
              }
              disabled={isPlanning || config.type === "PRM"}
            />
          </label>
        </div>

        <div className="control-group">
          <label className={config.type === "PRM" ? "disabled" : ""}>
            Goal Bias: {config.goalBias}
            <input
              type="range"
              min="0.0"
              max="0.3"
              step="0.01"
              value={config.goalBias}
              onChange={(e) =>
                setConfig({ ...config, goalBias: parseFloat(e.target.value) })
              }
              disabled={isPlanning || config.type === "PRM"}
            />
          </label>
        </div>

        <div className="control-group">
          <label className={config.type !== "RRTStar" ? "disabled" : ""}>
            Search Radius: {config.searchRadius}
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={config.searchRadius}
              onChange={(e) =>
                setConfig({
                  ...config,
                  searchRadius: parseFloat(e.target.value),
                })
              }
              disabled={isPlanning || config.type !== "RRTStar"}
            />
          </label>
        </div>

        <div className="control-group">
          <label className={config.type !== "PRM" ? "disabled" : ""}>
            Connection Radius: {config.connectionRadius}
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={config.connectionRadius}
              onChange={(e) =>
                setConfig({
                  ...config,
                  connectionRadius: parseFloat(e.target.value),
                })
              }
              disabled={isPlanning || config.type !== "PRM"}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Timeout (seconds): {config.timeoutSecs}
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={config.timeoutSecs}
              onChange={(e) =>
                setConfig({
                  ...config,
                  timeoutSecs: parseFloat(e.target.value),
                })
              }
              disabled={isPlanning}
            />
          </label>
        </div>
      </div>

      <button
        onClick={runPlanner}
        disabled={isPlanning}
        className="plan-button"
      >
        {isPlanning ? "Planning..." : "Plan Path"}
      </button>
    </div>
  );
};

export default PlannerControls;