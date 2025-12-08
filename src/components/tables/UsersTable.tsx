import { useMemo, useState, useCallback, ChangeEvent, useEffect } from "react";
import { Box, Button, Chip, Stack, Toolbar, Tooltip } from "@mui/material";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import UpdateUserRoleDialog from "@/components/dialogs/UpdateUserRoleDlg";
import SearchTextField from "@/components/common/SearchTextField";
import { PiUserGear } from "react-icons/pi";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import ActionButton from "@/components/common/ActionButton";
import { useUsersQuery } from "@/hooks/query/useUsersQuery";
import { useDeleteUser } from "@/hooks/mutations/useUserMutations";
import AddUserDlg from "@/components/dialogs/AddUserDlg";
import { useAppContext } from "@/hooks/useAppContext";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { defaultUser, RoleColors } from "@/utils/defines";
import UpdateUserDialog from "@/components/dialogs/UpdateUserDlg";
import { UserQuery } from "@/services/types";
import { DateCell } from "@/components/common/DateCell";
import FilterUserRoleDlg from "@/components/dialogs/FilterUserRoleDlg";
import { CiFilter } from "react-icons/ci";

function UserTable() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole[]>([]);
  const [sortBy, setSortBy] = useState<keyof User>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isUpdateUserRoleDialogOpen, setIsUpdateUserRoleDialogOpen] =
    useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User>(defaultUser);

  const params: UserQuery = useMemo(() => {
    const roles = filterRole.length > 0 ? filterRole.join(",") : undefined;
    return {
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      roles,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    };
  }, [rowsPerPage, page, searchText, filterRole, sortBy, orderBy]);

  const deleteUserMutation = useDeleteUser();
  const { data } = useUsersQuery(params, true);
  const users = data?.items ?? [];
  const totalUsers = data?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText, filterRole]);

  const handleDeleteUser = useCallback(
    (userId: string, tenantId: string) => {
      openConfirm({
        title: t("Delete User"),
        message: t("Are you sure you want to delete this user?"),
        onOk: async () => {
          await deleteUserMutation.mutateAsync({ userId, tenantId });
          closeConfirm();
        },
      });
    },
    [deleteUserMutation, openConfirm, closeConfirm, t]
  );

  const handleUpdateUser = useCallback((u: User) => {
    setUserToUpdate(u);
    setIsUpdateUserDialogOpen(true);
  }, []);

  const handleUpdateRole = useCallback((u: User) => {
    setUserToUpdate(u);
    setIsUpdateUserRoleDialogOpen(true);
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    },
    []
  );

  const handleChangeSort = useCallback((sortUser) => {
    if (sortUser.length > 0) {
      setSortBy(sortUser[0].field as keyof User);
      setOrderBy((sortUser[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  }, []);

  const columns: GridColDef<User>[] = [
    { field: "tenantId", headerName: t("Tenant ID"), flex: 1 },
    { field: "userId", headerName: t("User ID"), flex: 1 },
    { field: "fullname", headerName: t("Fullname"), flex: 1 },
    { field: "email", headerName: t("Email"), flex: 1 },
    { field: "phone", headerName: t("Phone"), flex: 1 },
    { field: "address", headerName: t("Address"), flex: 1 },
    {
      field: "roles",
      headerName: t("Roles"),
      flex: 1,
      minWidth: 320,
      sortable: false,
      filterable: false,
      renderCell: (p: GridRenderCellParams<User>) => {
        const roles = p.row.roles ?? [];
        const maxVisible = 2;
        const visible = roles.slice(0, maxVisible);
        const remaining = roles.length - visible.length;

        const tooltipTitle = (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
            {roles.map((role) => {
              const mode: "light" | "dark" = "dark";
              const color =
                RoleColors[mode][role] ??
                (mode === "dark"
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(109, 9, 9, 0.7)");

              return (
                <Chip
                  key={role}
                  label={t(role)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: 11,
                    borderRadius: 1,
                    color,
                    bgcolor: `${color}30`,
                    borderColor: "transparent",
                  }}
                />
              );
            })}
          </Stack>
        );

        return (
          <Tooltip
            title={roles.length > maxVisible ? tooltipTitle : ""}
            arrow
            placement="top"
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              height="100%"
              width="100%"
              overflow="hidden"
              sx={{
                cursor: "help",
              }}
            >
              {visible.map((role) => {
                const mode: "light" | "dark" =
                  theme.palette.mode === "dark" ? "dark" : "light";
                const color =
                  RoleColors[mode][role] ??
                  (mode === "dark"
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.7)");

                return (
                  <Chip
                    key={role}
                    label={t(role)}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: 11,
                      borderRadius: 1,
                      color,
                      bgcolor: `${color}30`,
                      borderColor: "transparent",
                    }}
                  />
                );
              })}
              {remaining > 0 && (
                <Chip
                  size="small"
                  label={`+${remaining}`}
                  variant="outlined"
                  sx={{
                    fontSize: 11,
                    borderRadius: 1,
                    borderColor: "transparent",
                    color: theme.palette.text.secondary,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                  }}
                />
              )}
            </Stack>
          </Tooltip>
        );
      },
    },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (params) => <DateCell value={params.value} />,
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (params) => <DateCell value={params.value} />,
    },
    {
      field: "action",
      headerName: t("Action"),
      flex: 1,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      headerClassName: "no-separator",
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <ActionButton
            icon={<PiUserGear size={20} />}
            color={theme.palette.info.main}
            tooltip={t("Update role")}
            onClick={() => handleUpdateRole(params.row)}
          />
          <ActionButton
            icon={<MdEdit size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Edit")}
            onClick={() => handleUpdateUser(params.row)}
          />
          <ActionButton
            icon={<MdDelete size={20} />}
            color={theme.palette.error.main}
            tooltip={t("Delete")}
            onClick={() =>
              handleDeleteUser(params.row.userId, params.row.tenantId)
            }
          />
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Toolbar sx={{ flexShrink: 0, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchTextField
            value={searchText}
            onChangeDebounced={(val) => setSearchText(val)}
            tooltip="Search by user id"
          />

          <Button
            variant="contained"
            onClick={() => setIsOpenFilter(true)}
            sx={{ gap: 0.5, fontSize: 12 }}
          >
            <CiFilter size={20} />
            {t("Filter roles")}
          </Button>

          <FilterUserRoleDlg
            isOpen={isOpenFilter}
            value={filterRole}
            onClose={() => setIsOpenFilter(false)}
            onApply={(roles) => setFilterRole(roles)}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setIsAddUserDialogOpen(true)}
          sx={{ whiteSpace: "nowrap", fontSize: 12 }}
        >
          {t("Add user")}
        </Button>
      </Toolbar>

      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          pl: 3,
          pr: 3,
          pb: 2,
        }}
      >
        <GenericDataGrid<User>
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId + row.tenantId}
          onSortChange={handleChangeSort}
        />

        <CustomTablePagination
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <UpdateUserRoleDialog
        isOpen={isUpdateUserRoleDialogOpen}
        userToUpdate={userToUpdate}
        onClose={() => setIsUpdateUserRoleDialogOpen(false)}
      />

      <AddUserDlg
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
      />

      <UpdateUserDialog
        isOpen={isUpdateUserDialogOpen}
        user={userToUpdate}
        onClose={() => setIsUpdateUserDialogOpen(false)}
      />
    </Box>
  );
}

export default UserTable;
