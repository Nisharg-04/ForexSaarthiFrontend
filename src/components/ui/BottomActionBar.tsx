import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAppSelector } from '../../hooks/useRedux';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

interface ActionBarContextType {
  actions: ActionItem[];
  setActions: (actions: ActionItem[]) => void;
  clearActions: () => void;
}

const ActionBarContext = createContext<ActionBarContextType | null>(null);

export const ActionBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActionsState] = useState<ActionItem[]>([]);

  const setActions = useCallback((newActions: ActionItem[]) => {
    setActionsState(newActions);
  }, []);

  const clearActions = useCallback(() => {
    setActionsState([]);
  }, []);

  return (
    <ActionBarContext.Provider value={{ actions, setActions, clearActions }}>
      {children}
    </ActionBarContext.Provider>
  );
};

export const useActionBar = () => {
  const context = useContext(ActionBarContext);
  if (!context) {
    throw new Error('useActionBar must be used within ActionBarProvider');
  }
  return context;
};

export const BottomActionBar: React.FC = () => {
  const context = useContext(ActionBarContext);
  const theme = useAppSelector((state) => state.ui.theme);
  const actions = context?.actions || [];
  const isDark = theme === 'dark';

  // Don't render if no actions
  if (actions.length === 0) {
    return null;
  }

  const getButtonClasses = (variant: ActionItem['variant'] = 'default', disabled?: boolean) => {
    const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (disabled) {
      return `${baseClasses} ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`;
    }

    if (isDark) {
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 focus:ring-offset-slate-900`;
        case 'danger':
          return `${baseClasses} bg-slate-800 text-red-400 border border-red-800 hover:bg-red-900/30 focus:ring-red-500 focus:ring-offset-slate-900`;
        default:
          return `${baseClasses} bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 focus:ring-slate-500 focus:ring-offset-slate-900`;
      }
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500`;
      case 'danger':
        return `${baseClasses} bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500`;
      default:
        return `${baseClasses} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-500`;
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 border-t shadow-lg ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-3 h-14">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={getButtonClasses(action.variant, action.disabled)}
            >
              {action.icon && <span className="w-4 h-4">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
