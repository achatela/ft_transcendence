interface AddBallButtonProps {
  onAddBall: () => void;
}

export default function AddBallButton({onAddBall}: AddBallButtonProps): JSX.Element {
  return (
    <button className="addBallButton" type="button" onClick={onAddBall}>
      Add Ball
    </button>
  );
}