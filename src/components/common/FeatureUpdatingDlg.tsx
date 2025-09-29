import React from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import { FaCircleInfo } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface FeatureUpdatingDialogProps {
  open: boolean;
  onClose: () => void;
}

const FeatureUpdatingDialog: React.FC<FeatureUpdatingDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
        },
      }}
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
          mb={1}
        >
          <FaCircleInfo size={32} color={theme.palette.info.main} />
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("Feature Updating")}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t(
            "This feature is currently under development and will be available soon."
          )}
        </Typography>
      </Box>

      <DialogActions sx={{ justifyContent: "center", mt: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="info"
          sx={{ borderRadius: 2, px: 4, textTransform: "none" }}
        >
          {t("Got it")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureUpdatingDialog;
