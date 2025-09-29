import { useAppContext } from "@/hooks/useAppContext";
import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type DebugEntry = { error?: unknown; log?: unknown };

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
        p: "10px 20px",
      }}
    >
      {debugDataChecked.length > 0 ? (
        debugDataChecked.map((item, index) => {
          const isErr = Boolean(item.error);
          const text = toText(item.error ?? item.log);

          return (
            <Typography
              key={index}
              sx={{
                color: isErr ? theme.palette.error.main : theme.palette.success.main,
                wordBreak: "break-word",
                fontSize: "14px",
              }}
            >
              <span style={{ color: theme.palette.text.secondary }}>{index + 1}</span>
              <span
                style={{
                  color: theme.palette.text.secondary,
                  padding: "0 20px 0 10px",
                }}
              >
                |
              </span>
              {text}
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