import { useEffect, useMemo, useState } from 'react';
import { Controls } from './components/Controls';
import { ItemEditor } from './components/ItemEditor';
import { RouletteGrid } from './components/RouletteGrid';
import { useRoulette } from './hooks/useRoulette';
import { isLocale, LOCALE_STORAGE_KEY, type Locale, translations } from './i18n';
import './styles/app.css';

type PasteImportMode = 'append' | 'replace';

type EditorNotice = {
  mode: PasteImportMode;
  added: number;
  duplicates: string[];
};

const App = () => {
  const {
    items,
    focusedId,
    resultId,
    isRolling,
    canAccept,
    addEmptyItem,
    addItemsFromText,
    updateItemText,
    updateStatus,
    removeItem,
    start,
    accept,
    slots,
    activeSlotId,
    selectSlot,
  } = useRoulette();

  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [locale, setLocale] = useState<Locale>(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(storedLocale) ? storedLocale : 'ja';
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pasteText, setPasteText] = useState<string | null>(null);
  const [editorNotice, setEditorNotice] = useState<EditorNotice | null>(null);
  const t = translations[locale];

  const targetItems = items.filter((item) => item.status === 'target' && item.text.trim().length > 0);
  const pastedItems = useMemo(() => {
    if (!pasteText) {
      return [];
    }

    return pasteText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [pasteText]);

  const resultText = useMemo(() => {
    if (!resultId) {
      return null;
    }

    return items.find((item) => item.id === resultId)?.text ?? null;
  }, [items, resultId]);

  const editorNoticeText = useMemo(() => {
    if (!editorNotice) {
      return null;
    }

    const action = editorNotice.mode === 'append' ? t.appendAction : t.replaceAction;

    if (editorNotice.duplicates.length > 0) {
      return t.importWithDuplicates(action, editorNotice.added, editorNotice.duplicates.join(', '));
    }

    if (editorNotice.added > 0) {
      return t.importAdded(action, editorNotice.added);
    }

    return t.importEmpty(action);
  }, [editorNotice, t]);

  const canStart = !isRolling && targetItems.length > 0;

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.title = t.appTitle;
  }, [locale, t.appTitle]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isRolling || isHelpOpen) {
        return;
      }

      const activeElement = document.activeElement;
      const isEditable =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);

      if (isEditable) {
        return;
      }

      const text = event.clipboardData?.getData('text/plain') ?? '';
      const hasItems = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .some((line) => line.length > 0);

      if (!hasItems) {
        return;
      }

      event.preventDefault();
      setPasteText(text);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isHelpOpen, isRolling]);

  useEffect(() => {
    if (!isHelpOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHelpOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen]);

  const handlePasteImport = (mode: PasteImportMode) => {
    if (!pasteText) {
      return;
    }

    const { added, duplicates } = addItemsFromText(pasteText, mode);
    setEditorNotice({ mode, added, duplicates });

    setPasteText(null);
    setIsEditorVisible(true);
  };

  const handleSlotSelect = (id: string) => {
    selectSlot(id);
    setEditorNotice(null);
  };

  return (
    <main className="app-root">
      <header className="app-header">
        <h1>
          <img className="app-logo" src="/logo.png" alt="Stellar Picker" />
        </h1>
        <nav className="roulette-tabs" aria-label={t.rouletteTabs}>
          {slots.map((slot, index) => {
            const label = t.rouletteSlot(index + 1);
            return (
              <button
                key={slot.id}
                type="button"
                className={`roulette-tab ${slot.id === activeSlotId ? 'active' : ''}`}
                onClick={() => handleSlotSelect(slot.id)}
                aria-pressed={slot.id === activeSlotId}
                disabled={isRolling}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="help-button"
            onClick={() => setIsHelpOpen(true)}
            aria-label={t.openHelp}
            title={t.openHelp}
          >
            ?
          </button>
          <div className="language-switch" role="group" aria-label="Language">
            {(['ja', 'en'] as Locale[]).map((nextLocale) => (
              <button
                key={nextLocale}
                type="button"
                className={`language-button ${locale === nextLocale ? 'active' : ''}`}
                onClick={() => setLocale(nextLocale)}
                aria-pressed={locale === nextLocale}
              >
                {nextLocale.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="panel-toggle-button"
            onClick={() => setIsEditorVisible((prev) => !prev)}
            aria-pressed={isEditorVisible}
            aria-label={isEditorVisible ? t.hideItemPanel : t.showItemPanel}
            title={isEditorVisible ? t.hideItemPanel : t.showItemPanel}
          >
            {isEditorVisible ? '🙈' : '👁️'}
          </button>
        </div>
      </header>

      <div className={`app-layout ${isEditorVisible ? '' : 'editor-hidden'}`.trim()}>
        <div className="left-column">
          <RouletteGrid targetItems={targetItems} focusedId={focusedId} resultId={resultId} />
          <div className="result-controls-row">
            <section
              className={`panel result-display ${resultText ? '' : 'is-empty'}`.trim()}
              aria-live={resultText ? 'polite' : undefined}
              aria-hidden={resultText ? undefined : true}
            >
              <h2>{t.result}</h2>
              <p>{resultText ?? '\u00a0'}</p>
            </section>
            <Controls
              canStart={canStart}
              canAccept={canAccept}
              isRolling={isRolling}
              onStart={start}
              onAccept={accept}
              t={t}
            />
          </div>
        </div>

        {isEditorVisible && (
          <ItemEditor
            key={activeSlotId}
            items={items}
            notice={editorNoticeText}
            onAddEmpty={addEmptyItem}
            onTextChange={updateItemText}
            onStatusChange={updateStatus}
            onRemove={removeItem}
            t={t}
          />
        )}
      </div>

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

      {isHelpOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setIsHelpOpen(false)}>
          <section
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="help-dialog-header">
              <h2 id="help-dialog-title">{t.helpTitle}</h2>
              <button
                type="button"
                className="dialog-close-button"
                onClick={() => setIsHelpOpen(false)}
                aria-label={t.closeHelp}
                title={t.closeHelp}
              >
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
      )}

      {pasteText && (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="paste-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paste-dialog-title"
          >
            <h2 id="paste-dialog-title">{t.pasteDialogTitle}</h2>
            <p>{t.pastedItemsDetected(pastedItems.length)}</p>
            <div className="paste-preview" aria-label={t.pastePreview}>
              {pastedItems.slice(0, 8).map((item, index) => (
                <div key={`${item}-${index}`}>{item}</div>
              ))}
              {pastedItems.length > 8 && <div>{t.moreItems(pastedItems.length - 8)}</div>}
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={() => handlePasteImport('append')}>
                {t.append}
              </button>
              <button type="button" onClick={() => handlePasteImport('replace')}>
                {t.replace}
              </button>
              <button type="button" onClick={() => setPasteText(null)}>
                {t.cancel}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default App;
