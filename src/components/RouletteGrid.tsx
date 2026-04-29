import type { Item } from '../types/roulette';
import type { Translation } from '../i18n';

interface RouletteGridProps {
  targetItems: Item[];
  focusedId: string | null;
  resultId: string | null;
  t: Translation;
}

const getGridSize = (count: number): { cols: number; rows: number } => {
  if (count <= 1) return { cols: 1, rows: 1 };
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
};

export const RouletteGrid = ({ targetItems, focusedId, resultId, t }: RouletteGridProps) => {
  const { cols, rows } = getGridSize(Math.max(targetItems.length, 1));
  const total = cols * rows;

  return (
    <section className="panel roulette-grid-wrap">
      <div
        className="roulette-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: total }).map((_, index) => {
          const item = targetItems[index];
          if (!item) {
            return (
              <div className="roulette-cell empty" key={`empty-${index}`}>
                {t.emptyCell}
              </div>
            );
          }

          const highlighted = focusedId === item.id;
          const won = resultId === item.id;

          return (
            <div
              className={`roulette-cell ${highlighted ? 'active' : ''} ${won ? 'won' : ''}`.trim()}
              key={item.id}
              title={item.text}
            >
              {item.text}
            </div>
          );
        })}
      </div>
    </section>
  );
};
