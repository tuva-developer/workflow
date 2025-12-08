import "@/App.css";
import "react-toastify/dist/ReactToastify.css";
import "flexlayout-react/style/light.css";
import BpmnEditor from "@/components/common/BpmnEditor";
import FormBuilder from "@/components/common/FormBuilder";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";
import AppBarCustom from "@/components/layout/AppBarCustom";
import { MdDynamicForm, MdRebaseEdit } from "react-icons/md";
import { tokenStorage } from "@/auth/token-storage";
import { useUser } from "@/hooks/useUser";
import { ensureAuthenticatedUser } from "@/auth/auth-api";
import { setUserId } from "@/global/appState";

function ModelViewPage() {
  usePageTitle("Model");
  const { modelId } = useParams();
  const [query] = useSearchParams();
  const { user, setUser, clearUser, authChecked, setAuthChecked } = useUser();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (authChecked) return;

    let cancelled = false;

    (async () => {
      try {
        const token = query.get("access_token");
        const refreshToken = query.get("refresh_token");

        if (token) {
          tokenStorage.setAccess(token);
          if (refreshToken) tokenStorage.setRefresh(refreshToken);
        }

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
  }, [authChecked, setAuthChecked, setUser, clearUser, query]);

  if (!authChecked || !user) {
    return null;
  }

  return (
    <>
      <AppBarCustom
        tabs={[
          { label: "Workflow design", icon: MdRebaseEdit },
          { label: "Form builder", icon: MdDynamicForm },
        ]}
        setTabIndex={setTabIndex}
        isLimit={true}
      />

      <Box
        sx={{
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{ display: tabIndex === 0 ? "block" : "none", height: "100%" }}
        >
          <BpmnEditor modelId={modelId} isLimit={true} />
        </Box>
        <Box
          sx={{ display: tabIndex === 1 ? "block" : "none", height: "100%" }}
        >
          <FormBuilder />
        </Box>
      </Box>
    </>
  );
}

export default ModelViewPage;
