import React, { useState, useEffect, Dispatch, SetStateAction} from "react";
import BouncingBall from './BouncingBall';
import { normalize } from "path";
import { randomInt } from "crypto";


interface BouncingBallsProps {
    balls: { position: { x: number, y: number }, direction: { dx: number, dy: number } }[];
    speed: number;
}

export default function BouncingBallsUI(props: BouncingBallsProps) {
    const [balls, setBalls] = useState(props.balls);
    const [speed, setSpeed] = useState(props.speed);

    useEffect(() => {
        sessionStorage.setItem('balls', JSON.stringify(balls));
    }, [balls])

    useEffect(() => {
        const slider = document.getElementById("myRange");
        slider!.addEventListener("input", () => {
            // @ts-ignore: Object is possibly 'null'.
            const newSpeed = slider.value;
            setSpeed(newSpeed);
            sessionStorage.setItem('speed', newSpeed.toString())
        });
        return () => {slider!.removeEventListener("input", () => {sessionStorage.removeItem('speed')});};
    }, []);

    function addBall() {
        setBalls((prevBalls) => [
            ...prevBalls,
            {
                position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
                direction: { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 }
            },
        ]);
    }

    function removeBall() {
        setBalls(balls.slice(0, -1));
    }
    
    return (
        <>
            <div className="bouncing-balls-buttons">
                <button className="addBallButton" type="button" onClick={addBall}>Add Ball</button>
                <button className="removeBallButton" type="button" onClick={removeBall}>Remove Ball</button>
                <input defaultValue={speed} type="range" min="0" max="10" className="slider" id="myRange" />
                <p className="speed">Speed: <b>{speed}</b></p>
            </div>
            {balls && (balls.map((ball, index) => (<BouncingBall key={index} index={index} speed={speed} balls={balls} setBalls={setBalls}/>)))}
        </>
    );
}
