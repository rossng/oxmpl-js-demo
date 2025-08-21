import React from "react";

const Legend: React.FC = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#2196F3" }}
        ></span>
        Start Position
      </div>
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#4CAF50" }}
        ></span>
        Goal Region
      </div>
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#333" }}
        ></span>
        Obstacles
      </div>
      <div className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: "#FF5722" }}
        ></span>
        Solution Path
      </div>
    </div>
  );
};

export default Legend;