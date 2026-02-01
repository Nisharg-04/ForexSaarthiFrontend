import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanySelectList } from '../features/company';
import { useAppSelector } from '../hooks/useRedux';
import { Navbar } from '../components/ui/Navbar';

export const DashboardCompanySelect: React.FC = () => {
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const handleCompanySelected = () => {
    // Navigate to dashboard home after selection
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Common Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
        <CompanySelectList onCompanySelected={handleCompanySelected} />
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            © {new Date().getFullYear()} ForexSaarthi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
