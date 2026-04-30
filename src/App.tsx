import { useEffect, useMemo, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { Controls } from './components/Controls';
import { HelpDialog } from './components/HelpDialog';
import { ItemEditor } from './components/ItemEditor';
import { PasteImportDialog } from './components/PasteImportDialog';
import { ResultPanel } from './components/ResultPanel';
import { RouletteGrid } from './components/RouletteGrid';
import { ToastNotice } from './components/ToastNotice';
import { useRoulette } from './hooks/useRoulette';
import { isLocale, LOCALE_STORAGE_KEY, type Locale, translations } from './i18n';
import './styles/app.css';

type PasteImportMode = 'append' | 'replace';

type ToastNotice = (
  | {
      type: 'import';
      mode: PasteImportMode;
      added: number;
      duplicates: string[];
    }
  | {
      type: 'edit-error';
      reason: 'empty' | 'duplicate';
    }
) & {
  id: number;
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
    renameSlot,
  } = useRoulette();

  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [locale, setLocale] = useState<Locale>(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(storedLocale) ? storedLocale : 'ja';
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pasteText, setPasteText] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
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

  const toastText = useMemo(() => {
    if (!toastNotice) {
      return null;
    }

    if (toastNotice.type === 'edit-error') {
      return toastNotice.reason === 'duplicate' ? t.duplicateTextError : t.emptyTextError;
    }

    const action = toastNotice.mode === 'append' ? t.appendAction : t.replaceAction;

    if (toastNotice.duplicates.length > 0) {
      return t.importWithDuplicates(action, toastNotice.added, toastNotice.duplicates.join(', '));
    }

    if (toastNotice.added > 0) {
      return t.importAdded(action, toastNotice.added);
    }

    return t.importEmpty(action);
  }, [toastNotice, t]);

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

  useEffect(() => {
    if (!toastNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToastNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastNotice]);

  const handlePasteImport = (mode: PasteImportMode) => {
    if (!pasteText) {
      return;
    }

    const { added, duplicates } = addItemsFromText(pasteText, mode);
    setToastNotice({ id: Date.now(), type: 'import', mode, added, duplicates });

    setPasteText(null);
    setIsEditorVisible(true);
  };

  const handleSlotSelect = (id: string) => {
    selectSlot(id);
    setToastNotice(null);
  };

  return (
    <main className="app-root">
      <AppHeader
        slots={slots}
        activeSlotId={activeSlotId}
        isRolling={isRolling}
        locale={locale}
        isEditorVisible={isEditorVisible}
        onLocaleChange={setLocale}
        onOpenHelp={() => setIsHelpOpen(true)}
        onToggleEditor={() => setIsEditorVisible((prev) => !prev)}
        onSlotSelect={handleSlotSelect}
        onSlotRename={renameSlot}
        t={t}
      />

      <div className={`app-layout ${isEditorVisible ? '' : 'editor-hidden'}`.trim()}>
        <div className="left-column">
          <RouletteGrid targetItems={targetItems} focusedId={focusedId} resultId={resultId} />
          <div className="result-controls-row">
            <ResultPanel resultText={resultText} t={t} />
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
            onAddEmpty={addEmptyItem}
            onTextChange={updateItemText}
            onStatusChange={updateStatus}
            onRemove={removeItem}
            onEditError={(reason) => setToastNotice({ id: Date.now(), type: 'edit-error', reason })}
            t={t}
          />
        )}
      </div>

      <AppFooter t={t} />

      {toastText && <ToastNotice message={toastText} />}

      {isHelpOpen && <HelpDialog onClose={() => setIsHelpOpen(false)} t={t} />}

      {pasteText && (
        <PasteImportDialog
          pastedItems={pastedItems}
          onImport={handlePasteImport}
          onCancel={() => setPasteText(null)}
          t={t}
        />
      )}
    </main>
  );
};

export default App;
