import React from 'react';
import { getRoleDisplayName, getRoleBadgeClasses } from '../../utils/roleHelpers';
import { useAppSelector } from '../../hooks/useRedux';
import type { CompanyWithRole } from '../../services/companyApi';

interface CompanySelectCardProps {
  company: CompanyWithRole;
  isSelected?: boolean;
  onClick: (company: CompanyWithRole) => void;
}

export const CompanySelectCard: React.FC<CompanySelectCardProps> = ({
  company,
  isSelected,
  onClick,
}) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const cardClasses = isDark
    ? isSelected 
      ? 'border-teal-500 bg-slate-800 ring-2 ring-teal-500 ring-opacity-30' 
      : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
    : isSelected 
      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500 ring-opacity-20' 
      : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50';

  return (
    <button
      onClick={() => onClick(company)}
      className={`
        w-full text-left p-5 border rounded-lg transition-all duration-150
        ${cardClasses}
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'}
      `}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
          isDark ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          {company.logoUrl ? (
            <img 
              src={company.logoUrl} 
              alt={`${company.name} logo`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-xl font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {company.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {company.name}
          </h3>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Base Currency: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{company.baseCurrency}</span>
          </p>
        </div>
        
        {/* Role Badge */}
        <div className="flex-shrink-0">
          <span className={`
            inline-flex px-2.5 py-1 text-xs font-medium rounded-md
            ${getRoleBadgeClasses(company.myRole)}
          `}>
            {getRoleDisplayName(company.myRole)}
          </span>
        </div>
      </div>
    </button>
  );
};
