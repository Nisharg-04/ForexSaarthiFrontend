// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS LIST PAGE
// Main page for viewing all forward contracts with filters and actions
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { useAppSelector } from '../../../hooks/useRedux';
import {
  useGetForwardContractsQuery,
  useGetExposureForwardsQuery,
} from '../api/forwardApi';
import {
  BookForwardModal,
  CloseForwardModal,
  CancelForwardModal,
  ForwardFilters,
  ForwardContractsTable,
} from '../components';
import type { ForwardContract, ForwardFilters as FilterType } from '../types';

interface PageState {
  filters: FilterType;
  selectedContract: ForwardContract | null;
  modalStates: {
    bookModal: boolean;
    closeModal: boolean;
    cancelModal: boolean;
  };
}

export const ForwardContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const [pageState, setPageState] = useState<PageState>({
    filters: { page: 1, pageSize: 25 },
    selectedContract: null,
    modalStates: {
      bookModal: false,
      closeModal: false,
      cancelModal: false,
    },
  });

  // Fetch contracts
  const { data: contractsData, isLoading, refetch } = useGetForwardContractsQuery(pageState.filters);

  // Modal handlers
  const openBookModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      modalStates: { ...prev.modalStates, bookModal: true },
    }));
  }, []);

  const closeBookModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      modalStates: { ...prev.modalStates, bookModal: false },
    }));
  }, []);

  const handleViewContract = useCallback((contract: ForwardContract) => {
    navigate(`/dashboard/forwards/${contract.id}`);
  }, [navigate]);

  const handleCloseContract = useCallback((contract: ForwardContract) => {
    setPageState((prev) => ({
      ...prev,
      selectedContract: contract,
      modalStates: { ...prev.modalStates, closeModal: true },
    }));
  }, []);

  const closeCloseModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      modalStates: { ...prev.modalStates, closeModal: false },
    }));
  }, []);

  const handleCancelContract = useCallback((contract: ForwardContract) => {
    setPageState((prev) => ({
      ...prev,
      selectedContract: contract,
      modalStates: { ...prev.modalStates, cancelModal: true },
    }));
  }, []);

  const closeCancelModal = useCallback(() => {
    setPageState((prev) => ({
      ...prev,
      modalStates: { ...prev.modalStates, cancelModal: false },
    }));
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className={cn('space-y-6', isDark ? 'bg-slate-900 min-h-screen' : 'bg-slate-50 min-h-screen')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Forward Contracts
          </h1>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Manage your hedging forward contracts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openBookModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isDark
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            )}
          >
            <Plus className="w-4 h-4" />
            Book Forward
          </button>
        </div>
      </div>

      {/* Filters */}
      <ForwardFilters
        filters={pageState.filters}
        onFilterChange={(key, value) => {
          setPageState((prev) => ({
            ...prev,
            filters: { ...prev.filters, [key]: value, page: 1 },
          }));
        }}
        onClearFilters={() => {
          setPageState((prev) => ({
            ...prev,
            filters: { page: 1, pageSize: 25 },
          }));
        }}
        isDark={isDark}
        showSearch={true}
      />

      {/* Table */}
      <ForwardContractsTable
        contracts={contractsData?.data || []}
        isLoading={isLoading}
        onView={handleViewContract}
        onClose={handleCloseContract}
        onCancel={handleCancelContract}
        isDark={isDark}
      />

      {/* Modals */}
      <BookForwardModal
        exposure={null}
        isOpen={pageState.modalStates.bookModal}
        onClose={closeBookModal}
        onSuccess={() => {
          closeBookModal();
          refetch();
        }}
        isDark={isDark}
      />

      <CloseForwardModal
        contract={pageState.selectedContract}
        isOpen={pageState.modalStates.closeModal}
        onClose={closeCloseModal}
        onSuccess={() => {
          closeCloseModal();
          refetch();
        }}
        isDark={isDark}
      />

      <CancelForwardModal
        contract={pageState.selectedContract}
        isOpen={pageState.modalStates.cancelModal}
        onClose={closeCancelModal}
        onSuccess={() => {
          closeCancelModal();
          refetch();
        }}
        isDark={isDark}
      />
    </div>
  );
};
