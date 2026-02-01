import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { useActionBar, type ActionItem } from '../../../components/ui/BottomActionBar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { cn } from '../../../utils/helpers';
import { 
  useGetPartiesQuery, 
  useCreatePartyMutation, 
  useUpdatePartyMutation, 
  useDeletePartyMutation 
} from '../api/partyApi';
import type { Party, PartyFormData, PartyFilters } from '../types';
import { PartyType } from '../types';
import { PartyTable } from '../components/PartyTable';
import { PartyForm } from '../components/PartyForm';
import { PartyDetailsDrawer } from '../components/PartyDetailsDrawer';
import { canCreateParty, canEditParty, canDeleteParty, filterPartiesBySearch } from '../partyUtils';

export const PartyPage: React.FC = () => {
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  const { setActions, clearActions } = useActionBar();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState<PartyFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useGetPartiesQuery(filters);
  const [createParty, { isLoading: isCreating }] = useCreatePartyMutation();
  const [updateParty, { isLoading: isUpdating }] = useUpdatePartyMutation();
  const [deleteParty, { isLoading: isDeleting }] = useDeletePartyMutation();

  const parties = data?.data || [];
  const filteredParties = filterPartiesBySearch(parties, searchTerm);

  // Permission checks
  const canCreate = canCreateParty(role);
  const canEdit = canEditParty(role);
  const canDelete = canDeleteParty(role);

  // Action Handlers
  const handleOpenCreate = useCallback(() => {
    setSelectedParty(null);
    setFormMode('create');
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((party: Party) => {
    setSelectedParty(party);
    setFormMode('edit');
    setIsFormOpen(true);
  }, []);

  const handleOpenDetails = useCallback((party: Party) => {
    setSelectedParty(party);
    setIsDetailsOpen(true);
  }, []);

  const handleOpenDelete = useCallback((party: Party) => {
    setSelectedParty(party);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedParty(null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedParty(null);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setSelectedParty(null);
  }, []);

  // Form Submit Handler
  const handleFormSubmit = useCallback(async (formData: PartyFormData) => {
    try {
      if (formMode === 'create') {
        await createParty(formData).unwrap();
      } else if (selectedParty) {
        await updateParty({
          id: selectedParty.id,
          ...formData,
        }).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      // Error is handled by RTK Query - you can add toast notification here
      console.error('Failed to save party:', error);
    }
  }, [formMode, selectedParty, createParty, updateParty, handleCloseForm]);

  // Delete Handler
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedParty) return;
    
    try {
      await deleteParty(selectedParty.id).unwrap();
      handleCloseDelete();
    } catch (error) {
      console.error('Failed to delete party:', error);
    }
  }, [selectedParty, deleteParty, handleCloseDelete]);

  // Setup Bottom Action Bar
  useEffect(() => {
    const actions: ActionItem[] = [];

    if (canCreate) {
      actions.push({
        id: 'add-party',
        label: 'Add Party',
        variant: 'primary',
        icon: <Plus className="w-4 h-4" />,
        onClick: handleOpenCreate,
      });
    }

    actions.push({
      id: 'refresh',
      label: 'Refresh',
      variant: 'default',
      icon: <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />,
      onClick: () => refetch(),
      disabled: isFetching,
    });

    setActions(actions);
    return () => clearActions();
  }, [canCreate, isFetching, setActions, clearActions, handleOpenCreate, refetch]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className={cn(
            'w-8 h-8 border-2 rounded-full animate-spin',
            isDark ? 'border-slate-600 border-t-cyan-400' : 'border-slate-300 border-t-slate-600'
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            Parties
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Manage your buyers and suppliers
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}
          />
          <input
            type="text"
            placeholder="Search parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2 text-sm rounded-md border transition-colors',
              'focus:outline-none focus:ring-2',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500'
            )}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div
        className={cn(
          'flex items-center gap-6 px-4 py-3 rounded-lg border',
          isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        )}
      >
        <div>
          <p className={cn('text-xs font-medium uppercase', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Total Parties
          </p>
          <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            {parties.length}
          </p>
        </div>
        <div className={cn('w-px h-8', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        <div>
          <p className={cn('text-xs font-medium uppercase', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Buyers
          </p>
          <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            {parties.filter((p: Party) => p.type === PartyType.BUYER).length}
          </p>
        </div>
        <div className={cn('w-px h-8', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        <div>
          <p className={cn('text-xs font-medium uppercase', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Suppliers
          </p>
          <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
            {parties.filter((p: Party) => p.type === PartyType.SUPPLIER).length}
          </p>
        </div>
      </div>

      {/* Party Table */}
      <PartyTable
        parties={filteredParties}
        isDark={isDark}
        userRole={role}
        onView={handleOpenDetails}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        selectedPartyId={selectedParty?.id}
      />

      {/* Party Form Modal */}
      <PartyForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        party={selectedParty}
        mode={formMode}
        isDark={isDark}
        isLoading={isCreating || isUpdating}
      />

      {/* Party Details Drawer */}
      <PartyDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        party={selectedParty}
        isDark={isDark}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Party"
        message={
          selectedParty
            ? `Are you sure you want to delete "${selectedParty.name}"? This action will mark the party as inactive and cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PartyPage;
