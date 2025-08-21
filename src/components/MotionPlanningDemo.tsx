import { useRef, useState, useEffect } from "react";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import PlannerControls, { PlannerConfig } from "./PlannerControls";
import Legend from "./Legend";
import {
  CANVAS_SIZE,
  DEFAULT_PLANNER_CONFIG,
} from "../constants/plannerConfig";
import type { PlannerWorkerMessage, PlannerWorkerResult } from "../workers/plannerWorker";

const MotionPlanningDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [pathStates, setPathStates] = useState<number[][]>([]);
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_PLANNER_CONFIG);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/plannerWorker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.addEventListener("message", (event: MessageEvent<PlannerWorkerResult>) => {
      if (event.data.type === "plannerResult") {
        setPathStates(event.data.pathStates || []);
        setIsPlanning(false);
      } else if (event.data.type === "plannerError") {
        console.error("Planning failed:", event.data.error);
        setIsPlanning(false);
      }
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runPlanner = () => {
    if (!workerRef.current) return;
    
    setIsPlanning(true);
    setPathStates([]);

    const message: PlannerWorkerMessage = {
      type: "runPlanner",
      config: {
        type: config.type,
        maxDistance: config.maxDistance,
        goalBias: config.goalBias,
        timeoutSecs: config.timeoutSecs,
        searchRadius: config.searchRadius,
        connectionRadius: config.connectionRadius,
      },
    };

    workerRef.current.postMessage(message);
  };

  useCanvasRenderer({ canvasRef, pathStates });

  return (
    <div className="demo-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <h1>OxMPL Motion Planning Demo</h1>
          <p style={{ color: "#666" }}>
            Try out some path planning algorithms from{" "}
            <a href="https://github.com/juniorsundar/oxmpl">OxMPL</a> in 2D.
          </p>
        </div>
        <a 
          href="https://github.com/rossng/oxmpl-js-demo" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "40px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textDecoration: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 10px rgba(102, 126, 234, 0.4)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(102, 126, 234, 0.4)";
          }}
          aria-label="View source on GitHub"
        >
          <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
        </a>
      </div>

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
