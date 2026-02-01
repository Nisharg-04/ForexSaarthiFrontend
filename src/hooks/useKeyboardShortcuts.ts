import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './useRedux';

// Navigation items with hotkey characters (Shift + letter)
export const NAV_ITEMS_WITH_HOTKEYS = [
  { path: '/dashboard', label: 'Overview', hotkey: 'O' },
  { path: '/dashboard/trades', label: 'Trades', hotkey: 'T' },
  { path: '/dashboard/invoices', label: 'Invoices', hotkey: 'I' },
  { path: '/dashboard/exposure', label: 'Exposure', hotkey: 'E' },
  { path: '/dashboard/payments', label: 'Payments', hotkey: 'Y' }, // Shift+Y for Payments
  { path: '/dashboard/parties', label: 'Parties', hotkey: 'R' }, // Shift+R for Parties
];

export const ADMIN_ITEMS_WITH_HOTKEYS = [
  { path: '/dashboard/company/edit', label: 'Company Settings', hotkey: 'C' }, // Shift+C
  { path: '/dashboard/company/users', label: 'Manage Users', hotkey: 'U' }, // Shift+U
];

// Shortcut definitions for help modal
export const SHORTCUT_DEFINITIONS = {
  navigation: NAV_ITEMS_WITH_HOTKEYS.map(item => ({
    key: item.hotkey,
    path: item.path,
    description: `Go to ${item.label}`,
    label: `Shift + ${item.hotkey}`,
  })),
  admin: ADMIN_ITEMS_WITH_HOTKEYS.map(item => ({
    key: item.hotkey,
    path: item.path,
    description: item.label,
    label: `Shift + ${item.hotkey}`,
  })),
  general: [
    { key: 'B', action: 'toggleSidebar', description: 'Toggle Sidebar', label: 'Ctrl + B' },
    { key: '?', action: 'help', description: 'Show Keyboard Shortcuts', label: '?' },
    { key: 'Escape', action: 'close', description: 'Close Modal / Cancel', label: 'Esc' },
  ],
};

interface UseKeyboardShortcutsOptions {
  onShowHelp?: () => void;
  onToggleSidebar?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const activeCompany = useAppSelector((state) => state.auth.activeCompany);

  const {
    onShowHelp,
    onToggleSidebar,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                         target.isContentEditable;
    
    // Allow some shortcuts even in input fields
    const allowInInput = ['Escape'].includes(event.key);
    
    if (isInputField && !allowInInput) {
      return;
    }

    // Only handle shortcuts if authenticated and on dashboard
    if (!isAuthenticated || !location.pathname.startsWith('/dashboard')) {
      return;
    }

    const key = event.key.toUpperCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const alt = event.altKey;
    const shift = event.shiftKey;

    // Ctrl + B for sidebar toggle
    if (ctrl && !shift && !alt && key === 'B') {
      event.preventDefault();
      onToggleSidebar?.();
      return;
    }

    // ? key for help (no modifiers needed)
    if (event.key === '?') {
      event.preventDefault();
      onShowHelp?.();
      return;
    }

    // Shift + letter for navigation
    if (shift && !ctrl && !alt && activeCompany) {
      const allItems = [...NAV_ITEMS_WITH_HOTKEYS, ...ADMIN_ITEMS_WITH_HOTKEYS];
      const match = allItems.find(item => item.hotkey === key);
      if (match) {
        event.preventDefault();
        navigate(match.path);
        return;
      }
    }
  }, [navigate, location, isAuthenticated, activeCompany, onShowHelp, onToggleSidebar]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: SHORTCUT_DEFINITIONS,
  };
};

export default useKeyboardShortcuts;
