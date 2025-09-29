import React, { useCallback } from "react";
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
import { useCreateUser } from "@/hooks/mutations/useUserMutations";
import { dialogStyles } from "@/styles/styles";
import { CreateUserInput } from "@/services/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const defaultValues: CreateUserInput = {
  username: "",
  password: "",
  fullname: "",
  email: "",
  phone: "",
  address: "",
};

const AddUserDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const schema = z.object({
    username: z.string().trim().min(1, t("Username is required")),
    password: z.string().min(6, t("Password must be at least 6 characters")),
    fullname: z.string().trim().min(1, t("Full name is required")),
    email: z.string().email(t("Invalid email address")),
    phone: z
      .string()
      .trim()
      .min(1, t("Phone is required"))
      .regex(/^[0-9()+\-\s]{6,}$/, t("Invalid phone number")),
    address: z.string().trim().min(1, t("Address is required")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  const { mutate: mutateCreateUser, isPending } = useCreateUser();

  const onSubmit = useCallback(
    (values: CreateUserInput) => {
      mutateCreateUser(values, {
        onSuccess: () => {
          reset(defaultValues);
          onClose();
        },
      });
    },
    [mutateCreateUser, reset, onClose]
  );

  const disabled = isSubmitting || isPending || !isValid;

  const handleClose = () => {
    reset(defaultValues);
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
      <DialogTitle>
        <Typography>{t("Add user")} </Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("Username")}
            size="small"
            fullWidth
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message && t(errors.username.message)}
            autoFocus
            autoComplete="off"
          />

          <TextField
            label={t("Password")}
            type="password"
            size="small"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message && t(errors.password.message)}
            autoComplete="new-password"
          />

          <TextField
            label={t("Full name")}
            size="small"
            fullWidth
            {...register("fullname")}
            error={!!errors.fullname}
            helperText={errors.fullname?.message && t(errors.fullname.message)}
          />

          <TextField
            label={t("Email")}
            size="small"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message && t(errors.email.message)}
          />

          <TextField
            label={t("Phone")}
            size="small"
            fullWidth
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message && t(errors.phone.message)}
          />

          <TextField
            label={t("Address")}
            size="small"
            fullWidth
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message && t(errors.address.message)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => void handleSubmit(onSubmit)()}
          className="blue"
          disabled={disabled}
        >
          {t("Create")}
        </Button>
        <Button
          onClick={handleClose}
          className="red"
          disabled={isSubmitting || isPending}
        >
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
