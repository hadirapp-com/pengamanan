import { useAuthStore } from "@/store/auth";

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canImport: boolean;
  canAdd: boolean;
  canView: boolean;
}

/**
 * Hook to get role-based permissions for the current user
 * @returns RolePermissions object with boolean flags for each permission
 */
export const useRolePermissions = (): RolePermissions => {
  const { getProfile } = useAuthStore();
  const currentUser = getProfile();
  const userRole = currentUser?.role || 'user';

  // Define permissions based on role
  const permissions: Record<string, RolePermissions> = {
    admin: {
      canEdit: true,
      canDelete: true,
      canImport: true,
      canAdd: true,
      canView: true,
    },
    user: {
      canEdit: false,
      canDelete: false,
      canImport: false,
      canAdd: false,
      canView: true,
    },
  };

  return permissions[userRole] || permissions.user;
};

/**
 * Hook to get specific permission for current user
 * @param permission - The specific permission to check
 * @returns boolean indicating if user has the permission
 */
export const usePermission = (permission: keyof RolePermissions): boolean => {
  const permissions = useRolePermissions();
  return permissions[permission];
};

/**
 * Utility function to get role-based action restrictions for DataTableRowActions
 * @returns Object with disable flags for row actions
 */
export const useRowActionRestrictions = () => {
  const { canEdit, canDelete } = useRolePermissions();
  
  return {
    disableEdit: !canEdit,
    disableDelete: !canDelete,
    editDisabledReason: !canEdit ? "User role cannot edit records" : undefined,
    deleteDisabledReason: !canDelete ? "User role cannot delete records" : undefined,
  };
}; 