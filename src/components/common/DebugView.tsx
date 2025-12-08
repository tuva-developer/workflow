import { useAppContext } from "@/hooks/useAppContext";
import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type DebugEntry = { level?: "error" | "console"; log?: unknown };

const isDebugEntry = (v: unknown): v is DebugEntry =>
  typeof v === "object" && v !== null && ("error" in v || "log" in v);

const toText = (v: unknown): string =>
  typeof v === "string" ? v : v != null ? String(v) : "";

const DebugView = () => {
  const theme = useTheme();
  const { debugData } = useAppContext();
  const { t } = useTranslation();

  const [debugDataChecked, setDebugDataChecked] = useState<DebugEntry[]>([]);

  useEffect(() => {
    if (!debugData) {
      setDebugDataChecked([]);
      return;
    }

    if (Array.isArray(debugData)) {
      setDebugDataChecked(debugData.filter(isDebugEntry));
      return;
    }

    if (isDebugEntry(debugData)) {
      setDebugDataChecked([debugData]);
      return;
    }

    setDebugDataChecked([]);
  }, [debugData]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {debugDataChecked.length > 0 ? (
        debugDataChecked.map((item, index) => {
          const isErr = Boolean(item.level === "error");
          const text = toText(item.log);

          return (
            <Typography
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                fontSize: 14,
                wordBreak: "break-word",
                color: isErr
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                mb: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 32,
                  textAlign: "right",
                  mr: 1,
                  pr: 1,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                  userSelect: "none",
                  opacity: 0.8,
                  fontSize: 13,
                }}
              >
                {index + 1}
              </Box>

              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 72,
                  textAlign: "left",
                }}
              >
                {`[${item.level}]: `}
              </Box>

              <Box component="span" sx={{ flex: 1 }}>
                {`${text}`}
              </Box>
            </Typography>
          );
        })
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
            m: "20px",
            p: "20px",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "14px",
              fontStyle: "italic",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {t("No debug data available")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DebugView;
