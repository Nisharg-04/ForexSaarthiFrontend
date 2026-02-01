import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../constants';
import { selectCurrentUser, selectActiveCompany } from '../app/authSlice';

// Typed Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Auth hooks
export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const activeCompany = useAppSelector(selectActiveCompany);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return {
    user,
    activeCompany,
    isAuthenticated,
    role: activeCompany?.role,
    companyId: activeCompany?.companyId,
  };
};

// Permission hook
export const usePermission = (permission: string): boolean => {
  const { role } = useAuth();
  
  if (!role) return false;
  
  const permissions = ROLE_PERMISSIONS[role as UserRole] || [];
  return permissions.includes(permission);
};

// Multiple permissions hook
export const usePermissions = (permissions: string[]): Record<string, boolean> => {
  const { role } = useAuth();
  
  if (!role) {
    return permissions.reduce((acc, perm) => ({ ...acc, [perm]: false }), {});
  }
  
  const rolePermissions = ROLE_PERMISSIONS[role as UserRole] || [];
  
  return permissions.reduce((acc, perm) => ({
    ...acc,
    [perm]: rolePermissions.includes(perm),
  }), {});
};

// Check if user has any of the specified roles
export const useHasRole = (roles: UserRole[]): boolean => {
  const { role } = useAuth();
  return role ? roles.includes(role as UserRole) : false;
};

// UI hooks
export const useTheme = () => {
  const theme = useAppSelector((state) => state.ui.theme);
  return theme;
};

export const useSidebar = () => {
  const isOpen = useAppSelector((state) => state.ui.sidebarOpen);
  return isOpen;
};
