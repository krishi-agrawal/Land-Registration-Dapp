import React, { useState } from "react";
import {
  BackgroundColorContext,
  backgroundColors,
} from "../../contexts/BackgroundColorContext";

export default function BackgroundColorWrapper(props) {
  const [color, setColor] = useState(backgroundColors.blue);

  const changeColor = (color) => {
    setColor(color);
  };

  const colorClasses = {
    [backgroundColors.primary]: "bg-indigo-600", // Primary color
    [backgroundColors.blue]: "bg-blue-600",     // Blue color
    [backgroundColors.green]: "bg-green-600",   // Green color
  };

  return (
    <BackgroundColorContext.Provider value={{ color, changeColor }}>
      <div className={`min-h-screen ${colorClasses[color]} transition-colors duration-300`}>
        <div className="p-6 text-white">
          {props.children}
        </div>
      </div>
    </BackgroundColorContext.Provider>
  );
}