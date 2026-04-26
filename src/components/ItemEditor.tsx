import { useEffect, useRef, useState } from 'react';
import type { Item, Status } from '../types/roulette';

interface ItemEditorProps {
  items: Item[];
  notice: string | null;
  onAddEmpty: () => string;
  onTextChange: (id: string, text: string) => { updated: boolean; reason?: 'empty' | 'duplicate' };
  onStatusChange: (id: string, status: Status) => void;
  onRemove: (id: string) => void;
}

const STATUS_LABEL: Record<Status, string> = {
  inactive: '非対象',
  target: '対象',
  done: '抽選済み',
};

const STATUS_ICON: Record<Status, string> = {
  inactive: '🚫',
  target: '🎯',
  done: '✅',
};

export const ItemEditor = ({ items, notice, onAddEmpty, onTextChange, onStatusChange, onRemove }: ItemEditorProps) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!focusItemId) {
      return;
    }

    const input = inputRefs.current[focusItemId];
    if (!input) {
      return;
    }

    input.focus();
    input.select();
    setFocusItemId(null);
  }, [focusItemId, items]);

  const commitText = (item: Item): void => {
    const draft = drafts[item.id] ?? item.text;
    const result = onTextChange(item.id, draft);

    if (result.updated) {
      setDrafts((prev) => ({ ...prev, [item.id]: draft.trim() }));
      setEditNotice(null);
      return;
    }

    setDrafts((prev) => ({ ...prev, [item.id]: item.text }));
    setEditNotice(result.reason === 'duplicate' ? '同じテキストの項目は登録できません。' : '空の項目名は登録できません。');
  };

  return (
    <section className="panel item-editor">
      <div className="item-editor-header">
        <h2>項目管理</h2>
        <button
          type="button"
          className="add-item-button"
          onClick={() => {
            const id = onAddEmpty();
            setDrafts((prev) => ({ ...prev, [id]: '' }));
            setFocusItemId(id);
            setEditNotice(null);
          }}
          aria-label="空の項目を追加"
          title="空の項目を追加"
        >
          +
        </button>
      </div>
      {(editNotice || notice) && <p className="notice">{editNotice ?? notice}</p>}
      <div className="item-list">
        {items.map((item) => (
          <div className="item-row" key={item.id}>
            <input
              ref={(element) => {
                inputRefs.current[item.id] = element;
              }}
              className="item-text-input"
              type="text"
              value={drafts[item.id] ?? item.text}
              onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))}
              onBlur={() => commitText(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }

                if (event.key === 'Escape') {
                  setDrafts((prev) => ({ ...prev, [item.id]: item.text }));
                  event.currentTarget.blur();
                }
              }}
              aria-label="項目テキスト"
              title={item.text}
            />
            <div className="status-buttons" role="group" aria-label="状態切り替え">
              {(Object.keys(STATUS_LABEL) as Status[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`status-button ${item.status === status ? 'active' : ''}`}
                  onClick={() => onStatusChange(item.id, status)}
                  aria-label={`状態を${STATUS_LABEL[status]}に変更`}
                  title={STATUS_LABEL[status]}
                >
                  <span aria-hidden="true">{STATUS_ICON[status]}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => {
                const confirmed = window.confirm(`「${item.text}」を削除しますか？`);
                if (confirmed) {
                  onRemove(item.id);
                }
              }}
              aria-label="項目を削除"
              title="削除"
            >
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
