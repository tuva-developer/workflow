import React, { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  useTheme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { dialogStyles } from "@/styles/styles";
import type { UpdateUserInput } from "@/services/types";
import { updateUser } from "@/services/users";
import { qk } from "@/hooks/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/utils/toastConfig";

export type UpdateUserDialogProps = {
  isOpen: boolean;
  user: User;
  onClose: () => void;
};

const makeDefaults = (u?: User) => ({
  userId: u?.userId ?? "",
  tenantId: u?.tenantId ?? "",
  new_password: "",
  fullname: u?.fullname ?? "",
  email: u?.email ?? "",
  phone: u?.phone ?? "",
  address: u?.address ?? "",
});

const makeSchema = (t: (k: string) => string) =>
  z.object({
    userId: z.string().min(1),
    tenantId: z.string().min(1),
    new_password: z.union([
      z.literal(""),
      z.string().min(6, t("Password must be at least 6 characters")),
    ]),
    fullname: z.string().trim().min(1, t("Full name is required")),
    email: z.string().email(t("Invalid email address")),
    phone: z
      .string()
      .trim()
      .min(1, t("Phone is required"))
      .regex(/^[0-9()+\-\s]{6,}$/, t("Invalid phone number")),
    address: z.string().trim().min(1, t("Address is required")),
  });

const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({
  isOpen,
  user,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const qc = useQueryClient();
  const schema = makeSchema(t);
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: makeDefaults(user),
  });

  useEffect(() => {
    if (isOpen) {
      reset(makeDefaults(user));
    }
  }, [isOpen, user, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (isSubmitting) return;

      const payload: UpdateUserInput = { ...values };
      if (!payload.new_password || payload.new_password.trim() === "") {
        delete payload.new_password;
      }

      try {
        await updateUser(payload);

        await qc.invalidateQueries({ queryKey: qk.usersRoot, exact: false });

        reset({ ...makeDefaults(user) });
        showSuccess(t("User has been updated successfully"));
        onClose();
      } catch {
        showError(t("Failed to update user"));
      }
    },
    [isSubmitting, reset, onClose, user, qc, t]
  );

  const disabled = isSubmitting || !isValid;

  const handleClose = () => {
    reset(makeDefaults(user));
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={dialogStyles(theme)}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>{t("Update user")}</Typography>
        <IconButton onClick={handleClose} aria-label={t("Close")}>
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <input type="hidden" {...register("userId")} />

        <Stack spacing={2} mt={1}>
          <TextField
            label={t("Username")}
            size="small"
            fullWidth
            {...register("userId")}
            error={!!errors.userId}
            helperText={errors.userId?.message}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              pointerEvents: "none",
            }}
          />

          <TextField
            label={t("New password")}
            type="password"
            size="small"
            fullWidth
            {...register("new_password")}
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
            autoComplete="new-password"
          />

          <TextField
            label={t("Full name")}
            size="small"
            fullWidth
            {...register("fullname")}
            error={!!errors.fullname}
            helperText={errors.fullname?.message}
          />

          <TextField
            label={t("Email")}
            size="small"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label={t("Phone")}
            size="small"
            fullWidth
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          <TextField
            label={t("Address")}
            size="small"
            fullWidth
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => void handleSubmit(onSubmit)()}
          className="blue"
          disabled={disabled}
        >
          {t("Update")}
        </Button>
        <Button onClick={handleClose} className="red" disabled={isSubmitting}>
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserDialog;
