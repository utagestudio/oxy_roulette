import type { Translation } from '../i18n';
import '../styles/PasteImportDialog.scss';

type PasteImportMode = 'append' | 'replace';

interface PasteImportDialogProps {
  pastedItems: string[];
  onImport: (mode: PasteImportMode) => void;
  onCancel: () => void;
  t: Translation;
}

export const PasteImportDialog = ({ pastedItems, onImport, onCancel, t }: PasteImportDialogProps) => (
  <div className="dialog-backdrop" role="presentation">
    <section className="paste-dialog" role="dialog" aria-modal="true" aria-labelledby="paste-dialog-title">
      <h2 id="paste-dialog-title">{t.pasteDialogTitle}</h2>
      <p>{t.pastedItemsDetected(pastedItems.length)}</p>
      <div className="paste-preview" aria-label={t.pastePreview}>
        {pastedItems.slice(0, 8).map((item, index) => (
          <div key={`${item}-${index}`}>{item}</div>
        ))}
        {pastedItems.length > 8 && <div>{t.moreItems(pastedItems.length - 8)}</div>}
      </div>
      <div className="dialog-actions">
        <button type="button" onClick={() => onImport('append')}>
          {t.append}
        </button>
        <button type="button" onClick={() => onImport('replace')}>
          {t.replace}
        </button>
        <button type="button" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </section>
  </div>
);
