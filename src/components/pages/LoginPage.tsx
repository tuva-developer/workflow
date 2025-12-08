import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/usePageTitle";
import LanguageSelector from "@/components/common/LanguageSelector";
import ThemeChange from "@/components/common/ThemeChange";
import { useTranslation } from "react-i18next";
import CustomTextField from "@/components/common/CustomTextField";
import { login, ensureAuthenticatedUser } from "@/auth/auth-api";
import { useUser } from "@/hooks/useUser";
import { setUserId } from "@/global/appState";
import { useErrorMessage } from "@/hooks/useErrorMessage";

export default function LoginPage() {
  usePageTitle("Login");
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const getErrorMessage = useErrorMessage();

  const { user, setUser, clearUser, authChecked, setAuthChecked } = useUser();

  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authChecked) return;
    if (user) navigate("/home", { replace: true });
  }, [authChecked, user, navigate]);

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
          navigate("/home", { replace: true });
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
  }, [authChecked, setAuthChecked, setUser, clearUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username: userLogin, password });

      const { authenticated, user } = await ensureAuthenticatedUser();
      if (authenticated && user) {
        setUser(user);
        if (user.userId != null) setUserId(user.userId);
        setAuthChecked(true);
        navigate("/home", { replace: true });
      } else {
        clearUser();
        setError(t("Login failed"));
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked && !user) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 2,
          pt: 1,
          pr: 2,
        }}
      >
        <ThemeChange />
        <LanguageSelector />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          width: "100%",
          mt: -10,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{
              height: 64,
              width: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 32,
            marginBottom: 2,
            color: theme.palette.text.primary,
          }}
        >
          Vietbando Workflow
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: theme.palette.text.secondary,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          {t("Welcome to the workflow platform")}
        </motion.h2>

        <Container maxWidth="xs" sx={{ zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                backdropFilter: "blur(12px)",
                bgcolor: theme.palette.background.paper,
                boxShadow: 5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textAlign: "center",
                  fontSize: 24,
                }}
              >
                {t("Login account")}
              </Typography>
              <Box
                component="form"
                onSubmit={handleLogin}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <CustomTextField
                  size="medium"
                  label={t("Username")}
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                />

                <CustomTextField
                  size="medium"
                  label={t("Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  toggleVisibility
                  required
                />

                {error && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    {error}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 4,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 16,
                    color: theme.palette.text.secondary,
                    background:
                      theme.palette.mode === "light"
                        ? "linear-gradient(120deg, #F8FAFC, #dbeafe, #F8FAFC)"
                        : "linear-gradient(120deg, #181C14, #16213E, #181C14)",
                    boxShadow: `0 4px 8px ${
                      theme.palette.mode === "light"
                        ? theme.palette.primary.dark
                        : theme.palette.primary.light
                    }`,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      background:
                        theme.palette.mode === "light" ? "#F8FAFC" : "#16213E",
                      boxShadow: `0 4px 8px ${
                        theme.palette.mode === "light"
                          ? theme.palette.primary.light
                          : theme.palette.primary.dark
                      }`,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    t("Login")
                  )}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
