import React, { useEffect } from 'react';
import { useAuth, useAppSelector } from '../hooks/useRedux';
import { useGetCompanyQuery } from '../services/companyApi';
import { getRoleDisplayName, getRoleBadgeClasses, isAdmin } from '../utils/roleHelpers';
import { useActionBar, type ActionItem } from '../components/ui/BottomActionBar';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Users,
  ArrowLeftRight,
  FileText,
  BarChart3,
  UserCheck,
  ChevronRight,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CircleDollarSign,
  HandCoins,
  Sparkles,
} from 'lucide-react';
import { useGetTradesQuery } from '../features/trades/api/tradeApi';
import { useGetInvoicesQuery } from '../features/invoices/api/invoiceApi';
import { useGetExposureDashboardQuery } from '../features/exposure/api/exposureApi';
import { formatCurrency } from '../utils/helpers';
import { TradeStage } from '../features/trades/types';
import { InvoiceStatus } from '../features/invoices/types';

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
  icon?: React.ReactNode;
  isDark: boolean;
}> = ({ label, value, subtext, icon, isDark }) => (
  <div className={`border rounded-lg p-5 ${
    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  }`}>
    <div className="flex items-center justify-between gap-2">
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      {icon && <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>{icon}</div>}
    </div>
    <p className={`text-2xl font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    {subtext && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>}
  </div>
);

const LifecycleStage: React.FC<{
  label: string;
  value: number;
  isDark: boolean;
}> = ({ label, value, isDark }) => {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-lg font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
};

const PriorityItem: React.FC<{
  title: string;
  impact: string;
  href: string;
  icon: React.ReactNode;
  isDark: boolean;
}> = ({ title, impact, href, icon, isDark }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(href)}
      className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
        isDark
          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{icon}</span>
        <div className="text-left min-w-0">
          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
          <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{impact}</p>
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
    </button>
  );
};

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

  const { data: tradesData } = useGetTradesQuery(undefined);
  const { data: invoicesData } = useGetInvoicesQuery(undefined);
  const { data: exposureDashboardData } = useGetExposureDashboardQuery();

  const trades = tradesData?.data || [];
  const invoices = invoicesData?.data || [];
  const exposureTotals = exposureDashboardData?.data?.totals;
  const openTradesCount = trades.filter(
    (trade) => trade.tradeStage !== TradeStage.CANCELLED && trade.tradeStage !== TradeStage.CLOSED
  ).length;
  const pendingInvoicesCount = invoices.filter(
    (invoice) => invoice.status === InvoiceStatus.ISSUED || invoice.status === InvoiceStatus.PARTIALLY_PAID
  ).length;
  const overdueInvoicesCount = invoices.filter(
    (invoice) =>
      (invoice.status === InvoiceStatus.ISSUED || invoice.status === InvoiceStatus.PARTIALLY_PAID) &&
      new Date(invoice.dueDate) < new Date()
  ).length;
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + (invoice.outstandingAmount || 0), 0);

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
        <StatsCard
          label="Open Trades"
          value={openTradesCount.toString()}
          subtext={`${trades.length} total trades`}
          icon={<ArrowLeftRight className="w-4 h-4" />}
          isDark={isDark}
        />
        <StatsCard
          label="Pending Invoices"
          value={pendingInvoicesCount.toString()}
          subtext={overdueInvoicesCount > 0 ? `${overdueInvoicesCount} overdue` : 'No overdue invoices'}
          icon={<Clock className="w-4 h-4" />}
          isDark={isDark}
        />
        <StatsCard
          label="Net Exposure (Unhedged)"
          value={formatCurrency(exposureTotals?.totalUnhedgedValueInBaseCurrency || 0, 'INR', true)}
          subtext={`Total outstanding ${formatCurrency(totalOutstanding, 'USD', true)}`}
          icon={<AlertTriangle className="w-4 h-4" />}
          isDark={isDark}
        />
        <StatsCard
          label="Hedged %"
          value={`${(exposureTotals?.overallHedgePercentage || 0).toFixed(1)}%`}
          subtext={`${exposureTotals?.fullyHedgedCount || 0} fully hedged exposures`}
          icon={<Shield className="w-4 h-4" />}
          isDark={isDark}
        />
      </div>

      {/* Lifecycle + Mission Control */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`xl:col-span-2 border rounded-lg p-5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Lifecycle Tracker
            </h2>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Live operational snapshot
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-cyan-400' : 'text-teal-600'}`}>Trade Lifecycle</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <LifecycleStage
                  label="Draft"
                  value={trades.filter((trade) => trade.tradeStage === TradeStage.DRAFT).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Approval Queue"
                  value={trades.filter((trade) => trade.tradeStage === TradeStage.SUBMITTED).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Active"
                  value={trades.filter((trade) => trade.tradeStage === TradeStage.APPROVED || trade.tradeStage === TradeStage.ACTIVE).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Closed"
                  value={trades.filter((trade) => trade.tradeStage === TradeStage.CLOSED).length}
                  isDark={isDark}
                />
              </div>
            </div>

            <div>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>Invoice Lifecycle</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <LifecycleStage
                  label="Draft"
                  value={invoices.filter((invoice) => invoice.status === InvoiceStatus.DRAFT).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Issued"
                  value={invoices.filter((invoice) => invoice.status === InvoiceStatus.ISSUED).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Partially Paid"
                  value={invoices.filter((invoice) => invoice.status === InvoiceStatus.PARTIALLY_PAID).length}
                  isDark={isDark}
                />
                <LifecycleStage
                  label="Settled"
                  value={invoices.filter((invoice) => invoice.status === InvoiceStatus.SETTLED).length}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className={isDark ? 'w-4 h-4 text-amber-400' : 'w-4 h-4 text-amber-600'} />
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Today&apos;s Mission
            </h2>
          </div>

          <div className="space-y-2.5">
            <PriorityItem
              title={`${pendingInvoicesCount} invoices awaiting payment`}
              impact={
                totalOutstanding > 0
                  ? `Outstanding ${formatCurrency(totalOutstanding, 'INR', true)}`
                  : 'No outstanding amount'
              }
              href="/dashboard/invoices"
              icon={<CircleDollarSign className="w-4 h-4" />}
              isDark={isDark}
            />
            <PriorityItem
              title={`${exposureTotals?.unhedgedCount || 0} exposures at risk`}
              impact={`${(exposureTotals?.overallHedgePercentage || 0).toFixed(1)}% hedge coverage`}
              href="/dashboard/exposures"
              icon={<AlertTriangle className="w-4 h-4" />}
              isDark={isDark}
            />
            <PriorityItem
              title={`${trades.filter((trade) => trade.tradeStage === TradeStage.SUBMITTED).length} trades pending approval`}
              impact="Clear approval queue to keep flow moving"
              href="/dashboard/trades"
              icon={<CheckCircle2 className="w-4 h-4" />}
              isDark={isDark}
            />
          </div>

          <button
            onClick={() => navigate('/dashboard/exposures/quarterly-report')}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Open Quarterly Control Room
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className={`text-sm font-medium uppercase tracking-wide mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Command Center
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlaceholderCard
            title="Trades"
            description="Create, approve, and manage import/export flows"
            href="/dashboard/trades"
            isDark={isDark}
            icon={<ArrowLeftRight className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Invoices"
            description="Issue invoices, record payments, and track receivables"
            href="/dashboard/invoices"
            isDark={isDark}
            icon={<FileText className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Exposure"
            description="Monitor risk, hedge actions, and quarterly controls"
            href="/dashboard/exposures"
            isDark={isDark}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Parties"
            description="Manage buyers/suppliers and trading counterparties"
            href="/dashboard/parties"
            isDark={isDark}
            icon={<UserCheck className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Hedge Management"
            description="Apply natural hedges and book forward contracts"
            href="/dashboard/exposures/hedges"
            isDark={isDark}
            icon={<HandCoins className="w-5 h-5" />}
          />
          <PlaceholderCard
            title="Quarterly Reports"
            description="Review quarterly risk summary and action plan"
            href="/dashboard/exposures/quarterly-report"
            isDark={isDark}
            icon={<Shield className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
};
