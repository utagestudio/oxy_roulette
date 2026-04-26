import { useState } from 'react';
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
    message,
    addItemsFromText,
    updateStatus,
    removeItem,
    start,
    accept,
  } = useRoulette();

  const [isEditorVisible, setIsEditorVisible] = useState(true);

  const targetItems = items.filter((item) => item.status === 'target');

  const canStart = !isRolling && targetItems.length > 0;

  return (
    <main className="app-root">
      <header className="app-header">
        <h1>ONI 配信用ルーレット</h1>
        <button
          type="button"
          onClick={() => setIsEditorVisible((prev) => !prev)}
          aria-pressed={isEditorVisible}
        >
          {isEditorVisible ? '項目パネルを隠す' : '項目パネルを表示'}
        </button>
      </header>

      <div className={`app-layout ${isEditorVisible ? '' : 'editor-hidden'}`.trim()}>
        <div className="left-column">
          <RouletteGrid targetItems={targetItems} focusedId={focusedId} resultId={resultId} />
          <Controls
            canStart={canStart}
            canAccept={canAccept}
            isRolling={isRolling}
            onStart={start}
            onAccept={accept}
            message={message}
          />
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
