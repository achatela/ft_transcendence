import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import BouncingBall from './BouncingBall';
import { normalize } from "path";


export default function BouncingBallsUI() {
    const [speed, setSpeed] = useState(() => {
        const sessionSpeed = sessionStorage.getItem('speed');
        if (sessionSpeed)
            return parseInt(sessionSpeed);
        else {
            sessionStorage.setItem('speed', '5');
            return 5;
        }
    });
    const [balls, setBalls] = useState(() => {
        const sessionBalls = sessionStorage.getItem('balls');
        if (sessionBalls)
            return JSON.parse(sessionBalls);
        else {
            const balls = [{
                position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
                direction: { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 }
            }]
            sessionStorage.setItem('balls', JSON.stringify(balls));
            return balls;
        }
    });
    // const [balls, setBalls] = useState([{
    //     position: {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
    //     direction: {dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1}
    // }]);

    useEffect(() => {
        const slider = document.getElementById("myRange");

        slider!.addEventListener("input", () => {
            // @ts-ignore: Object is possibly 'null'.
            const newSpeed = slider.value;
            setSpeed(newSpeed);
            sessionStorage.setItem('speed', newSpeed.toString())
        });

        return () => {
            slider!.removeEventListener("input", () => { });
        };
    }, []);

    function addBall() {
        setBalls((prevBalls: { position: { x: number, y: number }, direction: { dx: number, dy: number } }[]) => [
            ...prevBalls,
            {
                position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
                direction: { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 }
            },
        ]);
        sessionStorage.setItem('balls', JSON.stringify(balls));
    }

    function removeBall() {
        setBalls((prevBalls: { position: { x: number, y: number }, direction: { dx: number, dy: number } }[]) => {
            "accessToken"
            if (prevBalls.length > 0) {
                return prevBalls.slice(0, -1);
            } else {
                return prevBalls;
            }
        });
        sessionStorage.setItem('balls', JSON.stringify(balls));
    }

    return (
        <>
            <div className="bouncing-balls-buttons">
                <button className="addBallButton" type="button" onClick={addBall}>Add Ball</button>
                <button className="removeBallButton" type="button" onClick={removeBall}>Remove Ball</button>
                <input defaultValue={speed} type="range" min="0" max="10" className="slider" id="myRange" />
                <p className="speed">Speed: <b>{speed}</b></p>
            </div>
            {balls.map((ball: { position: { x: number, y: number }, direction: { dx: number, dy: number } }, index: number) => (
                <BouncingBall key={index} index={index} speed={speed} balls={balls} setBalls={setBalls} />
            ))}
        </>
    );
}
