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
  Stack,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { useUpdateUserRole } from "@/hooks/mutations/useUserMutations";
import { RoleColors } from "@/utils/defines";

interface UpdateUserRoleDlgProps {
  isOpen: boolean;
  userToUpdate: User;
  onClose: () => void;
}

const UpdateUserRoleDlg: React.FC<UpdateUserRoleDlgProps> = ({
  isOpen,
  userToUpdate,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isSuperAdmin } = useUser();
  const { mutate: mutateUpdateRole, isPending } = useUpdateUserRole();

  const allRoles = useMemo<UserRole[]>(
    () =>
      isSuperAdmin()
        ? ["User", "Executor", "Editor", "Invoker", "Admin"]
        : ["User", "Executor", "Editor", "Invoker"],
    [isSuperAdmin]
  );

  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(
    userToUpdate.roles ?? []
  );

  useEffect(() => {
    if (isOpen) setSelectedRoles(userToUpdate.roles ?? []);
  }, [isOpen, userToUpdate]);

  const hasChanges =
    (userToUpdate.roles ?? []).length !== selectedRoles.length ||
    (userToUpdate.roles ?? []).some((r) => !selectedRoles.includes(r));

  const handleToggleRole = useCallback((role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRoles(allRoles);
  }, [allRoles]);

  const handleClear = useCallback(() => {
    setSelectedRoles([]);
  }, []);

  const handleClickUpdate = useCallback(() => {
    if (!hasChanges || isPending) return;
    mutateUpdateRole(
      {
        userId: userToUpdate.userId,
        tenantId: userToUpdate.tenantId,
        roles: selectedRoles,
      },
      { onSuccess: () => onClose() }
    );
  }, [
    mutateUpdateRole,
    userToUpdate.userId,
    userToUpdate.tenantId,
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
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography>
          {t("Update user roles") + " - " + userToUpdate.userId}
        </Typography>
        <IconButton onClick={onClose} aria-label={t("Close")}>
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: 12 }}
                onClick={handleSelectAll}
              >
                {t("Select all")}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ fontSize: 12 }}
                onClick={handleClear}
              >
                {t("Clear")}
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t("Selected")}: <strong>{selectedRoles.length}</strong> /{" "}
              {allRoles.length}
            </Typography>
          </Stack>

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
                (mode === "dark"
                  ? "rgba(255,255,255,0.72)"
                  : "rgba(0,0,0,0.72)");
              const checked = selectedRoles.includes(role);

              return (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={checked}
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
        </Stack>
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

export default UpdateUserRoleDlg;
