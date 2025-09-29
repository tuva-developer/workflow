import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { PiLockKeyLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { showSuccess } from "@/utils/toastConfig";
import CustomTextField from "@/components/common/CustomTextField";
import { changePassword } from "@/services/users";
import { useErrorMessage } from "@/hooks/useErrorMessage";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const getErrorMessage = useErrorMessage();

  const resetFields = useCallback(() => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }, []);

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const validate = useCallback((): string | null => {
    const oldP = oldPassword.trim();
    const newP = newPassword.trim();
    const confirmP = confirmPassword.trim();

    if (!oldP || !newP || !confirmP) return t("Please fill in all fields");
    if (newP !== confirmP) return t("New password does not match");
    if (oldP === newP)
      return t("New password must be different from current password");
    return null;
  }, [oldPassword, newPassword, confirmPassword, t]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (isSubmitting) return;

      const msg = validate();
      if (msg) {
        setError(msg);
        return;
      }

      const oldP = oldPassword.trim();
      const newP = newPassword.trim();

      try {
        setIsSubmitting(true);
        await changePassword({ oldPassword: oldP, newPassword: newP });
        showSuccess(t("Change password success"));
        resetFields();
        onClose();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      validate,
      oldPassword,
      newPassword,
      t,
      resetFields,
      onClose,
      getErrorMessage,
    ]
  );

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          <Typography>
            <PiLockKeyLight size={24} />
            {t("Change password")}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <CustomTextField
            label={t("Current password")}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            type="password"
            toggleVisibility
            required
            disabled={isSubmitting}
            autoFocus
          />

          <CustomTextField
            label={t("New password")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            toggleVisibility
            required
            disabled={isSubmitting}
          />

          <CustomTextField
            label={t("Confirm new password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            toggleVisibility
            required
            disabled={isSubmitting}
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
        </DialogContent>

        <DialogActions>
          <Button type="submit" className="blue" disabled={isSubmitting}>
            {isSubmitting ? t("Updating...") : t("Update")}
          </Button>
          <Button onClick={handleClose} className="red" disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog;
