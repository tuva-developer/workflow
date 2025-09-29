import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  useTheme,
  Typography,
  IconButton,
} from "@mui/material";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import { Autocomplete, TextField } from "@mui/material";
import { useUsersQuery } from "@/hooks/query/useUsersQuery";
import { useGroupsQuery } from "@/hooks/query/useGroupsQuery";

type Role = "edit" | "execute";

type PermissionData = {
  [K in Role]: {
    users: string[];
    groups: string[];
  };
};

type UpdateModelPermissionProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PermissionData) => void;
  initialValue?: PermissionData;
};

export default function UpdateModelPermission({
  isOpen,
  onClose,
  onSubmit,
  initialValue,
}: UpdateModelPermissionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<PermissionData>({
    edit: { users: [], groups: [] },
    execute: { users: [], groups: [] },
  });

  const { data: dataUsers } = useUsersQuery(undefined, isOpen);
  const { data: dataGroups } = useGroupsQuery(undefined, isOpen);
  const allUsers = dataUsers?.items ?? [];
  const allGroups = dataGroups?.items ?? [];

  useEffect(() => {
    if (isOpen && initialValue) {
      setPermissions(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleChange = (
    role: Role,
    type: "users" | "groups",
    value: string[]
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [type]: value,
      },
    }));
  };

  const renderSelect = <T extends { id: string; label: string }>(
    label: string,
    value: string[],
    options: T[],
    onChange: (value: string[]) => void
  ) => (
    <Autocomplete
      multiple
      options={options}
      noOptionsText={t("No options")}
      value={options.filter((opt) => value.includes(opt.id))}
      onChange={(_e, selected) => onChange(selected.map((s) => s.id))}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          label={t(label)}
          variant="outlined"
          sx={{
            my: 1,
            "& .MuiOutlinedInput-root": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.info.light,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.light,
              },
            },
          }}
        />
      )}
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props;

        return (
          <li key={key} {...rest}>
            {selected && (
              <FaCheck
                style={{ marginRight: 4, color: theme.palette.success.main }}
              />
            )}
            {option.label}
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...chipProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...chipProps}
              label={option.label}
              sx={{
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          );
        })
      }
    />
  );

  const mappedUsers = allUsers.map((u) => ({
    id: u.userId,
    label: u.userId,
  }));

  const mappedGroups = allGroups.map((g) => ({
    id: g._id,
    label: g.name,
  }));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Update permissions")}</Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>
      <DialogContent>
        {(["edit", "execute"] as Role[]).map((role) => (
          <Box key={role} sx={{ mb: 2 }}>
            <Box
              fontStyle="italic"
              fontSize={14}
              mb={1}
              textTransform="capitalize"
            >
              {t(`${role} permission`)}
            </Box>
            {renderSelect(
              "Users",
              permissions[role].users,
              mappedUsers,
              (val) => handleChange(role, "users", val)
            )}
            {renderSelect(
              "Groups",
              permissions[role].groups,
              mappedGroups,
              (val) => handleChange(role, "groups", val)
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onSubmit(permissions)} className="blue">
          {t("Save")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
