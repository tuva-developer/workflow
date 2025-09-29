import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  useTheme,
  IconButton,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import LogsTable from "@/components/tables/LogsTable";
import JSONView from "@/components/common/JSONView";

const highlighterStyleProps = {
  fontSize: 13,
  borderRadius: 8,
  padding: 16,
  overflow: "auto",
  margin: 0,
};

interface ElementDetailDlgProps {
  open: boolean;
  onClose: () => void;
  elementId?: string;
  elementName?: string;
  script: string;
  dataOutput: string;
  logs: Log[];
}

export default function ElementDetailDlg({
  open,
  onClose,
  elementId,
  elementName,
  script,
  dataOutput,
  logs,
}: ElementDetailDlgProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const highlighterStyle = theme.palette.mode === "light" ? oneLight : oneDark;

  const renderContent = () => {
    switch (tab) {
      case 0:
        return (
          <SyntaxHighlighter
            language="javascript"
            style={highlighterStyle}
            customStyle={highlighterStyleProps}
          >
            {script || t("No script")}
          </SyntaxHighlighter>
        );
      case 1: {
        let parsed: object | null = null;
        try {
          const maybeParsed = JSON.parse(dataOutput);
          if (typeof maybeParsed === "object" && maybeParsed !== null) {
            parsed = maybeParsed;
          }
        } catch {
          parsed = null;
        }

        return parsed ? (
          <JSONView jsonData={parsed} />
        ) : (
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              padding: 16,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 8,
            }}
          >
            {dataOutput || t("No output data")}
          </pre>
        );
      }
      case 2:
        return <LogsTable logs={logs} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        ...dialogStyles(theme),
        "& .MuiDialog-paper": {
          height: "87vh",
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography>
          {elementName ? ` (${elementName})` : ""}
          {elementId ? ` [${elementId}]` : ""}
        </Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          textColor="primary"
          centered
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
              height: 3,
              borderRadius: 2,
            },
          }}
          sx={{
            "& .MuiTab-root": {
              color: theme.palette.text.secondary,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <Tab label={t("Script")} />
          <Tab label={t("Data output")} />
          <Tab label={t("Logs")} />
        </Tabs>
      </Box>

      <DialogContent>
        <Box>{renderContent()}</Box>
      </DialogContent>
    </Dialog>
  );
}
