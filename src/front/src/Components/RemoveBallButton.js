import React from 'react';

export default function RemoveBallButton({ onRemoveBall }) {
  return (
    <button className="removeBallButton" type="button" onClick={onRemoveBall}>
      Remove Ball
    </button>
  );
}