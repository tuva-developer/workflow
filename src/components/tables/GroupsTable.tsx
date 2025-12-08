import {
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import AddGroupDialog from "@/components/dialogs/AddGroupDlg";
import UpdateGroupDlg from "@/components/dialogs/UpdateGroupDlg";
import SearchTextField from "@/components/common/SearchTextField";
import { defaultGroup } from "@/utils/defines";
import { useAppContext } from "@/hooks/useAppContext";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import ActionButton from "@/components/common/ActionButton";
import { useDeleteGroup } from "@/hooks/mutations/useGroupMutations";
import { useGroupsQuery } from "@/hooks/query/useGroupsQuery";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { GroupQuery } from "@/services/types";
import { DateCell } from "@/components/common/DateCell";

function GroupsTable() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof Group>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isUpdateGroupDialogOpen, setIsUpdateGroupDialogOpen] = useState(false);
  const [groupToUpdate, setGroupToUpdate] = useState<Group>(defaultGroup);

  const params: GroupQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [rowsPerPage, page, searchText, sortBy, orderBy]
  );

  const deleteGroupMutation = useDeleteGroup();
  const { data } = useGroupsQuery(params, true);
  const groups = data?.items ?? [];
  const totalGroups = data?.total ?? 0;

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      openConfirm({
        title: t("Delete Group"),
        message: t("Are you sure you want to delete this group?"),
        onOk: () => {
          deleteGroupMutation.mutate(
            { groupId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteGroupMutation, t, openConfirm, closeConfirm]
  );

  const handleUpdateGroup = useCallback((group: Group) => {
    setGroupToUpdate(group);
    setIsUpdateGroupDialogOpen(true);
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

  const handleChangeSort = (sortGroup) => {
    if (sortGroup.length > 0) {
      setSortBy(sortGroup[0].field as keyof Group);
      setOrderBy((sortGroup[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  };

  const columns: GridColDef<Group>[] = [
    { field: "_id", headerName: t("ID"), flex: 1 },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "description", headerName: t("Description"), flex: 1 },
    {
      field: "members",
      headerName: t("Members"),
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<Group>) => {
        const members = Array.isArray(params.row.members)
          ? params.row.members
          : [];
        const maxVisible = 2;
        const visible = members.slice(0, maxVisible);
        const remaining = Math.max(0, members.length - visible.length);

        if (members.length === 0) {
          return (
            <Typography
              component="span"
              sx={{
                fontStyle: "italic",
                color: (t) => t.palette.text.secondary,
                fontSize: 13,
              }}
            >
              {t("No data")}
            </Typography>
          );
        }

        const tooltipTitle = (
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
            {members.map((member, idx) => (
              <Chip
                key={`${member}-${idx}`}
                label={member}
                size="small"
                sx={{
                  fontSize: "0.75rem",
                  borderRadius: 1,
                  bgcolor: theme.palette.info.dark,
                  color: theme.palette.common.white,
                }}
              />
            ))}
          </Stack>
        );

        return (
          <Tooltip
            title={members.length > maxVisible ? tooltipTitle : ""}
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
              sx={{ cursor: "help" }}
            >
              {visible.map((member) => (
                <Chip
                  key={member}
                  label={member}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    borderRadius: 1,
                    bgcolor: theme.palette.info.dark,
                    color: theme.palette.common.white,
                  }}
                />
              ))}

              {remaining > 0 && (
                <Chip
                  label={`+${remaining}`}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    borderRadius: 1,
                    bgcolor: "#37415190",
                    color: theme.palette.common.white,
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
      renderCell: (params: GridRenderCellParams<Group>) => (
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
            icon={<MdEdit size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Edit")}
            onClick={() => handleUpdateGroup(params.row)}
          />
          <ActionButton
            icon={<MdDelete size={20} />}
            color={theme.palette.error.main}
            tooltip={t("Delete")}
            onClick={() => handleDeleteGroup(params.row._id)}
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
      <Toolbar
        sx={{
          gap: 1,
          flexShrink: 0,
          justifyContent: "space-between",
        }}
      >
        <SearchTextField
          value={searchText}
          onChangeDebounced={(val) => setSearchText(val)}
          tooltip="Search (id, name, description)"
        />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setIsAddGroupDialogOpen(true)}
          sx={{ whiteSpace: "nowrap", fontSize: 12 }}
        >
          {t("Add group")}
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
        <GenericDataGrid<Group>
          rows={groups}
          columns={columns}
          getRowId={(row) => row._id}
          onSortChange={handleChangeSort}
        />

        <CustomTablePagination
          count={totalGroups}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <AddGroupDialog
        isOpen={isAddGroupDialogOpen}
        onClose={() => setIsAddGroupDialogOpen(false)}
      />

      <UpdateGroupDlg
        isOpen={isUpdateGroupDialogOpen}
        group={groupToUpdate}
        onClose={() => setIsUpdateGroupDialogOpen(false)}
      />
    </Box>
  );
}

export default GroupsTable;
