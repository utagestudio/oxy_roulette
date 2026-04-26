import type { Item, Status } from '../types/roulette';

interface ItemEditorProps {
  items: Item[];
  notice: string | null;
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

export const ItemEditor = ({ items, notice, onStatusChange, onRemove }: ItemEditorProps) => (
  <section className="panel item-editor">
    <h2>項目管理</h2>
    {notice && <p className="notice">{notice}</p>}
    <div className="item-list">
      {items.map((item) => (
        <div className="item-row" key={item.id}>
          <span className="item-text" title={item.text}>
            {item.text}
          </span>
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
