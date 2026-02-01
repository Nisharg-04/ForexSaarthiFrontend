import React, { useState } from 'react';
import { useUpdateCompanyUserRoleMutation, useDeactivateCompanyUserMutation, useReactivateCompanyUserMutation } from '../../services/companyApi';
import type { CompanyUser } from '../../services/companyApi';
import { UserRole } from '../../types';
import { getRoleDisplayName, getRoleBadgeClasses } from '../../utils/roleHelpers';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/helpers';

interface CompanyUsersTableProps {
  users: CompanyUser[];
  companyId: string;
  onRefetch: () => void;
  isDark?: boolean;
}

export const CompanyUsersTable: React.FC<CompanyUsersTableProps> = ({
  users,
  companyId,
  onRefetch,
  isDark = false,
}) => {
  const [updateRole] = useUpdateCompanyUserRoleMutation();
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateCompanyUserMutation();
  const [reactivateUser] = useReactivateCompanyUserMutation();
  
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setError(null);
    try {
      await updateRole({
        companyId,
        userId,
        role: newRole,
      }).unwrap();
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to update role');
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    
    setError(null);
    try {
      await deactivateUser({
        companyId,
        userId: selectedUser.userId,
      }).unwrap();
      setShowDeactivateConfirm(false);
      setSelectedUser(null);
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to deactivate user');
      setShowDeactivateConfirm(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    setError(null);
    try {
      await reactivateUser({
        companyId,
        userId,
      }).unwrap();
      onRefetch();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to reactivate user');
    }
  };

  const openDeactivateConfirm = (user: CompanyUser) => {
    setSelectedUser(user);
    setShowDeactivateConfirm(true);
  };
  console.log('Company users:', users);

  if (users.length === 0) {
    return (
      <div className={cn(
        "text-center py-12 rounded-lg border",
        isDark 
          ? "bg-slate-900 border-slate-800 text-slate-400" 
          : "bg-slate-50 border-slate-200 text-slate-500"
      )}>
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className={cn(
          "mb-4 p-3 text-sm border rounded-md",
          isDark 
            ? "bg-red-900/20 text-red-400 border-red-800" 
            : "bg-red-50 text-red-700 border-red-200"
        )}>
          {error}
        </div>
      )}

      <div className={cn(
        "border rounded-lg overflow-hidden",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <table className="w-full">
          <thead className={cn(
            "border-b",
            isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
          )}>
            <tr>
              <th className={cn(
                "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                User
              </th>
              <th className={cn(
                "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                Role
              </th>
              <th className={cn(
                "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                Status
              </th>
              <th className={cn(
                "px-4 py-3 text-right text-xs font-medium uppercase tracking-wide",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={cn(
            "divide-y",
            isDark ? "divide-slate-800" : "divide-slate-100"
          )}>
            {users.map((user) => (
              <tr key={user.id} className={cn(
                "transition-colors",
                isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
              )}>
                {/* User Info */}
                <td className="px-4 py-4">
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-slate-900"
                    )}>{user.userName}</p>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-slate-400" : "text-slate-500"
                    )}>{user.email}</p>
                  </div>
                </td>

                {/* Role Dropdown */}
                <td className="px-4 py-4">
                  {user.isActive ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.userId, e.target.value as UserRole)}
                      className={cn(
                        "text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2",
                        isDark 
                          ? "bg-slate-800 border-slate-700 text-white focus:ring-cyan-500"
                          : "bg-white border-slate-200 text-slate-900 focus:ring-slate-500"
                      )}
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.FINANCE}>Finance</option>
                      <option value={UserRole.AUDITOR}>Auditor</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${getRoleBadgeClasses(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className={cn(
                    "inline-flex px-2.5 py-1 text-xs font-medium rounded-md",
                    user.isActive
                      ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  )}>
                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  {user.isActive ? (
                    <button
                      onClick={() => openDeactivateConfirm(user)}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"
                      )}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(user.userId)}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isDark ? "text-cyan-400 hover:text-cyan-300" : "text-slate-600 hover:text-slate-800"
                      )}
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={showDeactivateConfirm}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${selectedUser?.userName}? They will no longer have access to this company.`}
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
        onCancel={() => {
          setShowDeactivateConfirm(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};
