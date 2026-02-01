import React, { useEffect } from 'react';
import { useAuth, useAppSelector } from '../hooks/useRedux';
import { useGetCompanyQuery } from '../services/companyApi';
import { getRoleDisplayName, getRoleBadgeClasses, isAdmin } from '../utils/roleHelpers';
import { useActionBar, type ActionItem } from '../components/ui/BottomActionBar';
import { useNavigate } from 'react-router-dom';
import { Pencil, Users, ArrowLeftRight, FileText, BarChart3, UserCheck, ChevronRight } from 'lucide-react';

// Placeholder Card Component
const PlaceholderCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isDark: boolean;
}> = ({ title, description, icon, href, isDark }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className={`w-full text-left p-5 border rounded-lg transition-all group ${
        isDark 
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          isDark 
            ? 'bg-slate-700 text-slate-400 group-hover:bg-slate-600' 
            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {description}
          </p>
        </div>
        <ChevronRight className={`w-5 h-5 transition-colors ${
          isDark ? 'text-slate-600 group-hover:text-slate-500' : 'text-slate-300 group-hover:text-slate-400'
        }`} />
      </div>
    </button>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  isDark: boolean;
}> = ({ label, value, subtext, isDark }) => (
  <div className={`border rounded-lg p-5 ${
    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  }`}>
    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    <p className={`text-2xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    {subtext && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>}
  </div>
);

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompany, role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const { setActions, clearActions } = useActionBar();
  const isDark = theme === 'dark';
  
  const { data: companyData, isLoading } = useGetCompanyQuery(
    activeCompany?.companyId || '',
    { skip: !activeCompany?.companyId }
  );

  const company = companyData?.data;

  // Set up bottom action bar based on role
  useEffect(() => {
    const actions: ActionItem[] = [];

    if (isAdmin(role)) {
      actions.push({
        id: 'edit-company',
        label: 'Edit Company',
        icon: <Pencil className="w-full h-full" />,
        onClick: () => navigate('/dashboard/company/edit'),
      });

      actions.push({
        id: 'manage-users',
        label: 'Manage Users',
        icon: <Users className="w-full h-full" />,
        onClick: () => navigate('/dashboard/company/users'),
      });
    }

    setActions(actions);

    return () => clearActions();
  }, [role, setActions, clearActions, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3 ${
            isDark ? 'border-slate-600 border-t-teal-400' : 'border-slate-300 border-t-teal-600'
          }`}></div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Header Card */}
      <div className={`border rounded-lg p-6 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gradient-to-br from-teal-600 to-cyan-700' : 'bg-gradient-to-br from-teal-500 to-cyan-600'
            }`}>
              {
                company?.logoUrl ? (
                  <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className={`text-2xl font-semibold text-white`}>  
                    {company?.name ? company.name.charAt(0).toUpperCase() : activeCompany?.companyName.charAt(0).toUpperCase()}
                  </span>
                )
              }
            </div>
            
            {/* Company Info */}
            <div>
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {company?.name || activeCompany?.companyName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Base Currency: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{company?.baseCurrency || 'INR'}</span>
                </span>
                <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Country: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{company?.country || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Role Badge */}
          <span className={`px-3 py-1.5 text-sm font-medium rounded-md ${getRoleBadgeClasses(role)}`}>
            {getRoleDisplayName(role)}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Open Trades" value="—" subtext="Coming soon" isDark={isDark} />
        <StatsCard label="Pending Invoices" value="—" subtext="Coming soon" isDark={isDark} />
        <StatsCard label="Net Exposure" value="—" subtext="Coming soon" isDark={isDark} />
        <StatsCard label="Hedged %" value="—" subtext="Coming soon" isDark={isDark} />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className={`text-sm font-medium uppercase tracking-wide mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlaceholderCard
            title="Trades"
            description="Manage export and import trades"
            href="/dashboard/trades"
            isDark={isDark}
            icon={<ArrowLeftRight className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Invoices"
            description="Track invoices and payments"
            href="/dashboard/invoices"
            isDark={isDark}
            icon={<FileText className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Exposure"
            description="Monitor forex exposure and risk"
            href="/dashboard/exposure"
            isDark={isDark}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Parties"
            description="Manage buyers and suppliers"
            href="/dashboard/parties"
            isDark={isDark}
            icon={<UserCheck className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
};
