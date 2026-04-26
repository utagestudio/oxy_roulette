interface ControlsProps {
  canStart: boolean;
  canAccept: boolean;
  isRolling: boolean;
  onStart: () => void;
  onAccept: () => void;
  message: string | null;
}

export const Controls = ({
  canStart,
  canAccept,
  isRolling,
  onStart,
  onAccept,
  message,
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
    {message && <p className="notice">{message}</p>}
  </section>
);
