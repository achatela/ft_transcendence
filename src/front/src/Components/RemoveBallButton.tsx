interface RemoveBallButtonProps {
  onRemoveBall: () => void;
}

export default function RemoveBallButton(onclick: RemoveBallButtonProps): JSX.Element {
  return (
    <button className="removeBallButton" type="button">
      Remove Ball
    </button>
  );
}