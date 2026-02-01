import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { cn } from '../../utils/helpers';
import { NAV_ITEMS_WITH_HOTKEYS, ADMIN_ITEMS_WITH_HOTKEYS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutKey: React.FC<{ keys: string[]; isDark: boolean }> = ({ keys, isDark }) => {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd
            className={cn(
              'px-2 py-1 text-xs font-semibold rounded border min-w-[28px] text-center',
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            )}
          >
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ShortcutRow: React.FC<{
  keys: string[];
  description: string;
  isDark: boolean;
}> = ({ keys, description, isDark }) => (
  <div
    className={cn(
      'flex items-center justify-between py-2 px-3 rounded-lg',
      isDark ? 'bg-slate-800/50' : 'bg-slate-50'
    )}
  >
    <span className={cn(
      'text-sm',
      isDark ? 'text-slate-300' : 'text-slate-600'
    )}>
      {description}
    </span>
    <ShortcutKey keys={keys} isDark={isDark} />
  </div>
);

const ShortcutSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}> = ({ title, children, isDark }) => (
  <div className="mb-6">
    <h3 className={cn(
      'text-sm font-semibold uppercase tracking-wider mb-3',
      isDark ? 'text-cyan-400' : 'text-teal-600'
    )}>
      {title}
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl transform transition-all',
            isDark ? 'bg-slate-900' : 'bg-white'
          )}
        >
          {/* Header */}
          <div className={cn(
            'sticky top-0 flex items-center justify-between px-6 py-4 border-b z-10',
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                isDark ? 'bg-cyan-500/10' : 'bg-teal-50'
              )}>
                <Keyboard className={cn(
                  'w-5 h-5',
                  isDark ? 'text-cyan-400' : 'text-teal-600'
                )} />
              </div>
              <div>
                <h2 className={cn(
                  'text-lg font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  Keyboard Shortcuts
                </h2>
                <p className={cn(
                  'text-xs',
                  isDark ? 'text-slate-500' : 'text-slate-500'
                )}>
                  Press <kbd className={cn(
                    'px-1.5 py-0.5 text-xs rounded',
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                  )}>?</kbd> to open this help
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6">
            {/* Navigation Shortcuts */}
            <ShortcutSection title="Navigation" isDark={isDark}>
              {NAV_ITEMS_WITH_HOTKEYS.map((item) => (
                <ShortcutRow
                  key={item.hotkey}
                  keys={['Shift', item.hotkey]}
                  description={`Go to ${item.label}`}
                  isDark={isDark}
                />
              ))}
            </ShortcutSection>

            {/* Admin Shortcuts */}
            <ShortcutSection title="Admin (requires admin role)" isDark={isDark}>
              {ADMIN_ITEMS_WITH_HOTKEYS.map((item) => (
                <ShortcutRow
                  key={item.hotkey}
                  keys={['Shift', item.hotkey]}
                  description={item.label}
                  isDark={isDark}
                />
              ))}
            </ShortcutSection>

            {/* Help */}
            <ShortcutSection title="General" isDark={isDark}>
              <ShortcutRow
                keys={['Ctrl', 'B']}
                description="Toggle Sidebar"
                isDark={isDark}
              />
              <ShortcutRow
                keys={['?']}
                description="Show this help"
                isDark={isDark}
              />
            </ShortcutSection>

            {/* Footer tip */}
            <div className={cn(
              'mt-6 pt-4 border-t text-center',
              isDark ? 'border-slate-800' : 'border-slate-200'
            )}>
              <p className={cn(
                'text-xs',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}>
                💡 Tip: Shortcuts are disabled when typing in input fields
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
