import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useGetMyCompaniesQuery } from '../../services/companyApi';
import { setActiveCompany } from '../../app/authSlice';
import { apiSlice } from '../../app/apiSlice';
import { getRoleDisplayName, getRoleBadgeClasses } from '../../utils/roleHelpers';
import { ChevronDown, ArrowLeftRight } from 'lucide-react';

export const CompanySwitcher: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeCompany } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const { data } = useGetMyCompaniesQuery();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const companies = data?.data || [];
  const currentCompany = companies.find(c => c.id === activeCompany?.companyId);

  // Theme-aware classes
  const isDark = theme === 'dark';
  const triggerClasses = isDark
    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900';
  const dropdownClasses = isDark
    ? 'bg-slate-800 border-slate-700 shadow-2xl'
    : 'bg-white border-slate-200 shadow-lg';
  const headerClasses = isDark
    ? 'border-slate-700 bg-slate-700/50'
    : 'border-slate-100 bg-slate-50';
  const itemClasses = isDark
    ? 'hover:bg-slate-700'
    : 'hover:bg-slate-50';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClasses = isDark ? 'border-slate-700' : 'border-slate-100';
  const avatarBg = isDark ? 'bg-slate-600' : 'bg-slate-100';
  const avatarText = isDark ? 'text-slate-200' : 'text-slate-600';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchCompany = (companyId: string) => {
    if (companyId === activeCompany?.companyId) {
      setIsOpen(false);
      return;
    }

    // Update Redux state
    dispatch(setActiveCompany(companyId));
    
    // Clear all cached company-specific data
    dispatch(apiSlice.util.resetApiState());
    
    setIsOpen(false);
    
    // Reload dashboard
    navigate('/dashboard', { replace: true });
  };

  const handleSwitchCompanyPage = () => {
    setIsOpen(false);
    navigate('/dashboard/select-company');
  };

  if (!currentCompany) {
    return (
      <button
        onClick={() => navigate('/dashboard/select-company')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          isDark 
            ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' 
            : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
        }`}
      >
        Select Company
      </button>
    );
  }

  return (
    <div className="relative animate-fade-in" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-colors min-w-[200px] ${triggerClasses}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
          {currentCompany.logoUrl ? (
            <img 
              src={currentCompany.logoUrl}
              alt={`${currentCompany.name} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-xl font-semibold text-white`}>
              {currentCompany.name.charAt(0).toUpperCase()}
            </span>
          )}
          
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className={`text-sm font-medium truncate ${textPrimary}`}>
            {currentCompany.name}
          </p>
          <p className={`text-xs ${textSecondary}`}>
            {currentCompany.baseCurrency}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${textSecondary} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 mt-1 w-72 border rounded-lg ${dropdownClasses}`}>
          {/* Current Company Header */}
          <div className={`px-4 py-3 border-b ${headerClasses}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>Active Company</p>
            <p className={`text-sm font-medium mt-1 ${textPrimary}`}>{currentCompany.name}</p>
          </div>

          {/* Company List */}
          {companies.length > 1 && (
            <div className="py-2 max-h-64 overflow-y-auto">
              <p className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wide ${textSecondary}`}>
                Switch To
              </p>
              {companies
                .filter(c => c.id !== activeCompany?.companyId)
                .map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSwitchCompany(company.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${itemClasses}`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${avatarBg}`}>
                      {company.logoUrl ? (
                        <img 
                          src={company.logoUrl}
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`text-xl font-semibold ${avatarText}`}>
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      )}

                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${textPrimary}`}>{company.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{company.baseCurrency}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeClasses(company.myRole)}`}>
                      {getRoleDisplayName(company.myRole)}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className={`border-t p-2 ${borderClasses}`}>
            <button
              onClick={handleSwitchCompanyPage}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Manage Companies
            </button>
          </div>
        </div>
      )}
    </div>
  );
};;
