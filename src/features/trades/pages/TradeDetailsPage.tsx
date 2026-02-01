import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth, useAppSelector } from '../../../hooks/useRedux';
import { cn } from '../../../utils/helpers';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  useGetTradeQuery,
  useSubmitTradeMutation,
  useApproveTradeMutation,
  useCancelTradeMutation,
  useCloseTradeMutation,
} from '../api/tradeApi';
import { TradeHeader } from '../components/TradeHeader';
import { TradeInfoCard } from '../components/TradeInfoCard';
import { TradeTimeline } from '../components/TradeTimeline';
import { TradeActions } from '../components/TradeActions';
import { TradeForm } from '../components/TradeForm';
import { CancelTradeModal } from '../components/CancelTradeModal';
import type { TradeFormData } from '../types';
import { useUpdateTradeMutation } from '../api/tradeApi';
import { canEditTrade } from '../tradeUtils';

export const TradeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  // API Hooks
  const { data, isLoading, error, refetch } = useGetTradeQuery(id!, { skip: !id });
  const [updateTrade, { isLoading: isUpdating }] = useUpdateTradeMutation();
  const [submitTrade, { isLoading: isSubmitting }] = useSubmitTradeMutation();
  const [approveTrade, { isLoading: isApproving }] = useApproveTradeMutation();
  const [cancelTrade, { isLoading: isCancelling }] = useCancelTradeMutation();
  const [closeTrade, { isLoading: isClosing }] = useCloseTradeMutation();

  const trade = data?.data;
  console.log(trade)

  // Edit Handler
  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (formData: TradeFormData) => {
      if (!trade) return;

      try {
        await updateTrade({
          id: trade.id,
          partyId: formData.partyId,
          tradeType: formData.tradeType,
          tradeReference: formData.tradeReference || undefined,
          remarks: formData.remarks || undefined,
        }).unwrap();
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Failed to update trade:', error);
        throw error;
      }
    },
    [trade, updateTrade]
  );

  // Submit Handler
  const handleSubmit = useCallback(() => {
    setIsSubmitDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    if (!trade) return;

    try {
      await submitTrade(trade.id).unwrap();
      setIsSubmitDialogOpen(false);
    } catch (error) {
      console.error('Failed to submit trade:', error);
    }
  }, [trade, submitTrade]);

  // Approve Handler
  const handleApprove = useCallback(() => {
    setIsApproveDialogOpen(true);
  }, []);

  const handleConfirmApprove = useCallback(async () => {
    if (!trade) return;

    try {
      await approveTrade(trade.id).unwrap();
      setIsApproveDialogOpen(false);
    } catch (error) {
      console.error('Failed to approve trade:', error);
    }
  }, [trade, approveTrade]);

  // Cancel Handler
  const handleCancel = useCallback(() => {
    setIsCancelModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(
    async (cancelReason: string) => {
      if (!trade) return;

      try {
        await cancelTrade({
          id: trade.id,
          cancelReason,
        }).unwrap();
        setIsCancelModalOpen(false);
      } catch (error) {
        console.error('Failed to cancel trade:', error);
        throw error;
      }
    },
    [trade, cancelTrade]
  );

  // Close Handler
  const handleClose = useCallback(() => {
    setIsCloseDialogOpen(true);
  }, []);

  const handleConfirmClose = useCallback(async () => {
    if (!trade) return;

    try {
      await closeTrade(trade.id).unwrap();
      setIsCloseDialogOpen(false);
    } catch (error) {
      console.error('Failed to close trade:', error);
    }
  }, [trade, closeTrade]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className={cn(
            'w-8 h-8 border-2 rounded-full animate-spin',
            isDark
              ? 'border-slate-700 border-t-cyan-400'
              : 'border-slate-200 border-t-teal-600'
          )}
        />
      </div>
    );
  }

  // Error State
  if (error || !trade) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
            isDark ? 'bg-red-900/30' : 'bg-red-100'
          )}
        >
          <AlertCircle className={cn('w-8 h-8', isDark ? 'text-red-400' : 'text-red-500')} />
        </div>
        <h3 className={cn('text-lg font-medium mb-1', isDark ? 'text-white' : 'text-slate-900')}>
          Trade Not Found
        </h3>
        <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          The trade you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/dashboard/trades')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isDark
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          )}
        >
          Back to Trades
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trade Header */}
      <TradeHeader trade={trade} isDark={isDark} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <TradeInfoCard trade={trade} isDark={isDark} />
          <TradeActions
            trade={trade}
            userRole={role}
            isDark={isDark}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            onApprove={handleApprove}
            onCancel={handleCancel}
            onClose={handleClose}
            isSubmitting={isSubmitting}
            isApproving={isApproving}
            isClosing={isClosing}
          />
        </div>

        {/* Right Column - Timeline */}
        <div>
          <TradeTimeline trade={trade} isDark={isDark} />
        </div>
      </div>

      {/* Edit Trade Modal */}
      <TradeForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        trade={trade}
        mode="edit"
        isDark={isDark}
        isLoading={isUpdating}
      />

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSubmitDialogOpen}
        title="Submit for Approval"
        message={`Are you sure you want to submit trade ${trade.tradeNumber} for approval? This action cannot be undone and the trade will no longer be editable.`}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsSubmitDialogOpen(false)}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isApproveDialogOpen}
        title="Approve Trade"
        message={`Are you sure you want to approve trade ${trade.tradeNumber}? This will mark the trade as approved and allow business actions.`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isApproving}
        onConfirm={handleConfirmApprove}
        onCancel={() => setIsApproveDialogOpen(false)}
      />

      {/* Cancel Trade Modal */}
      <CancelTradeModal
        isOpen={isCancelModalOpen}
        trade={trade}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isDark={isDark}
        isLoading={isCancelling}
      />

      {/* Close Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCloseDialogOpen}
        title="Close Trade"
        message={`Are you sure you want to close trade ${trade.tradeNumber}? This will mark the trade as complete and it will become a historical record.`}
        confirmLabel="Close Trade"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isClosing}
        onConfirm={handleConfirmClose}
        onCancel={() => setIsCloseDialogOpen(false)}
      />
    </div>
  );
};

export default TradeDetailsPage;
