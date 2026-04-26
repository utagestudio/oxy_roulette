import { useEffect, useMemo, useState } from 'react';
import { Controls } from './components/Controls';
import { ItemEditor } from './components/ItemEditor';
import { RouletteGrid } from './components/RouletteGrid';
import { useRoulette } from './hooks/useRoulette';
import './styles/app.css';

type PasteImportMode = 'append' | 'replace';

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
  } = useRoulette();

  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [pasteText, setPasteText] = useState<string | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

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

  const canStart = !isRolling && targetItems.length > 0;

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isRolling) {
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
  }, [isRolling]);

  const handlePasteImport = (mode: PasteImportMode) => {
    if (!pasteText) {
      return;
    }

    const { added, duplicates } = addItemsFromText(pasteText, mode);
    const action = mode === 'append' ? '追記' : '新規作成';

    if (duplicates.length > 0) {
      setEditorNotice(`${action}: ${added} 件追加。重複のため除外: ${duplicates.join(', ')}`);
    } else if (added > 0) {
      setEditorNotice(`${action}: ${added} 件追加しました。`);
    } else {
      setEditorNotice(`${action}: 追加できる項目がありませんでした。`);
    }

    setPasteText(null);
    setIsEditorVisible(true);
  };

  return (
    <main className="app-root">
      <header className="app-header">
        <h1>ONI 配信用ルーレット</h1>
        <button
          type="button"
          className="panel-toggle-button"
          onClick={() => setIsEditorVisible((prev) => !prev)}
          aria-pressed={isEditorVisible}
          aria-label={isEditorVisible ? '項目パネルを隠す' : '項目パネルを表示'}
          title={isEditorVisible ? '項目パネルを隠す' : '項目パネルを表示'}
        >
          {isEditorVisible ? '🙈' : '👁️'}
        </button>
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
              <h2>抽選結果</h2>
              <p>{resultText ?? '\u00a0'}</p>
            </section>
            <Controls
              canStart={canStart}
              canAccept={canAccept}
              isRolling={isRolling}
              onStart={start}
              onAccept={accept}
            />
          </div>
        </div>

        {isEditorVisible && (
          <ItemEditor
            items={items}
            notice={editorNotice}
            onAddEmpty={addEmptyItem}
            onTextChange={updateItemText}
            onStatusChange={updateStatus}
            onRemove={removeItem}
          />
        )}
      </div>

      {pasteText && (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="paste-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paste-dialog-title"
          >
            <h2 id="paste-dialog-title">貼り付けた項目を追加しますか？</h2>
            <p>{pastedItems.length} 件の項目を検出しました。</p>
            <div className="paste-preview" aria-label="貼り付け内容のプレビュー">
              {pastedItems.slice(0, 8).map((item, index) => (
                <div key={`${item}-${index}`}>{item}</div>
              ))}
              {pastedItems.length > 8 && <div>...ほか {pastedItems.length - 8} 件</div>}
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={() => handlePasteImport('append')}>
                追記
              </button>
              <button type="button" onClick={() => handlePasteImport('replace')}>
                新規
              </button>
              <button type="button" onClick={() => setPasteText(null)}>
                キャンセル
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default App;
