import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../app/authSlice';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Theme-aware classes
  const isDark = theme === 'dark';
  const hoverBg = isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100';
  const dropdownClasses = isDark
    ? 'bg-slate-800 border-slate-700 shadow-2xl'
    : 'bg-white border-slate-200 shadow-lg';
  const borderClasses = isDark ? 'border-slate-700' : 'border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textTertiary = isDark ? 'text-slate-300' : 'text-slate-700';
  const avatarBg = isDark ? 'bg-slate-600' : 'bg-slate-200';
  const avatarText = isDark ? 'text-slate-200' : 'text-slate-600';
  const iconClasses = isDark ? 'text-slate-400' : 'text-slate-400';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1 rounded-md transition-colors ${hoverBg}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${avatarBg}`}>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-sm font-medium ${avatarText}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${textSecondary} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 z-50 mt-1 w-56 border rounded-lg ${dropdownClasses}`}>
          {/* User Info */}
          <div className={`px-4 py-3 border-b ${borderClasses}`}>
            <p className={`text-sm font-medium ${textPrimary}`}>{user?.name}</p>
            <p className={`text-xs truncate ${textSecondary}`}>{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${textTertiary} ${hoverBg}`}
            >
              <User className={`w-4 h-4 ${iconClasses}`} />
              Profile
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${textTertiary} ${hoverBg}`}
            >
              <Settings className={`w-4 h-4 ${iconClasses}`} />
              Settings
            </NavLink>
          </div>

          {/* Logout */}
          <div className={`border-t py-1 ${borderClasses}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 transition-colors text-left ${
                isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
