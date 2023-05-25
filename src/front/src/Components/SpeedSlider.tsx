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

    slider!.addEventListener("input", () => {
      // @ts-ignore: Object is possibly 'null'.
      const newSpeed = slider.value;
      setSpeed(newSpeed);
    });

    return () => {
      slider!.removeEventListener("input", () => { });
    };
  }, [onSpeedChange]);

  return (
    <div className="slide-container">
      <p className="speed">Speed: {speed}</p>
      <input defaultValue={startingSpeed} type="range" min="0" max="10" className="slider" id="myRange" />
    </div>
  );
}
