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
import { useTranslation } from "react-i18next";
import { RoleColors } from "@/utils/defines";
import { dialogStyles } from "@/styles/styles";
import { useUser } from "@/hooks/useUser";

export interface FilterUserRoleDlgProps {
  isOpen: boolean;
  value: UserRole[];
  onClose: () => void;
  onApply: (roles: UserRole[]) => void;
}

const FilterUserRoleDlg: React.FC<FilterUserRoleDlgProps> = ({
  isOpen,
  value,
  onClose,
  onApply,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isSuperAdmin } = useUser();

  const allRoles = useMemo<UserRole[]>(
    () =>
      isSuperAdmin()
        ? ["User", "Executor", "Editor", "Invoker", "Admin"]
        : ["User", "Executor", "Editor", "Invoker"],
    [isSuperAdmin]
  );

  const [selected, setSelected] = useState<UserRole[]>(value ?? []);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(value ?? []);
      setKeyword("");
    }
  }, [isOpen, value]);

  const filteredRoles = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return allRoles;
    return allRoles.filter((r) => t(r).toLowerCase().includes(kw));
  }, [allRoles, keyword, t]);

  const mode: "light" | "dark" =
    theme.palette.mode === "dark" ? "dark" : "light";

  const hasChanges =
    selected.length !== value.length ||
    selected.some((r) => !value.includes(r)) ||
    value.some((r) => !selected.includes(r));

  const toggleRole = useCallback((role: UserRole) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelected(filteredRoles);
  }, [filteredRoles]);

  const handleClear = useCallback(() => {
    setSelected([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply(selected);
    onClose();
  }, [onApply, selected, onClose]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
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
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography>{t("Filter by roles")}</Typography>
        <IconButton onClick={onClose} aria-label={t("Close")}>
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            spacing={1}
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
              {t("Selected")}: <strong>{selected.length}</strong> /{" "}
              {filteredRoles.length}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 1,
              mt: 0.5,
            }}
          >
            {filteredRoles.map((role) => {
              const color =
                RoleColors[mode][role] ??
                (mode === "dark"
                  ? "rgba(255,255,255,0.72)"
                  : "rgba(0,0,0,0.72)");
              const checked = selected.includes(role);
              return (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleRole(role)}
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
        <Button onClick={handleApply} className="blue" disabled={!hasChanges}>
          {t("Apply filters")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterUserRoleDlg;
