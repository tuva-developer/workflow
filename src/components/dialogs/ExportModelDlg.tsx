import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { saveXML } from "@/utils/defines";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { showWarn } from "@/utils/toastConfig";
interface ExportModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  modelXML: string;
  modelName?: string;
}

const ExportModelDialog: React.FC<ExportModelDialogProps> = ({
  isOpen,
  onClose,
  modelXML,
  modelName = "",
}) => {
  const theme = useTheme();
  const [fileNameToExport, setFileNameToExport] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setFileNameToExport(modelName);
  }, [modelName]);

  const handleClickOk = async () => {
    if (!fileNameToExport) {
      showWarn(t("Please enter file name"));

      return;
    }

    saveXML(modelXML, fileNameToExport);

    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClickOk();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      onKeyDown={handleKeyDown}
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Enter filename")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", alignItems: "baseline" }}>
        <TextField
          autoFocus
          value={fileNameToExport}
          margin="dense"
          label={t("Filename")}
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => setFileNameToExport(e.target.value)}
        />
        <span>.bpmn</span>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickOk} className="blue">
          {t("OK")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModelDialog;
