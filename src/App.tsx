import { useMemo, useState } from 'react';
import { Controls } from './components/Controls';
import { ItemEditor } from './components/ItemEditor';
import { RouletteGrid } from './components/RouletteGrid';
import { useRoulette } from './hooks/useRoulette';
import './styles/app.css';

const App = () => {
  const {
    items,
    focusedId,
    resultId,
    isRolling,
    canAccept,
    addItemsFromText,
    updateStatus,
    removeItem,
    start,
    accept,
  } = useRoulette();

  const [isEditorVisible, setIsEditorVisible] = useState(true);

  const targetItems = items.filter((item) => item.status === 'target');

  const resultText = useMemo(() => {
    if (!resultId) {
      return null;
    }

    return items.find((item) => item.id === resultId)?.text ?? null;
  }, [items, resultId]);

  const canStart = !isRolling && targetItems.length > 0;

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
            onAdd={addItemsFromText}
            onStatusChange={updateStatus}
            onRemove={removeItem}
          />
        )}
      </div>
    </main>
  );
};

export default App;
