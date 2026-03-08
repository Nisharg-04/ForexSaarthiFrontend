// ═══════════════════════════════════════════════════════════════════════════════
// EXPOSURE PERMISSIONS HOOK
// Hook for checking user permissions on exposure actions
// ForexSaarthi - Professional Treasury & Risk Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { useAuth } from '../../../hooks/useRedux';
import type { Exposure } from '../types';
import {
  canViewExposures,
  canCreateHedge,
  canCloseHedge,
  canApplyForwardHedge,
  canApplyNaturalHedge,
  canCloseExposureHedge,
} from '../exposureUtils';

interface ExposurePermissions {
  canView: boolean;
  canHedge: boolean;
  canCloseHedge: boolean;
}

interface ExposureActionPermissions extends ExposurePermissions {
  canApplyForward: boolean;
  canApplyNatural: boolean;
  canClose: boolean;
}

/**
 * Hook for general exposure permissions
 */
export const useExposurePermissions = (): ExposurePermissions => {
  const { role } = useAuth();

  return useMemo(() => ({
    canView: canViewExposures(role),
    canHedge: canCreateHedge(role),
    canCloseHedge: canCloseHedge(role),
  }), [role]);
};

/**
 * Hook for exposure-specific action permissions
 */
export const useExposureActionPermissions = (
  exposure: Exposure | undefined | null
): ExposureActionPermissions => {
  const { role } = useAuth();

  return useMemo(() => {
    if (!exposure) {
      return {
        canView: canViewExposures(role),
        canHedge: canCreateHedge(role),
        canCloseHedge: canCloseHedge(role),
        canApplyForward: false,
        canApplyNatural: false,
        canClose: false,
      };
    }

    return {
      canView: canViewExposures(role),
      canHedge: canCreateHedge(role),
      canCloseHedge: canCloseHedge(role),
      canApplyForward: canApplyForwardHedge(exposure, role),
      canApplyNatural: canApplyNaturalHedge(exposure, role),
      canClose: canCloseExposureHedge(exposure, role),
    };
  }, [role, exposure]);
};

export default useExposurePermissions;
