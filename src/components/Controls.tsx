import type { Translation } from '../i18n';
import '../styles/Controls.scss';

interface ControlsProps {
  canStart: boolean;
  canAccept: boolean;
  isRolling: boolean;
  onStart: () => void;
  onAccept: () => void;
  t: Translation;
}

export const Controls = ({
  canStart,
  canAccept,
  isRolling,
  onStart,
  onAccept,
  t,
}: ControlsProps) => (
  <section className="panel controls">
    <div className="button-row">
      <button type="button" className="control-button" onClick={onStart} disabled={!canStart}>
        <span aria-hidden="true">🚀</span>
        <span>{isRolling ? t.rolling : t.start}</span>
      </button>
      <button type="button" className="control-button" onClick={onAccept} disabled={!canAccept}>
        <span aria-hidden="true">✅</span>
        <span>{t.accept}</span>
      </button>
    </div>
  </section>
);
