import { useEffect, useRef, useState } from 'react';
import type { Locale, Translation } from '../i18n';
import type { RouletteSlot } from '../types/roulette';

interface AppHeaderProps {
  slots: RouletteSlot[];
  activeSlotId: string;
  isRolling: boolean;
  locale: Locale;
  isEditorVisible: boolean;
  onLocaleChange: (locale: Locale) => void;
  onOpenHelp: () => void;
  onToggleEditor: () => void;
  onSlotSelect: (id: string) => void;
  onSlotRename: (id: string, name: string) => boolean;
  t: Translation;
}

const LOCALES: Locale[] = ['ja', 'en'];

export const AppHeader = ({
  slots,
  activeSlotId,
  isRolling,
  locale,
  isEditorVisible,
  onLocaleChange,
  onOpenHelp,
  onToggleEditor,
  onSlotSelect,
  onSlotRename,
  t,
}: AppHeaderProps) => {
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotNameDraft, setSlotNameDraft] = useState('');
  const slotNameInputRef = useRef<HTMLInputElement | null>(null);
  const skipSlotNameCommitRef = useRef(false);

  useEffect(() => {
    if (!editingSlotId) {
      return;
    }

    slotNameInputRef.current?.focus();
    slotNameInputRef.current?.select();
  }, [editingSlotId]);

  const startSlotNameEdit = (id: string, name: string): void => {
    if (isRolling) {
      return;
    }

    skipSlotNameCommitRef.current = false;
    setEditingSlotId(id);
    setSlotNameDraft(name);
  };

  const cancelSlotNameEdit = (): void => {
    skipSlotNameCommitRef.current = true;
    setEditingSlotId(null);
    setSlotNameDraft('');
  };

  const commitSlotNameEdit = (): void => {
    if (skipSlotNameCommitRef.current) {
      skipSlotNameCommitRef.current = false;
      return;
    }

    if (!editingSlotId) {
      return;
    }

    const updated = onSlotRename(editingSlotId, slotNameDraft);
    if (updated) {
      cancelSlotNameEdit();
    }
  };

  return (
    <header className="app-header">
      <h1>
        <img className="app-logo" src="/logo.png" alt="Stellar Picker" />
      </h1>
      <nav className="roulette-tabs" aria-label={t.rouletteTabs}>
        {slots.map((slot, index) => {
          const label = slot.name.trim().length > 0 ? slot.name : t.rouletteSlot(index + 1);
          const isEditing = editingSlotId === slot.id;

          return (
            <div className="roulette-tab-wrap" key={slot.id}>
              {isEditing ? (
                <input
                  ref={slotNameInputRef}
                  className="roulette-tab-input"
                  type="text"
                  value={slotNameDraft}
                  onChange={(event) => setSlotNameDraft(event.target.value)}
                  onBlur={commitSlotNameEdit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }

                    if (event.key === 'Escape') {
                      cancelSlotNameEdit();
                    }
                  }}
                  aria-label={t.renameRouletteSlot}
                />
              ) : (
                <button
                  type="button"
                  className={`roulette-tab ${slot.id === activeSlotId ? 'active' : ''}`}
                  onClick={() => onSlotSelect(slot.id)}
                  onDoubleClick={() => startSlotNameEdit(slot.id, label)}
                  aria-pressed={slot.id === activeSlotId}
                  disabled={isRolling}
                  title={`${label} / ${t.renameRouletteSlot}`}
                >
                  <span className="roulette-tab-label">{label}</span>
                  <span className="roulette-tab-edit-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" focusable="false">
                      <path d="M3 11.5 3.6 13l1.5-.6 6.8-6.8-2.1-2.1L3 10.3v1.2Z" />
                      <path d="m10.7 2.6.7-.7a1 1 0 0 1 1.4 0l1.3 1.3a1 1 0 0 1 0 1.4l-.7.7-2.7-2.7Z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </nav>
      <div className="header-actions">
        <button type="button" className="help-button" onClick={onOpenHelp} aria-label={t.openHelp} title={t.openHelp}>
          ?
        </button>
        <div className="language-switch" role="group" aria-label="Language">
          {LOCALES.map((nextLocale) => (
            <button
              key={nextLocale}
              type="button"
              className={`language-button ${locale === nextLocale ? 'active' : ''}`}
              onClick={() => onLocaleChange(nextLocale)}
              aria-pressed={locale === nextLocale}
            >
              {nextLocale.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="panel-toggle-button"
          onClick={onToggleEditor}
          aria-pressed={isEditorVisible}
          aria-label={isEditorVisible ? t.hideItemPanel : t.showItemPanel}
          title={isEditorVisible ? t.hideItemPanel : t.showItemPanel}
        >
          {isEditorVisible ? '🙈' : '👁️'}
        </button>
      </div>
    </header>
  );
};
