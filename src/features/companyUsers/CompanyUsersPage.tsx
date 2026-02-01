import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAppSelector } from '../../hooks/useRedux';
import { useGetCompanyUsersQuery } from '../../services/companyApi';
import { isAdmin } from '../../utils/roleHelpers';
import { useActionBar, type ActionItem } from '../../components/ui/BottomActionBar';
import { CompanyUsersTable } from './CompanyUsersTable';
import { AddUserModal } from './AddUserModal';
import { cn } from '../../utils/helpers';

export const CompanyUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompany, role } = useAuth();
  const { setActions, clearActions } = useActionBar();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data, isLoading, refetch } = useGetCompanyUsersQuery(
    activeCompany?.companyId || '',
    { skip: !activeCompany?.companyId }
  );

  const users = data?.data || [];

  // Check admin access
  useEffect(() => {
    if (!isAdmin(role)) {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  // Set up bottom action bar
  useEffect(() => {
    const actions: ActionItem[] = [
      {
        id: 'add-user',
        label: 'Add User',
        variant: 'primary',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        ),
        onClick: () => setShowAddModal(true),
      },
    ];

    setActions(actions);
    return () => clearActions();
  }, [setActions, clearActions]);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={cn(
          "w-8 h-8 border-2 rounded-full animate-spin",
          isDark ? "border-slate-600 border-t-cyan-400" : "border-slate-300 border-t-slate-600"
        )}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className={cn(
            "flex items-center gap-1 text-sm mb-4 transition-colors",
            isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>
              Company Users
            </h1>
            <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
              Manage users who have access to {activeCompany?.companyName}
            </p>
          </div>
          <div className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <CompanyUsersTable 
        users={users} 
        companyId={activeCompany?.companyId || ''} 
        onRefetch={refetch}
        isDark={isDark}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        companyId={activeCompany?.companyId || ''}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        isDark={isDark}
      />
    </div>
  );
};
