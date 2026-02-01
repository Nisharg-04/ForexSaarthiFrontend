import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  CreditCard,
  Activity,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useAuth, useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout, setActiveCompany } from '../app/authSlice';
import { toggleTheme, selectTheme } from '../app/uiSlice';
import { cn } from '../utils/helpers';
import { NAV_ITEMS } from '../constants';
import { usePermission } from '../hooks/useRedux';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const { user, activeCompany } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleCompanyChange = (companyId: string) => {
    dispatch(setActiveCompany(companyId));
    setCompanyDropdownOpen(false);
  };

  return (
    <div className="flex h-screen bg-background dark:bg-dark-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background-muted dark:bg-dark-background-muted border-r border-border dark:border-dark-border',
          'transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border dark:border-dark-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/ForexSaarthi Logo.png"
                alt="ForexSaarthi"
                className="h-8"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-background-subtle dark:hover:bg-dark-background-subtle rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => {
            const hasPermission = usePermission(item.permission);
            if (!hasPermission) return null;

            const IconComponent = getIconComponent(item.icon);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                    'hover:bg-background-subtle dark:hover:bg-dark-background-subtle',
                    isActive &&
                      'bg-primary text-white hover:bg-primary-dark',
                    !isActive && 'text-text-muted'
                  )
                }
              >
                <IconComponent size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border dark:border-dark-border">
          {sidebarOpen ? (
            <div className="space-y-2">
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-subtle dark:hover:bg-dark-background-subtle transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-sm">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-subtle dark:hover:bg-dark-background-subtle transition-colors text-error"
              >
                <LogOut size={20} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-background-subtle dark:hover:bg-dark-background-subtle"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-background-subtle dark:hover:bg-dark-background-subtle text-error"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background-muted dark:bg-dark-background-muted border-b border-border dark:border-dark-border px-6 flex items-center justify-between">
          <div>
            {/* Company Selector */}
            {user && user.companies.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-background-subtle dark:hover:bg-dark-background-subtle transition-colors"
                >
                  <Building2 size={20} />
                  <span className="font-medium">{activeCompany?.companyName}</span>
                  <ChevronDown size={16} />
                </button>

                {companyDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 bg-background-muted dark:bg-dark-background-muted border border-border dark:border-dark-border rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {user.companies.map((company) => (
                      <button
                        key={company.companyId}
                        onClick={() => handleCompanyChange(company.companyId)}
                        className={cn(
                          'w-full text-left px-4 py-2 hover:bg-background-subtle dark:hover:bg-dark-background-subtle transition-colors',
                          activeCompany?.companyId === company.companyId &&
                            'bg-primary text-white'
                        )}
                      >
                        {company.companyName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-muted">{activeCompany?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    LayoutDashboard,
    Users,
    TrendingUp,
    FileText,
    CreditCard,
    Activity,
    Shield,
  };
  return icons[iconName] || LayoutDashboard;
};
