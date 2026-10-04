import type { Locale, Translation } from '../i18n';
import '../styles/AppFooter.scss';

interface AppFooterProps {
  t: Translation;
  locale: Locale;
}

export const AppFooter = ({ t, locale }: AppFooterProps) => (
  <footer className="app-footer">
    <span>© 2026 UTAGE.GAMES</span>
    <a href="https://x.com/utage_studio" target="_blank" rel="noreferrer">
      X
    </a>
    <a href="https://youtube.com/c/utagegames/" target="_blank" rel="noreferrer">
      YouTube
    </a>
    <span aria-hidden="true">-</span>
    <span>
      <a
        href={`https://tally.so/r/${locale === 'ja' ? 'kdVdDR' : 'KYqY78'}?product=${encodeURIComponent('Stellar Picker')}`}
        target="_blank"
        rel="noreferrer"
      >
        {t.contactLink}
      </a>
    </span>
    <a href="https://github.com/utagestudio/oxy_roulette/issues" target="_blank" rel="noreferrer">
      {t.issueLink}
    </a>
  </footer>
);
