import { useEffect, useRef, useState } from 'react';
import type { Translation } from '../i18n';
import type { Item, Status } from '../types/roulette';

type ItemFilter = 'all' | Status;

interface ItemEditorProps {
  items: Item[];
  notice: string | null;
  onAddEmpty: () => string;
  onTextChange: (id: string, text: string) => { updated: boolean; reason?: 'empty' | 'duplicate' };
  onStatusChange: (id: string, status: Status) => void;
  onRemove: (id: string) => void;
  t: Translation;
}

const STATUS_ICON: Record<Status, string> = {
  inactive: '🚫',
  target: '🎯',
  done: '✅',
};

const FILTER_ICON: Record<ItemFilter, string> = {
  all: '📚',
  inactive: STATUS_ICON.inactive,
  target: STATUS_ICON.target,
  done: STATUS_ICON.done,
};

export const ItemEditor = ({ items, notice, onAddEmpty, onTextChange, onStatusChange, onRemove, t }: ItemEditorProps) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const visibleItems = itemFilter === 'all' ? items : items.filter((item) => item.status === itemFilter);
  const statusLabel: Record<Status, string> = {
    inactive: t.inactive,
    target: t.target,
    done: t.done,
  };
  const filterLabel: Record<ItemFilter, string> = {
    all: t.filterAll,
    target: t.target,
    inactive: t.inactive,
    done: t.done,
  };

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
    setEditNotice(result.reason === 'duplicate' ? t.duplicateTextError : t.emptyTextError);
  };

  return (
    <section className="panel item-editor">
      <div className="item-editor-header">
        <h2>{t.itemManagement}</h2>
        <div className="item-filter-tabs" role="group" aria-label={t.filter}>
          <span className="item-filter-label" aria-hidden="true" title={t.filter}>
            🔎
          </span>
          {(Object.keys(filterLabel) as ItemFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              className={`item-filter-button ${itemFilter === filter ? 'active' : ''}`}
              onClick={() => setItemFilter(filter)}
              aria-label={t.showFilter(filterLabel[filter])}
              aria-pressed={itemFilter === filter}
              title={filterLabel[filter]}
            >
              <span aria-hidden="true">{FILTER_ICON[filter]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="add-item-button"
          onClick={() => {
            const id = onAddEmpty();
            setDrafts((prev) => ({ ...prev, [id]: '' }));
            setFocusItemId(id);
            setEditNotice(null);
          }}
          aria-label={t.addEmptyItem}
          title={t.addEmptyItem}
        >
          +
        </button>
      </div>
      {(editNotice || notice) && <p className="notice">{editNotice ?? notice}</p>}
      <div className="item-list">
        {visibleItems.length === 0 && <p className="empty-list-message">{t.noFilteredItems}</p>}
        {visibleItems.map((item) => (
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
              aria-label={t.itemText}
              title={item.text}
            />
            <div className="status-buttons" role="group" aria-label={t.statusGroup}>
              {(Object.keys(statusLabel) as Status[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`status-button ${item.status === status ? 'active' : ''}`}
                  onClick={() => onStatusChange(item.id, status)}
                  aria-label={t.changeStatus(statusLabel[status])}
                  title={statusLabel[status]}
                >
                  <span aria-hidden="true">{STATUS_ICON[status]}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={() => {
                const confirmed = window.confirm(t.deleteConfirm(item.text));
                if (confirmed) {
                  onRemove(item.id);
                }
              }}
              aria-label={t.deleteItem}
              title={t.delete}
            >
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
