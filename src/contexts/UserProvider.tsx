// contexts/UserProvider.tsx
import React, { useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { Permission } from "@/types/enums";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const setUser = (userData: User) => setUserState(userData);
  const clearUser = () => setUserState(null);
  const isAuthenticated = !!user;

  const hasPermission = (permission: Permission): boolean =>
    !!user?.permissions?.includes(permission);

  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((p) => hasPermission(p));

  const isAdmin = (): boolean => !!user?.roles?.includes("Admin");
  const isSuperAdmin = (): boolean => !!user?.roles?.includes("SuperAdmin");

  const canView = (): boolean => hasPermission(Permission.VIEW) || isAdmin();
  const canAdd = (): boolean => hasPermission(Permission.ADD) || isAdmin();
  const canEdit = (): boolean => hasPermission(Permission.EDIT) || isAdmin();
  const canDelete = (): boolean => hasPermission(Permission.DELETE) || isAdmin();
  const canExecute = (): boolean => hasPermission(Permission.EXECUTE) || isAdmin();
  const canInvoke = (): boolean => hasPermission(Permission.INVOKE) || isAdmin();

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        clearUser,
        authChecked,
        setAuthChecked,
        isAuthenticated,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isSuperAdmin,
        canView,
        canAdd,
        canEdit,
        canDelete,
        canExecute,
        canInvoke,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};