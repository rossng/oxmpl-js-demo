import { useEffect, useRef, useState } from 'react';
import * as oxmpl from 'oxmpl-js';

interface PlannerConfig {
  type: 'RRT' | 'RRTStar' | 'RRTConnect' | 'PRM';
  maxDistance: number;
  goalBias: number;
  timeoutSecs: number;
  searchRadius?: number;
  connectionRadius?: number;
}

interface ObstacleConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MotionPlanningDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [pathStates, setPathStates] = useState<number[][]>([]);
  const [config, setConfig] = useState<PlannerConfig>({
    type: 'RRT',
    maxDistance: 0.5,
    goalBias: 0.05,
    timeoutSecs: 5.0,
    searchRadius: 1.0,
    connectionRadius: 1.0
  });

  const worldSize = 10;
  const canvasSize = 600;
  const scale = canvasSize / worldSize;

  const startPos = { x: 1.0, y: 5.0 };
  const goalPos = { x: 9.0, y: 5.0 };
  const goalRadius = 0.5;

  const obstacles: ObstacleConfig[] = [
    { x: 5.0, y: 2.0, width: 0.5, height: 6.0 },
    { x: 2.5, y: 7.0, width: 2.0, height: 0.5 },
    { x: 7.0, y: 1.5, width: 0.5, height: 2.0 }
  ];


  const isStateValid = (state: Float64Array | number[]): boolean => {
    const [x, y] = state;
    
    for (const obstacle of obstacles) {
      if (x >= obstacle.x - obstacle.width / 2 &&
          x <= obstacle.x + obstacle.width / 2 &&
          y >= obstacle.y - obstacle.height / 2 &&
          y <= obstacle.y + obstacle.height / 2) {
        return false;
      }
    }
    
    return x >= 0 && x <= worldSize && y >= 0 && y <= worldSize;
  };

  const createPlanner = () => {
    switch (config.type) {
      case 'RRT':
        return new oxmpl.RRT(config.maxDistance, config.goalBias);
      case 'RRTStar':
        return new oxmpl.RRTStar(config.maxDistance, config.goalBias, config.searchRadius!);
      case 'RRTConnect':
        return new oxmpl.RRTConnect(config.maxDistance, config.goalBias);
      case 'PRM':
        return new oxmpl.PRM(config.timeoutSecs, config.connectionRadius!);
      default:
        return new oxmpl.RRT(config.maxDistance, config.goalBias);
    }
  };

  const runPlanner = () => {
    setIsPlanning(true);
    setPathStates([]);

    try {
      const space = new oxmpl.RealVectorStateSpace(2, new Float64Array([0.0, worldSize, 0.0, worldSize]));

      class CircularGoal {
        private target: number[];
        private radius: number;

        constructor(x: number, y: number, radius: number) {
          this.target = [x, y];
          this.radius = radius;
        }

        isSatisfied = (state: Float64Array | number[]): boolean => {
          const dx = state[0] - this.target[0];
          const dy = state[1] - this.target[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= this.radius;
        };

        distanceToGoal = (state: Float64Array | number[]): number => {
          const dx = state[0] - this.target[0];
          const dy = state[1] - this.target[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          return Math.max(0, distance - this.radius);
        };

        sampleGoal = (): Float64Array => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = this.radius * Math.sqrt(Math.random());
          
          const x = this.target[0] + radius * Math.cos(angle);
          const y = this.target[1] + radius * Math.sin(angle);
          return new Float64Array([x, y]);
        };
      }

      const goalRegion = new CircularGoal(goalPos.x, goalPos.y, goalRadius);
      
      const goal = new oxmpl.Goal(
        goalRegion.isSatisfied,
        goalRegion.distanceToGoal,
        goalRegion.sampleGoal
      );

      const problemDef = new oxmpl.ProblemDefinition(
        space,
        new Float64Array([startPos.x, startPos.y]),
        goal
      );
      
      const validityChecker = new oxmpl.StateValidityChecker(isStateValid);

      const planner = createPlanner();
      planner.setup(problemDef, validityChecker);

      // PRM requires building a roadmap before solving
      if (config.type === 'PRM' && 'constructRoadmap' in planner) {
        (planner as any).constructRoadmap();
      }

      const path = planner.solve(config.timeoutSecs);
      const states = path.getStates();
      
      setPathStates(states.map((s: Float64Array) => Array.from(s)));

    } catch (error) {
      console.error('Planning failed:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= worldSize; i++) {
      const pos = i * scale;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasSize);
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasSize, pos);
      ctx.stroke();
    }

    ctx.fillStyle = '#333';
    obstacles.forEach(obstacle => {
      ctx.fillRect(
        (obstacle.x - obstacle.width / 2) * scale,
        (worldSize - obstacle.y - obstacle.height / 2) * scale,
        obstacle.width * scale,
        obstacle.height * scale
      );
    });

    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      goalPos.x * scale,
      (worldSize - goalPos.y) * scale,
      goalRadius * scale,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(
      startPos.x * scale,
      (worldSize - startPos.y) * scale,
      8,
      0,
      2 * Math.PI
    );
    ctx.fill();


    if (pathStates.length > 0) {
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.beginPath();
      pathStates.forEach((state, index) => {
        const x = state[0] * scale;
        const y = (worldSize - state[1]) * scale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      ctx.fillStyle = '#FF5722';
      pathStates.forEach(state => {
        ctx.beginPath();
        ctx.arc(
          state[0] * scale,
          (worldSize - state[1]) * scale,
          4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    }

  }, [pathStates]);

  return (
    <div className="demo-container">
      <h1>OxMPL Motion Planning Demo</h1>
      <p>Interactive motion planning algorithms with obstacle avoidance</p>
      
      <div className="controls">
        <div className="control-group planner-select">
          <label>
            Planner Algorithm:
            <select
              value={config.type}
              onChange={(e) => setConfig({...config, type: e.target.value as PlannerConfig['type']})}
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
            <label className={config.type === 'PRM' ? 'disabled' : ''}>
              Max Step Distance: {config.maxDistance}
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={config.maxDistance}
                onChange={(e) => setConfig({...config, maxDistance: parseFloat(e.target.value)})}
                disabled={isPlanning || config.type === 'PRM'}
              />
            </label>
          </div>
          
          <div className="control-group">
            <label className={config.type === 'PRM' ? 'disabled' : ''}>
              Goal Bias: {config.goalBias}
              <input
                type="range"
                min="0.0"
                max="0.3"
                step="0.01"
                value={config.goalBias}
                onChange={(e) => setConfig({...config, goalBias: parseFloat(e.target.value)})}
                disabled={isPlanning || config.type === 'PRM'}
              />
            </label>
          </div>

          <div className="control-group">
            <label className={config.type !== 'RRTStar' ? 'disabled' : ''}>
              Search Radius: {config.searchRadius}
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.searchRadius}
                onChange={(e) => setConfig({...config, searchRadius: parseFloat(e.target.value)})}
                disabled={isPlanning || config.type !== 'RRTStar'}
              />
            </label>
          </div>

          <div className="control-group">
            <label className={config.type !== 'PRM' ? 'disabled' : ''}>
              Connection Radius: {config.connectionRadius}
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.connectionRadius}
                onChange={(e) => setConfig({...config, connectionRadius: parseFloat(e.target.value)})}
                disabled={isPlanning || config.type !== 'PRM'}
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
                onChange={(e) => setConfig({...config, timeoutSecs: parseFloat(e.target.value)})}
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
          {isPlanning ? 'Planning...' : 'Plan Path'}
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="planning-canvas"
        />
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#2196F3'}}></span>
            Start Position
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#4CAF50'}}></span>
            Goal Region
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#333'}}></span>
            Obstacles
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#FF5722'}}></span>
            Solution Path
          </div>
        </div>
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