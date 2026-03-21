// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE DETAIL PAGE
// Route: /dashboard/exposures/:id - Single exposure detail view with hedge history
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Building2,
  FileText,
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';

import { useAuth, useAppSelector } from '../../../hooks/useRedux';

import { useGetExposureByIdQuery } from '../api/exposureApi';
import { ExposureStatusBadge } from '../components/ExposureStatusBadge';
import { HedgeProgressBar, ExposureBreakdownBar } from '../components/HedgeProgressBar';
import { ExposureActionsMenu } from '../components/ExposureActionsMenu';
import { ForwardHedgeModal } from '../modals/ForwardHedgeModal';
import { BookForwardContractModal } from '../modals/BookForwardContractModal';
import { NaturalHedgeModal } from '../modals/NaturalHedgeModal';
import { CloseHedgeModal } from '../modals/CloseHedgeModal';
import { useExposureActionPermissions } from '../hooks/useExposurePermissions';
import { ExposureType, HedgeType, HedgeStatus, type Hedge } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysUntilMaturity,
  getExposureRiskLevel,
} from '../exposureUtils';
import {
  EXPOSURE_STATUS_STYLES,
  EXPOSURE_TYPE_STYLES,
  HEDGE_TYPE_STYLES,
} from '../exposureConstants';

interface ExposureDetailPageProps {
  isDark?: boolean;
}

