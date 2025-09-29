import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import JsonEditor from "@/components/common/JSONEditor";
import { useState } from "react";
import { dialogStyles } from "@/styles/styles";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";

interface InputScheduleProps {
  open: boolean;
  onClose: () => void;
  data: Record<string, unknown>;
  setData: (value: Record<string, unknown>) => void;
}

export default function InputScheduleDialog({
  open,
  onClose,
  data,
  setData,
}: InputScheduleProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tempData, setTempData] = useState<Record<string, unknown>>(data);

  const handleSave = () => {
    setData(tempData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Set input data")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent>
        <JsonEditor
          value={tempData}
          onChange={(value) => setTempData(value as Record<string, unknown>)}
          mode="code"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} className="blue">
          {t("Save")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
