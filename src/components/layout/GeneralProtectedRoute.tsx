import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { ensureAuthenticatedUser } from "@/auth/auth-api";
import { setUserId } from "@/global/appState";

const GeneralProtectedRoute = () => {
  const { user, setUser, clearUser, authChecked, setAuthChecked } = useUser();

  useEffect(() => {
    if (authChecked) return;

    let cancelled = false;
    (async () => {
      try {
        const { authenticated, user } = await ensureAuthenticatedUser();
        if (cancelled) return;

        if (authenticated && user) {
          setUser(user);
          if (user.userId != null) setUserId(user.userId);
        } else {
          clearUser();
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authChecked, setAuthChecked, setUser, clearUser]);

  if (!authChecked) return null;

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default GeneralProtectedRoute;