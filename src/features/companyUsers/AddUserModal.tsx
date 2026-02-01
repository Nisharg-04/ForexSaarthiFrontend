import React, { useState } from 'react';
import { useAddCompanyUserMutation } from '../../services/companyApi';
import { UserRole } from '../../types';
import { cn } from '../../utils/helpers';

interface AddUserModalProps {
  isOpen: boolean;
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
  isDark?: boolean;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  companyId,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  const [addUser, { isLoading }] = useAddCompanyUserMutation();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: UserRole.AUDITOR as typeof UserRole[keyof typeof UserRole],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await addUser({
        companyId,
        email: formData.email,
        role: formData.role,
      }).unwrap();
      setFormData({ email: '', role: UserRole.AUDITOR });
      onSuccess();
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to add user');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 transition-opacity",
          isDark ? "bg-black bg-opacity-50" : "bg-black bg-opacity-30"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={cn(
          "relative w-full max-w-md rounded-lg shadow-lg",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            isDark ? "border-slate-800" : "border-slate-200"
          )}>
            <h2 className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>Add User</h2>
            <button
              onClick={onClose}
              className={cn(
                "transition-colors",
                isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
              )}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className={cn(
                "p-3 text-sm border rounded-md",
                isDark 
                  ? "bg-red-900/20 text-red-400 border-red-800" 
                  : "bg-red-50 text-red-700 border-red-200"
              )}>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className={cn(
                "block text-sm font-medium mb-1.5",
                isDark ? "text-slate-300" : "text-slate-700"
              )}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  isDark 
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500"
                )}
                placeholder="user@company.com"
                autoFocus
              />
              <p className={cn(
                "text-xs mt-1.5",
                isDark ? "text-slate-500" : "text-slate-500"
              )}>
                User must have an existing ForexSaarthi account
              </p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className={cn(
                "block text-sm font-medium mb-1.5",
                isDark ? "text-slate-300" : "text-slate-700"
              )}>
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={cn(
                  "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                  isDark 
                    ? "bg-slate-800 border-slate-700 text-white focus:ring-cyan-500"
                    : "bg-white border-slate-300 text-slate-900 focus:ring-slate-500"
                )}
              >
                <option value={UserRole.ADMIN}>Admin - Full access</option>
                <option value={UserRole.FINANCE}>Finance - Create & edit transactions</option>
                <option value={UserRole.AUDITOR}>Auditor - Read-only access</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium border rounded-md transition-colors",
                  isDark 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  isDark 
                    ? "bg-cyan-600 text-white hover:bg-cyan-500"
                    : "bg-slate-800 text-white hover:bg-slate-900"
                )}
              >
                {isLoading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
