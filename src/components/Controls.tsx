interface ControlsProps {
  canStart: boolean;
  canAccept: boolean;
  isRolling: boolean;
  onStart: () => void;
  onAccept: () => void;
}

export const Controls = ({
  canStart,
  canAccept,
  isRolling,
  onStart,
  onAccept,
}: ControlsProps) => (
  <section className="panel controls">
    <h2>操作</h2>
    <div className="button-row">
      <button type="button" onClick={onStart} disabled={!canStart}>
        {isRolling ? 'Rolling...' : 'Start'}
      </button>
      <button type="button" onClick={onAccept} disabled={!canAccept}>
        Accept
      </button>
    </div>
  </section>
);
