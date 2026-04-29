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
      <button type="button" className="control-button" onClick={onStart} disabled={!canStart}>
        <span aria-hidden="true">🚀</span>
        <span>{isRolling ? 'Rolling...' : 'Start'}</span>
      </button>
      <button type="button" className="control-button" onClick={onAccept} disabled={!canAccept}>
        <span aria-hidden="true">✅</span>
        <span>Accept</span>
      </button>
    </div>
  </section>
);
