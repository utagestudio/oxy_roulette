import type { Translation } from '../i18n';
import '../styles/ConsentBanner.scss';

interface ConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
  t: Translation;
}

export const ConsentBanner = ({ onAccept, onReject, t }: ConsentBannerProps) => (
  <section className="consent-banner" aria-label={t.privacySettings}>
    <div className="consent-banner-text">
      <h2>{t.consentTitle}</h2>
      <p>{t.consentDescription}</p>
    </div>
    <div className="consent-banner-actions">
      <button type="button" className="consent-button secondary" onClick={onReject}>
        {t.consentReject}
      </button>
      <button type="button" className="consent-button primary" onClick={onAccept}>
        {t.consentAccept}
      </button>
    </div>
  </section>
);
