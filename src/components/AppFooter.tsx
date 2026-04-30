import type { Translation } from '../i18n';
import '../styles/AppFooter.css';

interface AppFooterProps {
  t: Translation;
}

export const AppFooter = ({ t }: AppFooterProps) => (
  <footer className="app-footer">
    <span>© 2026 UTAGE.GAMES</span>
    <a href="https://x.com/utage_studio" target="_blank" rel="noreferrer">
      X
    </a>
    <a href="https://youtube.com/c/utagegames/" target="_blank" rel="noreferrer">
      YouTube
    </a>
    <span aria-hidden="true">-</span>
    <a href="https://github.com/utagestudio/oxy_roulette/issues" target="_blank" rel="noreferrer">
      {t.issueLink}
    </a>
  </footer>
);
