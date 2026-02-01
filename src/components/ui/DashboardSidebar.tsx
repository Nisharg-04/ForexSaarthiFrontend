import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Activity,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCog,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { useAuth } from '../../hooks/useRedux';
import { CompanySwitcher } from './CompanySwitcher';
import { cn } from '../../utils/helpers';
import { UserRole } from '../../types';


// underlineIndices: array of character indices to underline in the label
const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, hotkey: 'O', underlineIndices: [0] },
  { path: '/dashboard/trades', label: 'Trades', icon: TrendingUp, hotkey: 'T', underlineIndices: [0] },
  { path: '/dashboard/invoices', label: 'Invoices', icon: FileText, hotkey: 'I', underlineIndices: [0] },
  { path: '/dashboard/exposure', label: 'Exposure', icon: Activity, hotkey: 'E', underlineIndices: [0] },
  { path: '/dashboard/payments', label: 'Payments', icon: CreditCard, hotkey: 'PY', underlineIndices: [0, 2] }, // P and Y underlined
  { path: '/dashboard/parties', label: 'Parties', icon: Users, hotkey: 'PR', underlineIndices: [0, 2] }, // P and R underlined
];

const adminItems = [
  { path: '/dashboard/company/edit', label: 'Company Settings', icon: Building2, hotkey: 'C', underlineIndices: [0] },
  { path: '/dashboard/company/users', label: 'Manage Users', icon: UserCog, hotkey: 'U', underlineIndices: [7] }, // Manage "U"sers
];

// Helper component to render label with underlined hotkey characters
const HotkeyLabel: React.FC<{
  label: string;
  underlineIndices: number[];
  isDark: boolean;
}> = ({ label, underlineIndices, isDark }) => {
  const underlineSet = new Set(underlineIndices);
  
  return (
    <span className="text-sm font-medium truncate">
      {label.split('').map((char, index) => (
        underlineSet.has(index) ? (
          <span
            key={index}
            className={cn(
              'underline decoration-2 underline-offset-2',
              isDark ? 'decoration-cyan-400' : 'decoration-teal-600'
            )}
          >
            {char}
          </span>
        ) : (
          <span key={index}>{char}</span>
        )
      ))}
    </span>
  );
};

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onToggle }) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const { activeCompany } = useAuth();
  const isDark = theme === 'dark';
  const isAdmin = activeCompany?.role === UserRole.ADMIN;
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out',
          isDark 
            ? 'bg-slate-900 border-r border-slate-800' 
            : 'bg-white border-r border-slate-200',
          isOpen ? 'w-64' : 'w-16',
          // Mobile: full width when open, hidden when closed
          'lg:translate-x-0',
          !isOpen && 'max-lg:-translate-x-full'
        )}
      >
        {/* Company Switcher - Only visible when sidebar is expanded */}
        {isOpen && (
          <div className={cn(
            'p-4 border-b',
            isDark ? 'border-slate-800' : 'border-slate-200'
          )}>
            <CompanySwitcher />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? isDark 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                        : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                      !isOpen && 'justify-center'
                    )
                  }
                  title={!isOpen ? `${item.label} (Shift+${item.hotkey})` : undefined}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', !isOpen && 'w-6 h-6')} />
                  {isOpen && (
                    <span className="flex-1">
                      <HotkeyLabel 
                        label={item.label} 
                        underlineIndices={item.underlineIndices}
                        isDark={isDark}
                      />
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className={cn(
              'mt-6 pt-6 px-3 space-y-1 border-t',
              isDark ? 'border-slate-800' : 'border-slate-200'
            )}>
              {isOpen && (
                <p className={cn(
                  'px-3 mb-2 text-xs font-semibold uppercase tracking-wider',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}>
                  Admin
                </p>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                        isActive
                          ? isDark 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                          : isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                        !isOpen && 'justify-center'
                      )
                    }
                    title={!isOpen ? `${item.label} (Shift+${item.hotkey})` : undefined}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', !isOpen && 'w-6 h-6')} />
                    {isOpen && (
                      <span className="flex-1">
                        <HotkeyLabel 
                          label={item.label} 
                          underlineIndices={item.underlineIndices}
                          isDark={isDark}
                        />
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </nav>

        {/* Toggle Button */}
        <div className={cn(
          'p-2.5 border-t hidden lg:block',
          isDark ? 'border-slate-800' : 'border-slate-200'
        )}>
          <button
            onClick={onToggle}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors',
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {isOpen ? (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
