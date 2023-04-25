import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import "./css/SpeedSlider.css";

const startingSpeed = 5;

interface speedSliderProps {
  onSpeedChange: Dispatch<SetStateAction<number>>;
}

export default function SpeedSlider(onSpeedChange: speedSliderProps) {
    const [speed, setSpeed] = useState(startingSpeed);
  
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
        <input defaultValue={startingSpeed} type="range" min="0" max="10" className="slider" id="myRange" />
      </div>
    );
  }
  