import { useEffect, useRef, useState } from 'react';
import type { Locale, Translation } from '../i18n';
import type { Theme } from '../theme';
import type { RouletteSlot } from '../types/roulette';
import '../styles/AppHeader.scss';

interface AppHeaderProps {
  slots: RouletteSlot[];
  activeSlotId: string;
  isRolling: boolean;
  locale: Locale;
  theme: Theme;
  isEditorVisible: boolean;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (theme: Theme) => void;
  onOpenHelp: () => void;
  onToggleEditor: () => void;
  onSlotSelect: (id: string) => void;
  onSlotRename: (id: string, name: string) => boolean;
  t: Translation;
}

const LOCALES: Locale[] = ['ja', 'en'];
const THEMES: Theme[] = ['light', 'dark'];

export const AppHeader = ({
  slots,
  activeSlotId,
  isRolling,
  locale,
  theme,
  isEditorVisible,
  onLocaleChange,
  onThemeChange,
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
        <img className="app-logo" src="/logo.png" alt={t.logoAlt} />
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
        <div className="theme-switch" role="group" aria-label={t.theme}>
          {THEMES.map((nextTheme) => {
            const label = nextTheme === 'light' ? t.lightTheme : t.darkTheme;

            return (
              <button
                key={nextTheme}
                type="button"
                className={`theme-button ${theme === nextTheme ? 'active' : ''}`}
                onClick={() => onThemeChange(nextTheme)}
                aria-label={label}
                aria-pressed={theme === nextTheme}
                title={label}
              >
                {nextTheme === 'light' ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M20.4 15.4A8.2 8.2 0 0 1 8.6 3.6 8.7 8.7 0 1 0 20.4 15.4Z" />
                  </svg>
                )}
              </button>
            );
          })}
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
