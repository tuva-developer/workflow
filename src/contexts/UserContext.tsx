import { createContext } from "react";
import { Permission } from "@/types/enums";

export interface UserContextType {
  user: User | null;
  setUser: (userData: User) => void;
  clearUser: () => void;
  authChecked: boolean;
  setAuthChecked: (v: boolean) => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canView: () => boolean;
  canAdd: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canExecute: () => boolean;
  canInvoke: () => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);