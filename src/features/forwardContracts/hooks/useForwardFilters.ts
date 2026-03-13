// ═══════════════════════════════════════════════════════════════════════════════
// FORWARD CONTRACTS MODULE - CUSTOM HOOKS
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useRedux';
import type { ForwardFilters, ForwardStatus } from '../types';
import { DEFAULT_PAGE_SIZE } from '../forwardConstants';
import { getCurrentQuarter } from '../forwardUtils';

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD FILTERS HOOK
// ─────────────────────────────────────────────────────────────────────────────────
export interface UseForwardFiltersReturn {
  filters: ForwardFilters;
  updateFilter: <K extends keyof ForwardFilters>(key: K, value: ForwardFilters[K]) => void;
  updateFilters: (updates: Partial<ForwardFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  resetPagination: () => void;
}

const getInitialFilters = (): ForwardFilters => ({
  currency: '',
  bank: '',
  status: '' as ForwardStatus | '',
  year: undefined,
  quarter: '',
  search: '',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: 'contractDate',
  sortOrder: 'desc',
});

export const useForwardFilters = (): UseForwardFiltersReturn => {
  const [filters, setFilters] = useState<ForwardFilters>(getInitialFilters());

  const updateFilter = useCallback(<K extends keyof ForwardFilters>(
    key: K,
    value: ForwardFilters[K]
  ) => {
    setFilters((prev: ForwardFilters) => ({
      ...prev,
      [key]: value,
      // Reset pagination when filter changes (except for page/pageSize changes)
      ...(key !== 'page' && key !== 'pageSize' ? { page: 1 } : {}),
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<ForwardFilters>) => {
    setFilters((prev: ForwardFilters) => ({
      ...prev,
      ...updates,
      page: 1, // Reset pagination on bulk update
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(getInitialFilters());
  }, []);

  const resetPagination = useCallback(() => {
    setFilters((prev: ForwardFilters) => ({ ...prev, page: 1 }));
  }, []);

  const { hasActiveFilters, activeFilterCount } = useMemo(() => {
    let count = 0;
    if (filters.currency) count++;
    if (filters.bank) count++;
    if (filters.status) count++;
    if (filters.year) count++;
    if (filters.quarter) count++;
    if (filters.search) count++;

    return {
      hasActiveFilters: count > 0,
      activeFilterCount: count,
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    resetPagination,
  };
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD PERMISSIONS HOOK
// ─────────────────────────────────────────────────────────────────────────────────
export interface ForwardPermissions {
  canView: boolean;
  canBook: boolean;
  canClose: boolean;
  canCancel: boolean;
  isReadOnly: boolean;
}

export const useForwardPermissions = (): ForwardPermissions => {
  const { role } = useAuth();

  return useMemo(() => {
    const isAdmin = role === 'ADMIN';
    const isFinance = role === 'FINANCE';
    const isAuditor = role === 'AUDITOR';

    const canModify = isAdmin || isFinance;
    const isReadOnly = isAuditor;

    return {
      canView: true, // Everyone can view
      canBook: canModify,
      canClose: canModify,
      canCancel: canModify,
      isReadOnly,
    };
  }, [role]);
};

// ─────────────────────────────────────────────────────────────────────────────────
// QUARTER SELECTION HOOK
// ─────────────────────────────────────────────────────────────────────────────────
export interface UseQuarterSelectionReturn {
  selectedYear: number;
  selectedQuarter: string;
  setSelectedYear: (year: number) => void;
  setSelectedQuarter: (quarter: string) => void;
  quarterLabel: string;
}

export const useQuarterSelection = (): UseQuarterSelectionReturn => {
  const { quarter: currentQuarter, year: currentYear } = getCurrentQuarter();
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(currentQuarter);

  const quarterLabel = useMemo(() => {
    return `${selectedQuarter} ${selectedYear}`;
  }, [selectedQuarter, selectedYear]);

  return {
    selectedYear,
    selectedQuarter,
    setSelectedYear,
    setSelectedQuarter,
    quarterLabel,
  };
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD CONTRACT SELECTION HOOK
// ─────────────────────────────────────────────────────────────────────────────────
export interface UseForwardSelectionReturn {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  hasSelection: boolean;
  selectionCount: number;
}

export const useForwardSelection = (): UseForwardSelectionReturn => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.length > 0,
    selectionCount: selectedIds.length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────────
// FORWARD MODAL STATE HOOK
// ─────────────────────────────────────────────────────────────────────────────────
import type { ForwardContract } from '../types';

export interface ModalState<T = ForwardContract> {
  isOpen: boolean;
  data: T | null;
}

export interface UseForwardModalsReturn {
  bookModal: ModalState<{ exposureId: string; unhedgedAmount: number; currency: string }>;
  closeModal: ModalState<ForwardContract>;
  cancelModal: ModalState<ForwardContract>;
  openBookModal: (data: { exposureId: string; unhedgedAmount: number; currency: string }) => void;
  openCloseModal: (contract: ForwardContract) => void;
  openCancelModal: (contract: ForwardContract) => void;
  closeAllModals: () => void;
}

export const useForwardModals = (): UseForwardModalsReturn => {
  const [bookModal, setBookModal] = useState<ModalState<{ exposureId: string; unhedgedAmount: number; currency: string }>>({
    isOpen: false,
    data: null,
  });
  const [closeModal, setCloseModal] = useState<ModalState<ForwardContract>>({
    isOpen: false,
    data: null,
  });
  const [cancelModal, setCancelModal] = useState<ModalState<ForwardContract>>({
    isOpen: false,
    data: null,
  });

  const openBookModal = useCallback((data: { exposureId: string; unhedgedAmount: number; currency: string }) => {
    setBookModal({ isOpen: true, data });
  }, []);

  const openCloseModal = useCallback((contract: ForwardContract) => {
    setCloseModal({ isOpen: true, data: contract });
  }, []);

  const openCancelModal = useCallback((contract: ForwardContract) => {
    setCancelModal({ isOpen: true, data: contract });
  }, []);

  const closeAllModals = useCallback(() => {
    setBookModal({ isOpen: false, data: null });
    setCloseModal({ isOpen: false, data: null });
    setCancelModal({ isOpen: false, data: null });
  }, []);

  return {
    bookModal,
    closeModal,
    cancelModal,
    openBookModal,
    openCloseModal,
    openCancelModal,
    closeAllModals,
  };
};
