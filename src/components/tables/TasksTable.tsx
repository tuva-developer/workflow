import "react-toastify/dist/ReactToastify.css";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Toolbar, Box, useTheme, Typography, Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ExecuteTaskDlg from "@/components/dialogs/ExecuteTaskDlg";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { IoHandLeftSharp } from "react-icons/io5";
import CustomSelect from "@/components/common/CustomSelect";
import ActionButton from "@/components/common/ActionButton";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { TaskQuery } from "@/services/types";
import { useTasksQuery } from "@/hooks/query/useTasksQuery";
import { FaUser, FaUsers } from "react-icons/fa6";
import { DateCell } from "@/components/common/DateCell";
import { StatusColors } from "@/styles/styles";

function TasksTable() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<keyof User>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isExecuteTask, setIsExecuteTask] = useState(false);
  const [taskId, setTaskId] = useState<string>("");

  const statusOptions = [
    { value: "all", label: t("All") },
    { value: "completed", label: t("Completed") },
    { value: "failed", label: t("Failed") },
    { value: "pending", label: t("Pending") },
    { value: "running", label: t("Running") },
    { value: "not executed", label: t("Not Executed") },
    { value: "error", label: t("Error") },
  ];

  const params: TaskQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [rowsPerPage, page, searchText, filterStatus, sortBy, orderBy]
  );

  const { data, refetch } = useTasksQuery(params, true);
  const tasks = data?.items ?? [];
  const totalTasks = data?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText, filterStatus]);

  const handleActionClick = (id: string) => {
    setTaskId(id);
    setIsExecuteTask(true);
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

  const handleChangeSort = (sortUser) => {
    if (sortUser.length > 0) {
      setSortBy(sortUser[0].field as keyof User);
      setOrderBy((sortUser[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  };

  const renderAssigneeCell = (params: GridRenderCellParams<Task>) => {
    const assignees = (params.row.assignee ?? []) as Assignee[];

    if (!assignees.length) {
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

    const items = assignees
      .map((a) =>
        "user" in a && a.user
          ? { type: "user" as const, value: a.user }
          : "group" in a && a.group
          ? { type: "group" as const, value: a.group }
          : null
      )
      .filter(Boolean) as Array<{ type: "user" | "group"; value: string }>;

    const users = items.filter((i) => i.type === "user").map((i) => i.value);
    const groups = items.filter((i) => i.type === "group").map((i) => i.value);

    const tooltipTitle = (
      <Box sx={{ maxWidth: 500 }}>
        {users.length > 0 && (
          <Box sx={{ mb: groups.length ? 1 : 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t("Users") + ":"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {users.join(", ")}
            </Typography>
          </Box>
        )}
        {groups.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t("Groups") + ":"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {groups.join(", ")}
            </Typography>
          </Box>
        )}
      </Box>
    );

    return (
      <Tooltip title={tooltipTitle} arrow placement="top">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            height: "100%",
            cursor: "help",
          }}
        >
          {users.length >= 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FaUser size={14} color={theme.palette.info.main} />
              <Typography sx={{ fontSize: 13 }} noWrap>
                {t("Users")}:{" "}
                <Typography
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    ml: 0.5,
                    borderRadius: "50%",
                    fontSize: 12,
                    fontWeight: 400,
                    color: (theme) =>
                      users.length === 0
                        ? theme.palette.text.secondary
                        : theme.palette.info.main,
                    border: (theme) =>
                      `1px solid ${
                        users.length === 0
                          ? theme.palette.text.secondary
                          : theme.palette.info.main
                      }`,
                    backgroundColor: (theme) =>
                      users.length === 0
                        ? theme.palette.action.hover
                        : `${theme.palette.info.main}10`,
                  }}
                >
                  {users.length}
                </Typography>
              </Typography>
            </Box>
          )}
          {groups.length >= 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FaUsers size={18} color={theme.palette.info.main} />
              <Typography sx={{ fontSize: 13 }} noWrap>
                {t("Groups")}:{" "}
                <Typography
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    ml: 0.5,
                    borderRadius: "50%",
                    fontSize: 12,
                    fontWeight: 400,
                    color: (theme) =>
                      groups.length === 0
                        ? theme.palette.text.secondary
                        : theme.palette.info.main,
                    border: (theme) =>
                      `1px solid ${
                        groups.length === 0
                          ? theme.palette.text.secondary
                          : theme.palette.info.main
                      }`,
                    backgroundColor: (theme) =>
                      groups.length === 0
                        ? theme.palette.action.hover
                        : `${theme.palette.info.main}10`,
                  }}
                >
                  {groups.length}
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>
    );
  };

  const columns: GridColDef<Task>[] = [
    { field: "taskId", headerName: t("Task ID"), flex: 1 },
    { field: "activityId", headerName: t("Activity ID"), flex: 1 },
    { field: "name", headerName: t("Name"), flex: 1 },
    {
      field: "status",
      headerName: t("Status"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Task, string>) => {
        const status = params.row.status?.toLowerCase?.() || "";
        const color = StatusColors[status] || "#000000";
        return (
          <Box
            sx={{
              color,
              bgcolor: `${color}10`,
              fontWeight: 400,
              lineHeight: 1.4,
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              px: 2,
            }}
          >
            {t(params.row.status)}
          </Box>
        );
      },
    },
    {
      field: "assignee",
      headerName: t("Assignee"),
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: renderAssigneeCell,
    },
    { field: "instanceId", headerName: t("Instance ID"), flex: 1 },
    { field: "modelId", headerName: t("Model ID"), flex: 1 },
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
      flex: 0,
      resizable: false,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      headerClassName: "no-separator",
      renderCell: (params: GridRenderCellParams<Task>) => (
        <ActionButton
          icon={<IoHandLeftSharp size={20} />}
          color={theme.palette.primary.main}
          tooltip={t("Handle")}
          onClick={() => handleActionClick(params.row.taskId)}
          disabled={params.row.status?.toLowerCase?.() === "completed" || params.row.status?.toLowerCase?.() === "running"}
        />
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Toolbar sx={{ gap: 1, flexShrink: 0 }}>
          <SearchTextField
            value={searchText}
            onChangeDebounced={(val) => setSearchText(val)}
            tooltip="Search (instance, task, ID, user/group assigned)"
          />

          <CustomSelect
            label={t("Status")}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as string)}
            options={statusOptions}
          />

          <ButtonRefresh
            onRefreshData={refetch}
            onRefreshFilter={() => {
              setSearchText("");
              setFilterStatus("all");
            }}
            sx={{ mt: 0.5 }}
          />
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
          <GenericDataGrid<Task>
            rows={tasks}
            columns={columns}
            getRowId={(row) => row.taskId}
            onSortChange={handleChangeSort}
          />

          <CustomTablePagination
            count={totalTasks}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

      <ExecuteTaskDlg
        isOpen={isExecuteTask}
        onClose={() => setIsExecuteTask(false)}
        taskId={taskId}
      />
    </>
  );
}

export default TasksTable;
