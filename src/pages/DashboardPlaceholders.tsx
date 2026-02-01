import React from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { ArrowLeftRight, FileText, BarChart3, DollarSign, Users, Settings } from 'lucide-react';

// Reusable placeholder component
const PlaceholderSection: React.FC<{
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, subtitle, description, icon }) => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h1>
      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{subtitle}</p>
      <div className={`border rounded-lg p-8 text-center ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          {icon}
        </div>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{description}</p>
      </div>
    </div>
  );
};

// Placeholder pages for dashboard sections
// These will be replaced with actual implementations

export const TradesPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Trades"
      subtitle="Trade management coming soon..."
      description="Manage your export and import trades"
      icon={<ArrowLeftRight className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};

export const InvoicesPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Invoices"
      subtitle="Invoice management coming soon..."
      description="Track and manage invoices"
      icon={<FileText className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};

export const ExposurePage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Exposure"
      subtitle="Exposure analysis coming soon..."
      description="Monitor forex exposure and risk"
      icon={<BarChart3 className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};

export const PaymentsPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Payments"
      subtitle="Payment tracking coming soon..."
      description="Track payments and settlements"
      icon={<DollarSign className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};

export const PartiesPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Parties"
      subtitle="Party management coming soon..."
      description="Manage buyers and suppliers"
      icon={<Users className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};

export const SettingsPage: React.FC = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  return (
    <PlaceholderSection
      title="Settings"
      subtitle="Application settings coming soon..."
      description="Configure application preferences"
      icon={<Settings className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
    />
  );
};
