import React, { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth, useAppSelector } from '../hooks/useRedux';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Navbar } from '../components/ui/Navbar';
import { DashboardSidebar } from '../components/ui/DashboardSidebar';
import { BottomActionBar } from '../components/ui/BottomActionBar';
import { KeyboardShortcutsModal } from '../components/ui/KeyboardShortcutsModal';
import { cn } from '../utils/helpers';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { isAuthenticated, activeCompany } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowShortcutsHelp(true);
  }, []);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: handleToggleSidebar,
    onShowHelp: handleShowHelp,
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to company select if no active company
  if (!activeCompany) {
    return <Navigate to="/dashboard/select-company" replace />;
  }

  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      isDark ? 'bg-slate-950' : 'bg-slate-50'
    )}>
      {/* Common Navbar */}
      <Navbar />

      {/* Mobile Sidebar Toggle */}
      <div className={cn(
        'lg:hidden fixed top-16 left-0 right-0 z-30 px-4 py-2 border-b',
        isDark 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200'
      )}>
        <button
          onClick={handleToggleSidebar}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            isDark
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">Menu</span>
        </button>
      </div>

      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar} 
      />

      {/* Main Content Area */}
      <main className={cn(
        'flex-1 pt-16 pb-16 transition-all duration-300',
        // Add padding for mobile menu bar
        'max-lg:pt-28',
        // Adjust left margin based on sidebar state
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Action Bar */}
      <BottomActionBar />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  );
};
