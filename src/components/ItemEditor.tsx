import { useState } from 'react';
import type { Item, Status } from '../types/roulette';

interface ItemEditorProps {
  items: Item[];
  onAdd: (text: string) => { added: number; duplicates: string[] };
  onStatusChange: (id: string, status: Status) => void;
  onRemove: (id: string) => void;
}

const STATUS_LABEL: Record<Status, string> = {
  inactive: '非対象',
  target: '対象',
  done: '抽選済み',
};

export const ItemEditor = ({ items, onAdd, onStatusChange, onRemove }: ItemEditorProps) => {
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAdd = () => {
    const { added, duplicates } = onAdd(input);
    if (added > 0) {
      setInput('');
    }

    if (duplicates.length > 0) {
      setNotice(`重複のため追加されなかった項目: ${duplicates.join(', ')}`);
      return;
    }

    if (added > 0) {
      setNotice(`${added} 件追加しました。`);
      return;
    }

    setNotice('追加できる項目がありませんでした。');
  };

  return (
    <section className="panel item-editor">
      <h2>項目入力・管理</h2>
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={'1行1項目で入力\n複数行ペースト対応'}
        rows={6}
      />
      <button type="button" onClick={handleAdd}>追加</button>
      {notice && <p className="notice">{notice}</p>}

      <div className="item-list">
        {items.map((item) => (
          <div className="item-row" key={item.id}>
            <span className="item-text" title={item.text}>{item.text}</span>
            <div className="status-buttons" role="group" aria-label="状態切り替え">
              {(Object.keys(STATUS_LABEL) as Status[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`status-button ${item.status === status ? 'active' : ''}`}
                  onClick={() => onStatusChange(item.id, status)}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => onRemove(item.id)}>削除</button>
          </div>
        ))}
      </div>
    </section>
  );
};
