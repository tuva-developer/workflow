import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  useTheme,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { useUpdateUserRole } from "@/hooks/mutations/useUserMutations";
import { RoleColors } from "@/utils/defines";

interface UpdateUserRoleDialogProps {
  isOpen: boolean;
  userToUpdate: User;
  onClose: () => void;
}

const UpdateUserRoleDialog: React.FC<UpdateUserRoleDialogProps> = ({
  isOpen,
  userToUpdate,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isSuperAdmin } = useUser();
  const { mutate: mutateUpdateRole, isPending } = useUpdateUserRole();

  const allRoles = useMemo<string[]>(
    () =>
      isSuperAdmin()
        ? ["User", "Executor", "Editor", "Invoker", "Admin"]
        : ["User", "Executor", "Editor", "Invoker"],
    [isSuperAdmin]
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userToUpdate.roles ?? []
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedRoles(userToUpdate.roles ?? []);
    }
  }, [isOpen, userToUpdate]);

  const hasChanges =
    (userToUpdate.roles ?? []).length !== selectedRoles.length ||
    (userToUpdate.roles ?? []).some((r) => !selectedRoles.includes(r));

  const handleToggleRole = useCallback((role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const handleClickUpdate = useCallback(() => {
    if (!hasChanges || isPending) return;

    mutateUpdateRole(
      { userId: userToUpdate.userId, roles: selectedRoles },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  }, [
    mutateUpdateRole,
    userToUpdate.userId,
    selectedRoles,
    hasChanges,
    isPending,
    onClose,
  ]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleClickUpdate();
    }
  };

  const mode: "light" | "dark" =
    theme.palette.mode === "dark" ? "dark" : "light";

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
        <Typography>{t("Update group members")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {t("Choose roles to assign to")}{" "}
          <strong>{userToUpdate.userId}</strong>
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 1,
          }}
        >
          {allRoles.map((role) => {
            const color =
              RoleColors[mode][role] ??
              (mode === "dark" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)");
            return (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleToggleRole(role)}
                    size="small"
                  />
                }
                label={t(role)}
                sx={{
                  width: "100%",
                  m: 0,
                  justifyContent: "center",
                  ".MuiFormControlLabel-label": {
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                    fontSize: 13,
                    color,
                    backgroundColor: `${color}30`,
                    borderRadius: 1,
                    p: "4px 8px",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClickUpdate}
          className="blue"
          disabled={!hasChanges || isPending}
        >
          {t("Update")}
        </Button>
        <Button onClick={onClose} className="red" disabled={isPending}>
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserRoleDialog;
