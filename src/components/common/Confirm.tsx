import React from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useAppContext } from "@/hooks/useAppContext";

const ConfirmDialog: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { confirmDialog } = useAppContext();

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      confirmDialog.onOk();
    }
  };

  return (
    <Dialog
      open={confirmDialog.isOpen}
      onClose={confirmDialog.onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
        },
      }}
      onKeyDown={handleKeyDown}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width={64}
          height={64}
          borderRadius="50%"
          bgcolor={`${theme.palette.error.light}33`}
          mb={1}
        >
          <FaTriangleExclamation size={32} color={theme.palette.error.main} />
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom color="error">
          {t("Warning")}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {confirmDialog.message}
        </Typography>
      </Box>

      <DialogActions sx={{ justifyContent: "center", mt: 3 }}>
        <Button
          onClick={confirmDialog.onOk}
          variant="contained"
          color="inherit"
          sx={{ borderRadius: 2, px: 4, textTransform: "none" }}
        >
          {t("Yes")}
        </Button>
        <Button
          onClick={confirmDialog.onClose}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2, px: 4, textTransform: "none" }}
        >
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
