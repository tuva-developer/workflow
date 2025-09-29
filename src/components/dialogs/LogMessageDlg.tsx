import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import JSONView from "@/components/common/JSONView";
import { useMemo } from "react";

interface LogMessageDialogProps {
  isOpen: boolean;
  logMessage: string;
  onClose: () => void;
}

const LogMessageDialog = ({
  isOpen,
  logMessage,
  onClose,
}: LogMessageDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const parsedJSON = useMemo(() => {
    try {
      const parsed = JSON.parse(logMessage);
      return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  }, [logMessage]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Log message")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent>
        {parsedJSON ? (
          <JSONView jsonData={parsedJSON} />
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
            {logMessage}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogMessageDialog;
