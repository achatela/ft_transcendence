interface RemoveBallButtonProps {
  onRemoveBall: () => void;
}

export default function RemoveBallButton({onRemoveBall}: RemoveBallButtonProps): JSX.Element {
  return (
    <button className="removeBallButton" type="button" onClick={onRemoveBall}>
      Remove Ball
    </button>
  );
}
