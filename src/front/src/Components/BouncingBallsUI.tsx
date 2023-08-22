import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import BouncingBall from './BouncingBall';


const startingSpeed = 5;

interface BouncingBallsUIProps {
    queryType: number;
}

export default function BouncingBallsUI(props: BouncingBallsUIProps) {
    const [speed, setSpeed] = useState(startingSpeed);
    const [balls, setBalls] = useState([{ x: 900, y: 100 }]);

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
    }, [setSpeed]);

    function addBall() {
        setBalls((prevBalls) => [
            ...prevBalls,
            { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
        ]);
    }
    function removeBall() {
        setBalls((prevBalls) => {
            "accessToken"
            if (prevBalls.length > 0) {
              return prevBalls.slice(0, -1);
            } else {
              return prevBalls;
            }
        });
    }

    return (
        <>
        <div className="bouncing-balls-buttons">
            <button className="addBallButton" type="button" onClick={addBall}>Add Ball</button>
            <button className="removeBallButton" type="button" onClick={removeBall}>Remove Ball</button>
            <input defaultValue={startingSpeed} type="range" min="0" max="10" className="slider" id="myRange" />
            <p className="speed">Speed: <b>{speed}</b></p>
        </div>
        {balls.map((ball, index) => (
            <BouncingBall key={index} speed={speed} queryType={props.queryType}/>
        ))}
        </>
    );
}
