import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tokenStorage } from "@/auth/token-storage";

export default function LoginByTokenPage() {
  const [query] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = query.get("access_token");

    if (token) {
      tokenStorage.setAccess(token || "");

      const refeshToken = query.get("refresh_token");

      if (refeshToken) {
        tokenStorage.setRefresh(refeshToken || "");
      }

      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, query]);

  return null;
}
