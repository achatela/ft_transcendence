import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "./css/SpeedSlider.css";

interface speedSliderProps {
  onSpeedChange: Dispatch<SetStateAction<number>>;
}

export default function SpeedSlider(onSpeedChange: speedSliderProps) {
    const [speed, setSpeed] = useState(1);
  
    useEffect(() => {
      const slider = document.getElementById("myRange");

      // @ts-ignore: Object is possibly 'null'.
      slider.addEventListener("input", () => {
        // @ts-ignore: Object is possibly 'null'.
        const newSpeed = slider.value;
        setSpeed(newSpeed);
        // @ts-ignore: Object is possibly 'null'.
        // onSpeedChange(newSpeed);
      });
  
      return () => {
        // @ts-ignore: Object is possibly 'null'.
        slider.removeEventListener("input", () => {});
      };
    }, [onSpeedChange]);
  
    return (
      <div className="slide-container">
        <p className="speed">Speed: {speed}</p>
        <input defaultValue={1} type="range" min="1" max="100" className="slider" id="myRange" />
      </div>
    );
  }
  