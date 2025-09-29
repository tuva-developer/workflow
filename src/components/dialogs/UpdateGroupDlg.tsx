import React, { useEffect, useMemo, useState } from "react";
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
import SearchTextField from "@/components/common/SearchTextField";
import { useUsersQuery } from "@/hooks/query/useUsersQuery";
import { useUpdateGroup } from "@/hooks/mutations/useGroupMutations";
import CustomTextField from "@/components/common/CustomTextField";

interface UpdateUserGroupDialogProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
}

const UpdateUserGroupDialog: React.FC<UpdateUserGroupDialogProps> = ({
  isOpen,
  group,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    Array.isArray(group?.members) ? group.members : []
  );
  const [searchText, setSearchText] = useState<string>("");
  const [groupName, setGroupName] = useState<string>(group?.name ?? "");
  const [groupDescription, setGroupDescription] = useState<string>(
    group?.description ?? ""
  );

  const { data } = useUsersQuery(undefined, isOpen);
  const users = useMemo(() => data?.items ?? [], [data]);

  const updateGroupMutation = useUpdateGroup();

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(Array.isArray(group?.members) ? group.members : []);
      setGroupName(group?.name ?? "");
      setGroupDescription(group?.description ?? "");
    }
  }, [isOpen, group]);

  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.userId?.toLowerCase().includes(q));
  }, [users, searchText]);

  async function handleClickUpdate() {
    if (updateGroupMutation.isPending) return;
    if (!group?._id) return;

    updateGroupMutation.mutate(
      {
        id: group._id,
        name: groupName,
        description: groupDescription,
        members: selectedUsers,
      },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleClickUpdate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      onKeyDown={handleKeyDown}
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography>{t("Update group")}</Typography>
        <IconButton onClick={onClose} aria-label={t("Close")}>
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <CustomTextField
          label={t("Group name")}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 1.5 }}
        />

        <CustomTextField
          label={t("Group description")}
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          sx={{ mb: 1.5 }}
        />

        <Box
          sx={{
            p: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            {t("Choose member to assign to")}{" "}
            <strong>{groupName || group?.name}</strong>
          </Typography>

          <SearchTextField
            value={searchText}
            onChangeDebounced={(val) => setSearchText(val)}
            sx={{ mb: 1.5 }}
            tooltip="Search user"
            width={"100%"}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 1.25,
              alignItems: "center",
            }}
          >
            {filteredUsers.map((user) => (
              <FormControlLabel
                key={user.userId}
                control={
                  <Checkbox
                    checked={selectedUsers.includes(user.userId)}
                    onChange={() => handleToggleUser(user.userId)}
                  />
                }
                label={user.userId}
                sx={{
                  m: 0,
                  py: 0.5,
                  px: 1,
                  backgroundColor: selectedUsers.includes(user.userId)
                    ? theme.palette.action.hover
                    : "transparent",
                  borderRadius: 1,
                  "& .MuiFormControlLabel-label": {
                    wordBreak: "break-word",
                  },
                  "& .MuiTypography-root": {
                    fontSize: 14,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClickUpdate}
          className="blue"
          disabled={updateGroupMutation.isPending}
        >
          {t("Update")}
        </Button>
        <Button onClick={onClose} className="red">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserGroupDialog;
