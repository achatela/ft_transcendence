import React, { useState, useEffect } from "react";
import "./css/SpeedSlider.css";

export default function SpeedSlider({ onSpeedChange }) {
    const [speed, setSpeed] = useState(1);
  
    useEffect(() => {
      const slider = document.getElementById("myRange");
  
      slider.addEventListener("input", () => {
        const newSpeed = slider.value;
        setSpeed(newSpeed);
        onSpeedChange(newSpeed);
      });
  
      return () => {
        slider.removeEventListener("input", () => {});
      };
    }, [onSpeedChange]);
  
    return (
      <div className="slidecontainer">
        <p className="speed">Speed: {speed}</p>
        <input type="range" min="1" max="100" className="slider" id="myRange" />
      </div>
    );
  }
  