export const ExposureDetailPage: React.FC<ExposureDetailPageProps> = ({ isDark = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui?.theme);
  const effectiveDark = isDark || theme === 'dark';

  // Fetch exposure data
  const {
    data: exposureResponse,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetExposureByIdQuery(id!, { skip: !id });

  // Get the actual exposure from the response
  const exposure = exposureResponse?.data;

  // Permissions
  const permissions = useExposureActionPermissions(exposure);

  // Modal state
  const [forwardHedgeOpen, setForwardHedgeOpen] = useState(false);
  const [naturalHedgeOpen, setNaturalHedgeOpen] = useState(false);
  const [closeHedgeOpen, setCloseHedgeOpen] = useState(false);
  const [bookForwardOpen, setBookForwardOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Theme classes
  const bgClass = effectiveDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = effectiveDark ? 'bg-gray-800' : 'bg-white';
  const textClass = effectiveDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = effectiveDark ? 'text-gray-400' : 'text-gray-500';
  const borderClass = effectiveDark ? 'border-gray-700' : 'border-gray-200';

  // Copy ID handler
  const handleCopyId = () => {
    if (exposure?.id) {
      navigator.clipboard.writeText(exposure.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgClass} p-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`h-10 w-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`} />
            <div className="flex-1">
              <div className={`h-6 w-48 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse mb-2`} />
              <div className={`h-4 w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`} />
            </div>
          </div>
          
          {/* Card Skeleton */}
          <div className={`${cardBgClass} rounded-lg border ${borderClass} p-6 animate-pulse`}>
            <div className="space-y-4">
              <div className={`h-4 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
              <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
              <div className={`h-4 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exposure) {
    return (
      <div className={`min-h-screen ${bgClass} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${cardBgClass} rounded-lg border ${borderClass} p-8 text-center`}>
            <AlertTriangle className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h2 className={`text-xl font-semibold ${textClass} mb-2`}>Exposure Not Found</h2>
            <p className={`${textMutedClass} mb-6`}>
              The exposure you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/dashboard/exposures/list"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Exposures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilMaturity = getDaysUntilMaturity(exposure.maturityDate);
  const riskLevel = getExposureRiskLevel(exposure);
  const typeStyles = EXPOSURE_TYPE_STYLES[exposure.type];
  console.log(exposure)

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <div className={`${cardBgClass} border-b ${borderClass} sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-colors mt-1 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className={`h-5 w-5 ${textMutedClass}`} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className={`text-xl font-bold ${textClass}`}>
                    {exposure.currency} {formatCurrency(exposure.originalAmount, exposure.currency).replace(/[^0-9.,]/g, '')}
                  </h1>
                  <ExposureStatusBadge status={exposure.status} isDark={isDark} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-sm ${textMutedClass} flex items-center gap-1`}>
                    <Building2 className="h-4 w-4" />
                    {exposure.partyName}
                  </span>
                  <span className={`text-sm ${textMutedClass} flex items-center gap-1`}>
                    <FileText className="h-4 w-4" />
                    {exposure.invoiceNumber}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className={`text-xs ${textMutedClass} flex items-center gap-1 hover:text-blue-500 transition-colors`}
                    title="Copy ID"
                  >
                    {copiedId ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copiedId ? 'Copied!' : exposure.id.slice(0, 8)}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className={`
                  p-2 rounded-lg transition-colors border ${borderClass}
                  ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}
                  disabled:opacity-50
                `}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''} ${textMutedClass}`} />
              </button>
              <ExposureActionsMenu
                exposure={exposure}
                userRole={role}
                onApplyForwardHedge={() => setForwardHedgeOpen(true)}
                onApplyNaturalHedge={() => setNaturalHedgeOpen(true)}
                onCloseHedge={() => setCloseHedgeOpen(true)}
                isDark={effectiveDark}
                layout="dropdown"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Risk Warning Banner */}
        {riskLevel === 'high' && (
          <div className={`
            mb-6 p-4 rounded-lg border flex items-start gap-3
            ${isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}
          `}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">High Risk Exposure</p>
              <p className="text-sm opacity-80 mt-1">
                This exposure is {exposure.hedgePercentage < 50 ? 'under-hedged' : 'approaching maturity'}.
                Consider applying additional hedges to mitigate forex risk.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className={`${cardBgClass} rounded-lg border ${borderClass} p-6`}>
              <h2 className={`text-lg font-semibold ${textClass} mb-4`}>Exposure Overview</h2>
              
              {/* Type Badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                  ${isDark ? typeStyles.dark : typeStyles.light}
                `}>
                  {exposure.type === ExposureType.RECEIVABLE ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">{typeStyles.label}</span>
                </div>
                {daysUntilMaturity <= 7 && daysUntilMaturity > 0 && (
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}
                  `}>
                    Maturing in {daysUntilMaturity} days
                  </span>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className={`text-sm ${textMutedClass} mb-1`}>Original Amount</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {formatCurrency(exposure.originalAmount, exposure.currency)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${textMutedClass} mb-1`}>INR Value</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {formatCurrency(exposure.inrValue, 'INR')}
                  </p>
                  <p className={`text-xs ${textMutedClass}`}>
                    {/* @ {exposure.bookingRate.toFixed(4)} booking rate */}
                  </p>
                </div>
              </div>

              {/* Hedge Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${textClass}`}>Hedge Coverage</p>
                  <p className={`text-sm font-bold ${
                    exposure.hedgePercentage >= 80 ? 'text-green-500' :
                    exposure.hedgePercentage >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {exposure.hedgePercentage.toFixed(1)}%
                  </p>
                </div>
                <HedgeProgressBar
                  hedgePercentage={exposure.hedgePercentage}
                  showLabels={true}
                  isDark={isDark}
                />
              </div>

              {/* Breakdown Bar */}
              <div className="mb-6">
                <p className={`text-sm font-medium ${textClass} mb-2`}>Amount Breakdown</p>
                <ExposureBreakdownBar
                  exposedAmount={exposure.inrValue}
                  hedgedAmount={exposure.hedgedAmountINR}
                  settledAmount={exposure.settledAmount || 0}
                  unhedgedAmount={exposure.unhedgedAmountINR}
                  isDark={isDark}
                />
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${textMutedClass}`}>Hedged (INR)</p>
                  <p className={`font-semibold ${textClass}`}>
                    {formatCurrency(exposure.hedgedAmountINR, 'INR')}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${textMutedClass}`}>Unhedged (INR)</p>
                  <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(exposure.unhedgedAmountINR, 'INR')}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${textMutedClass}`}>Hedged ({exposure.currency})</p>
                  <p className={`font-semibold ${textClass}`}>
                    {formatCurrency(exposure.hedgedAmount, exposure.currency)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${textMutedClass}`}>Unhedged ({exposure.currency})</p>
                  <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(exposure.unhedgedAmount, exposure.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Hedge History */}
            {/* <div className={`${cardBgClass} rounded-lg border ${borderClass} p-6`}>
              <h2 className={`text-lg font-semibold ${textClass} mb-4`}>Hedge History</h2>
              
              {exposure.hedges.length === 0 ? (
                <div className={`text-center py-8 ${textMutedClass}`}>
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No hedges applied yet</p>
                  <p className="text-sm mt-1">This exposure is currently unhedged</p>
                  {permissions.canHedge && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => setForwardHedgeOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Apply Forward Hedge
                      </button>
                      <button
                        onClick={() => setNaturalHedgeOpen(true)}
                        className={`
                          px-4 py-2 rounded-lg text-sm border ${borderClass}
                          ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
                        `}
                      >
                        Match Natural Hedge
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {exposure.hedges.map((hedge: Hedge) => {
                    const hedgeTypeStyle = HEDGE_TYPE_STYLES[hedge.type];
                    return (
                      <div
                        key={hedge.id}
                        className={`
                          p-4 rounded-lg border ${borderClass}
                          ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}
                        `}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${isDark ? hedgeTypeStyle.dark : hedgeTypeStyle.light}
                            `}>
                              {hedgeTypeStyle.label}
                            </span>
                            <span className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${hedge.status === HedgeStatus.ACTIVE
                                ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                              }
                            `}>
                              {hedge.status}
                            </span>
                          </div>
                          <span className={`text-xs ${textMutedClass}`}>
                            {formatDate(hedge.appliedDate)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Amount</p>
                            <p className={`font-semibold ${textClass}`}>
                              {formatCurrency(hedge.amount, exposure.currency)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Rate</p>
                            <p className={`font-semibold ${textClass}`}>
                              {hedge.rate.toFixed(4)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>INR Value</p>
                            <p className={`font-semibold ${textClass}`}>
                              {formatCurrency(hedge.inrValue, 'INR')}
                            </p>
                          </div>
                        </div>

                        {hedge.type === HedgeType.FORWARD && (
                          <div className="mt-3 pt-3 border-t ${borderClass} grid grid-cols-2 gap-4">
                            {hedge.bankName && (
                              <div>
                                <p className={`text-xs ${textMutedClass}`}>Bank</p>
                                <p className={`text-sm ${textClass}`}>{hedge.bankName}</p>
                              </div>
                            )}
                            {hedge.contractNumber && (
                              <div>
                                <p className={`text-xs ${textMutedClass}`}>Contract #</p>
                                <p className={`text-sm ${textClass}`}>{hedge.contractNumber}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {hedge.type === HedgeType.NATURAL && hedge.matchedExposureId && (
                          <div className="mt-3 pt-3 border-t ${borderClass}">
                            <p className={`text-xs ${textMutedClass} mb-1`}>Matched with</p>
                            <Link
                              to={`/dashboard/exposures/${hedge.matchedExposureId}`}
                              className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline inline-flex items-center gap-1`}
                            >
                              View matched exposure <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div> */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {permissions.canHedge && (
              <div className={`${cardBgClass} rounded-lg border ${borderClass} p-4`}>
                <h3 className={`text-sm font-semibold ${textClass} mb-3`}>Quick Actions</h3>
                <div className="space-y-2">
                  {permissions.canApplyForward && (
                    <button
                      onClick={() => setForwardHedgeOpen(true)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium text-left
                        flex items-center gap-2 transition-colors
                        ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <Shield className="h-4 w-4 text-blue-500" />
                      Apply Forward Hedge
                    </button>
                  )}
                  {permissions.canApplyForward && exposure && exposure.unhedgedAmount > 0 && (
                    <button
                      onClick={() => setBookForwardOpen(true)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium text-left
                        flex items-center gap-2 transition-colors
                        ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <FileText className="h-4 w-4 text-violet-500" />
                      Book Forward Contract
                    </button>
                  )}
                  {permissions.canApplyNatural && (
                    <button
                      onClick={() => setNaturalHedgeOpen(true)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium text-left
                        flex items-center gap-2 transition-colors
                        ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Match Natural Hedge
                    </button>
                  )}
                  {permissions.canClose && (
                    <button
                      onClick={() => setCloseHedgeOpen(true)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium text-left
                        flex items-center gap-2 transition-colors
                        ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}
                      `}
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Close Hedge
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Key Dates */}
            <div className={`${cardBgClass} rounded-lg border ${borderClass} p-4`}>
              <h3 className={`text-sm font-semibold ${textClass} mb-3`}>Key Dates</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className={`h-4 w-4 ${textMutedClass} mt-0.5`} />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Invoice Date</p>
                    {/* <p className={`text-sm ${textClass}`}>{formatDate(exposure.invoiceDate)}</p> */}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className={`h-4 w-4 ${
                    daysUntilMaturity <= 7 ? 'text-amber-500' : textMutedClass
                  } mt-0.5`} />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Maturity Date</p>
                    <p className={`text-sm ${textClass}`}>{formatDate(exposure.maturityDate)}</p>
                    <p className={`text-xs ${
                      daysUntilMaturity < 0 ? 'text-red-500' :
                      daysUntilMaturity <= 7 ? 'text-amber-500' : textMutedClass
                    }`}>
                      {daysUntilMaturity < 0
                        ? `${Math.abs(daysUntilMaturity)} days overdue`
                        : daysUntilMaturity === 0
                        ? 'Due today'
                        : `${daysUntilMaturity} days remaining`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Invoice */}
            <div className={`${cardBgClass} rounded-lg border ${borderClass} p-4`}>
              <h3 className={`text-sm font-semibold ${textClass} mb-3`}>Related Invoice</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textMutedClass}`}>Invoice #</span>
                  <Link
                    to={`/dashboard/invoices/${exposure.invoiceId}`}
                    className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    {exposure.invoiceNumber}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${textMutedClass}`}>Party</span>
                  <Link
                    to={`/dashboard/parties/${exposure.partyId}`}
                    className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    {exposure.partyName}
                  </Link>
                </div>
              </div>
            </div>

            {/* Audit Info */}
            <div className={`${cardBgClass} rounded-lg border ${borderClass} p-4`}>
              <h3 className={`text-sm font-semibold ${textClass} mb-3`}>Audit Trail</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className={textMutedClass}>Created</span>
                  <span className={textClass}>{formatDate(exposure.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMutedClass}>Last Updated</span>
                  <span className={textClass}>{formatDate(exposure.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ForwardHedgeModal
        isOpen={forwardHedgeOpen}
        onClose={() => setForwardHedgeOpen(false)}
        exposure={exposure}
        isDark={isDark}
      />

      <NaturalHedgeModal
        isOpen={naturalHedgeOpen}
        onClose={() => setNaturalHedgeOpen(false)}
        exposure={exposure}
        isDark={isDark}
      />

      <CloseHedgeModal
        isOpen={closeHedgeOpen}
        onClose={() => setCloseHedgeOpen(false)}
        exposure={exposure}
        isDark={isDark}
      />

      <BookForwardContractModal
        isOpen={bookForwardOpen}
        onClose={() => setBookForwardOpen(false)}
        exposure={exposure ? { id: exposure.id, currency: exposure.currency, unhedgedAmount: exposure.unhedgedAmount, maturityDate: exposure.maturityDate, description: exposure.description } : null}
        isDark={isDark}
      />
    </div>
  );
};

export default ExposureDetailPage;
