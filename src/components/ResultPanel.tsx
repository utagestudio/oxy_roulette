import type { Translation } from '../i18n';

interface ResultPanelProps {
  resultText: string | null;
  t: Translation;
}

export const ResultPanel = ({ resultText, t }: ResultPanelProps) => (
  <section
    className={`panel result-display ${resultText ? '' : 'is-empty'}`.trim()}
    aria-live={resultText ? 'polite' : undefined}
    aria-hidden={resultText ? undefined : true}
  >
    <h2>{t.result}</h2>
    <p>{resultText ?? '\u00a0'}</p>
  </section>
);
