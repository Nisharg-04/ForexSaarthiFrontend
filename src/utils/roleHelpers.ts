import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../constants';

/**
 * Check if a role has admin privileges
 */
export const isAdmin = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Check if a role has finance privileges (Admin or Finance)
 */
export const hasFinanceAccess = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN || role === UserRole.FINANCE;
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole | undefined | null, permission: string): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if user can edit company (Admin only)
 */
export const canEditCompany = (role: UserRole | undefined | null): boolean => {
  return isAdmin(role);
};

/**
 * Check if user can delete company (Admin only)
 */
export const canDeleteCompany = (role: UserRole | undefined | null): boolean => {
  return isAdmin(role);
};

/**
 * Check if user can manage company users (Admin only)
 */
export const canManageUsers = (role: UserRole | undefined | null): boolean => {
  return isAdmin(role);
};

/**
 * Check if user can create trades/invoices (Admin or Finance)
 */
export const canCreateTransactions = (role: UserRole | undefined | null): boolean => {
  return hasFinanceAccess(role);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole | undefined | null): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.FINANCE:
      return 'Finance';
    case UserRole.AUDITOR:
      return 'Auditor';
    default:
      return 'Unknown';
  }
};

/**
 * Get role badge color classes
 */
export const getRoleBadgeClasses = (role: UserRole | undefined | null): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'bg-slate-700 text-white';
    case UserRole.FINANCE:
      return 'bg-blue-600 text-white';
    case UserRole.AUDITOR:
      return 'bg-slate-400 text-white';
    default:
      return 'bg-gray-300 text-gray-700';
  }
};
