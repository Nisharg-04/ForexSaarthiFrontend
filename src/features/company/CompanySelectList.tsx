import React, { useState } from 'react';
import { useGetMyCompaniesQuery, type CompanyWithRole } from '../../services/companyApi';
import { CompanySelectCard } from './CompanySelectCard';
import { CreateCompanyModal } from './CreateCompanyModal';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setActiveCompany } from '../../app/authSlice';
import { apiSlice } from '../../app/apiSlice';

interface CompanySelectListProps {
  onCompanySelected?: () => void;
}

export const CompanySelectList: React.FC<CompanySelectListProps> = ({ 
  onCompanySelected 
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const { data, isLoading, isError, refetch } = useGetMyCompaniesQuery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleCompanySelect = (company: CompanyWithRole) => {
    setSelectedId(company.id);
    console.log('Selected company:', company);
    // Update Redux state with full company details
    dispatch(setActiveCompany({
      companyId: company.id,
      companyName: company.name,
      role: company.myRole,
    }));
    
    // Clear all cached company-specific data
    dispatch(apiSlice.util.resetApiState());
    
    // Notify parent
    onCompanySelected?.();
  };

  const handleCreateCompany = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3 ${
            isDark ? 'border-slate-600 border-t-teal-400' : 'border-slate-300 border-t-teal-600'
          }`}></div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading companies...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Failed to load companies</p>
          <button
            onClick={() => refetch()}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isDark 
                ? 'text-slate-200 bg-slate-700 hover:bg-slate-600' 
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const companies = data?.data || [];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Select Company
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Choose a company to work with
        </p>
      </div>

      {/* Company List */}
      {companies.length > 0 ? (
        <div className="space-y-3 mb-6">
          {companies.map((company) => (
            <CompanySelectCard
              key={company.id}
              company={company}
              isSelected={selectedId === company.id}
              onClick={handleCompanySelect}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 px-6 rounded-lg border mb-6 ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-slate-700' : 'bg-slate-100'
          }`}>
            <svg className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className={`text-base font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No companies yet</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create your first company to get started</p>
        </div>
      )}

      {/* Create Company Button */}
      <button
        onClick={handleCreateCompany}
        className={`w-full py-3 px-4 border-2 border-dashed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          isDark 
            ? 'border-slate-600 text-slate-400 hover:border-teal-500 hover:text-teal-400 hover:bg-slate-800' 
            : 'border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-slate-50'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create New Company
      </button>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
