import React from 'react';

export default function AddBallButton({ onAddBall, loginDiv, speed }) {
  return (
    <button className="addBallButton" type="button" onClick={onAddBall}>
      Add Ball
    </button>
  );
}
