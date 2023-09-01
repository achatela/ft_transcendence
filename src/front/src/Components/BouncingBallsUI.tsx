import React, { useState, useEffect, Dispatch, SetStateAction} from "react";
import BouncingBall from './BouncingBall';
import { normalize } from "path";
import { randomInt } from "crypto";


export default function BouncingBallsUI() {
    function getSpeed() {
        const storedSpeed = sessionStorage.getItem('speed');
        const speed = storedSpeed ? parseInt(storedSpeed) : 5;
        return speed;
    }

    function getBalls(): any[] {
        const storedBalls = sessionStorage.getItem('balls');
        if (storedBalls) {
            return JSON.parse(storedBalls);
        } else {
            const newBalls = [{
                position: {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                },
                direction: {
                    dx: Math.random() * 2 - 1,
                    dy: Math.random() * 2 - 1
                }
            }];
            sessionStorage.setItem('balls', JSON.stringify(newBalls));
            return newBalls
        }
    }

    const [balls, setBalls] = useState(getBalls());
    const [speed, setSpeed] = useState(getSpeed());

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
        if (balls.length == 100)
            return;
        setBalls((prevBalls: any[]) => [
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
            {balls && (balls.map((ball: any[], index: number) => (<BouncingBall key={index} index={index} speed={speed} balls={balls} setBalls={setBalls}/>)))}
        </>
    );
}
