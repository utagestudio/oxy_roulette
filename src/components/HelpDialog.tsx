import type { Translation } from '../i18n';
import '../styles/HelpDialog.scss';

interface HelpDialogProps {
  onClose: () => void;
  t: Translation;
}

export const HelpDialog = ({ onClose, t }: HelpDialogProps) => (
  <div className="dialog-backdrop" role="presentation" onClick={onClose}>
    <section
      className="help-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-dialog-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="help-dialog-header">
        <h2 id="help-dialog-title">{t.helpTitle}</h2>
        <button type="button" className="dialog-close-button" onClick={onClose} aria-label={t.closeHelp} title={t.closeHelp}>
          ×
        </button>
      </div>
      <p className="help-intro">{t.helpIntro}</p>
      <ol className="help-list">
        {t.helpSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h3>{t.helpTipsTitle}</h3>
      <ul className="help-list">
        {t.helpTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  </div>
);
