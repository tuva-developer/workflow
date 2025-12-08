import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
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
import SearchTextField from "@/components/common/SearchTextField";
import { useUsersQuery } from "@/hooks/query/useUsersQuery";
import { useUpdateGroup } from "@/hooks/mutations/useGroupMutations";
import CustomTextField from "@/components/common/CustomTextField";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import { UserQuery } from "@/services/types";

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

  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState<string>(group?.name ?? "");
  const [groupDescription, setGroupDescription] = useState<string>(
    group?.description ?? ""
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const params: UserQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
    }),
    [rowsPerPage, page, searchText]
  );

  const { data } = useUsersQuery(params, true);
  const users = data?.items ?? [];
  const totalUsers = data?.total ?? 0;

  const updateGroupMutation = useUpdateGroup();

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText]);

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(Array.isArray(group?.members) ? group.members : []);
      setGroupName(group?.name ?? "");
      setGroupDescription(group?.description ?? "");
    }
  }, [isOpen, group]);

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

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    },
    []
  );

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
            tooltip="Search by user id"
            width="100%"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 1.25,
              alignItems: "center",
            }}
          >
            {users.map((user) => (
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

          <CustomTablePagination
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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
