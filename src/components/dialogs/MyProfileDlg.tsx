import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Stack,
  Grid,
  Typography,
  Tooltip,
  IconButton,
  Skeleton,
  Box,
  Button,
  TextField,
  useTheme,
} from "@mui/material";
import {
  MdContentCopy,
  MdEmail,
  MdPhone,
  MdHome,
  MdBadge,
  MdCalendarMonth,
  MdUpdate,
  MdEdit,
  MdPerson,
  MdSave,
  MdCancel,
} from "react-icons/md";
import { dialogStyles } from "@/styles/styles";
import { formatDate, RoleColors } from "@/utils/defines";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateMyProfile } from "@/services/users";
import { UpdateUserInput } from "@/services/types";
import { useUser } from "@/hooks/useUser";
import { showSuccess, showWarn } from "@/utils/toastConfig";

export type MyProfileDlgProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  title?: string;
  keepMounted?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  onUpdated?: (next: Partial<User>) => void;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error("Error:", e);
  }
};

const FieldsSkeleton: React.FC = () => (
  <Grid container spacing={2}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Grid item xs={12} md={6} key={i}>
        <Skeleton width={120} />
        <Skeleton variant="text" />
      </Grid>
    ))}
  </Grid>
);

const Label: React.FC<{ icon?: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    {icon}
    <Typography variant="caption" color="text.secondary">
      {text}
    </Typography>
  </Stack>
);

const Field: React.FC<{ label: React.ReactNode; value?: React.ReactNode }> = ({
  label,
  value,
}) => {
  const isPrimitive = typeof value === "string" || typeof value === "number";

  return (
    <Box>
      {typeof label === "string" || typeof label === "number" ? (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      ) : (
        label
      )}

      {isPrimitive ? (
        <Typography variant="body2">{value as string | number}</Typography>
      ) : value ? (
        <Box>{value}</Box>
      ) : (
        <Typography variant="body2">—</Typography>
      )}
    </Box>
  );
};

const buildSchema = (t: (k: string) => string) =>
  z.object({
    fullname: z.string().trim().min(1, t("Full name is required")),
    email: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
        message: t("Invalid email address"),
      }),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[0-9()+\-\s]{6,}$/.test(v), {
        message: t("Invalid phone number"),
      }),
    address: z.string().trim().optional(),
  });

export type EditValues = z.infer<ReturnType<typeof buildSchema>>;

const MyProfileDlg: React.FC<MyProfileDlgProps> = ({
  open,
  onClose,
  loading,
  keepMounted = false,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const safeUser = user;
  const [isEditing, setIsEditing] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fullname: safeUser?.fullname ?? "",
      email: safeUser?.email ?? "",
      phone: safeUser?.phone ?? "",
      address: safeUser?.address ?? "",
    },
  });

  useEffect(() => {
    reset({
      fullname: safeUser?.fullname ?? "",
      email: safeUser?.email ?? "",
      phone: safeUser?.phone ?? "",
      address: safeUser?.address ?? "",
    });
  }, [
    safeUser?.fullname,
    safeUser?.email,
    safeUser?.phone,
    safeUser?.address,
    open,
    reset,
  ]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSave = handleSubmit(async (values) => {
    if (!safeUser) return;

    try {
      await updateMyProfile({
        fullname: values.fullname ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        address: values.address ?? "",
      } as UpdateUserInput);

      reset({
        fullname: values.fullname ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        address: values.address ?? "",
      });

      showSuccess(t("Profile updated successfully"));
      setUser({ ...user, ...values } as User);
      setIsEditing(false);
    } catch (err) {
      showWarn(t("Failed to update profile"));
      console.error("Error:", err);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleCancel();
        onClose();
      }}
      keepMounted={keepMounted}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            alt={user?.userId}
            src="/static/images/avatar/1.jpg"
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography fontSize={15} fontWeight={600}>
              {user?.userId || ""}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {user?.roles.map((role) => {
                const mode = theme.palette.mode;
                const color = RoleColors[mode][role];

                return (
                  <Chip
                    key={role}
                    label={t(role)}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: 11,
                      borderRadius: 1,
                      color: color,
                      bgcolor: `${color}30`,
                      borderColor: "transparent",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Stack>
        <IconButton
          onClick={() => {
            handleCancel();
            onClose();
          }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <FieldsSkeleton />
        ) : !safeUser ? (
          <Typography variant="body2" color="text.secondary">
            {t("No user data")}
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  label={
                    <Label icon={<MdBadge size={14} />} text={t("User ID")} />
                  }
                  value={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography
                        variant="body1"
                        component="span"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {safeUser.userId}
                      </Typography>
                      <Tooltip title={t("Copy")}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(safeUser.userId)}
                        >
                          <MdContentCopy size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <Box>
                    <Label
                      icon={<MdPerson size={14} />}
                      text={t("Full name")}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      autoComplete="name"
                      defaultValue={safeUser.fullname || ""}
                      {...register("fullname")}
                      error={!!errors.fullname}
                      helperText={errors.fullname?.message}
                    />
                  </Box>
                ) : (
                  <Field
                    label={
                      <Label
                        icon={<MdPerson size={14} />}
                        text={t("Full name")}
                      />
                    }
                    value={safeUser.fullname || "—"}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <Box>
                    <Label icon={<MdPhone size={14} />} text={t("Phone")} />
                    <TextField
                      size="small"
                      fullWidth
                      autoComplete="tel"
                      defaultValue={safeUser.phone || ""}
                      {...register("phone")}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  </Box>
                ) : (
                  <Field
                    label={
                      <Label icon={<MdPhone size={14} />} text={t("Phone")} />
                    }
                    value={safeUser.phone || "—"}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <Box>
                    <Label icon={<MdHome size={14} />} text={t("Address")} />
                    <TextField
                      size="small"
                      fullWidth
                      autoComplete="street-address"
                      defaultValue={safeUser.address || ""}
                      {...register("address")}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  </Box>
                ) : (
                  <Field
                    label={
                      <Label icon={<MdHome size={14} />} text={t("Address")} />
                    }
                    value={safeUser.address || "—"}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <Box>
                    <Label icon={<MdEmail size={14} />} text={t("Email")} />
                    <TextField
                      size="small"
                      fullWidth
                      autoComplete="email"
                      defaultValue={safeUser.email || ""}
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Box>
                ) : (
                  <Field
                    label={
                      <Label icon={<MdEmail size={14} />} text={t("Email")} />
                    }
                    value={safeUser.email || "—"}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  label={
                    <Label
                      icon={<MdCalendarMonth size={14} />}
                      text={t("Joined at")}
                    />
                  }
                  value={formatDate(safeUser.created_at) || "—"}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Field
                  label={
                    <Label icon={<MdUpdate size={14} />} text={t("Updated")} />
                  }
                  value={formatDate(safeUser.updated_at) || "—"}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button
              color="error"
              onClick={handleCancel}
              startIcon={<MdCancel />}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              startIcon={<MdSave />}
              onClick={() => void onSave()}
              disabled={isSubmitting || !isDirty}
            >
              {t("Save")}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<MdEdit />}
            onClick={handleEdit}
          >
            {t("Edit profile")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MyProfileDlg;
