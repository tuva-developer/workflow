import "react-toastify/dist/ReactToastify.css";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Toolbar, Box, useTheme } from "@mui/material";
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
import { formatDate } from "@/utils/defines";
import { TaskQuery } from "@/services/types";
import { useTasksQuery } from "@/hooks/query/useTasksQuery";

type Task = {
  taskId: string;
  activityId: string;
  status: string;
  assigneeType: string;
  assigneeId: string;
  instanceId: string;
  created_at: string;
  updated_at: string;
};

type AssignedToFilter = "all" | "user" | "group" | "manual";

const StatusColors: Record<string, string> = {
  completed: "#28a745",
  failed: "#ef4444",
  pending: "#FFB823",
  running: "#007bff",
  "not executed": "#FF7D29",
};

function TasksTable() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignedTo, setFilterAssignedTo] =
    useState<AssignedToFilter>("all");
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
  ];

  const assignOptions = [
    { value: "all", label: t("All") },
    { value: "user", label: t("User") },
    { value: "group", label: t("Group") },
    { value: "manual", label: t("Manual") },
  ];

  const params: TaskQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      userId: filterAssignedTo !== "all" ? filterAssignedTo : undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [
      rowsPerPage,
      page,
      searchText,
      filterStatus,
      filterAssignedTo,
      sortBy,
      orderBy,
    ]
  );

  const { data, refetch } = useTasksQuery(params, true);
  const tasks = data?.items ?? [];
  const totalTasks = data?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText, filterStatus, filterAssignedTo]);

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

  const columns: GridColDef<Task>[] = [
    { field: "activityId", headerName: t("Task"), flex: 1 },
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
    { field: "assigneeType", headerName: t("Assigned to"), flex: 1 },
    { field: "assigneeId", headerName: t("User/Group Assigned"), flex: 1 },
    { field: "instanceId", headerName: t("Instance ID"), flex: 1 },
    { field: "taskId", headerName: t("Task ID"), flex: 1 },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Task, string>) => (
        <span>{formatDate(params.row.created_at)}</span>
      ),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Task, string>) => (
        <span>{formatDate(params.row.updated_at)}</span>
      ),
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
          disabled={params.row.status?.toLowerCase?.() === "completed"}
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

          <CustomSelect
            label={t("Assigned to")}
            value={filterAssignedTo}
            onChange={(e) => setFilterAssignedTo(e.target.value as AssignedToFilter)}
            options={assignOptions}
          />

          <ButtonRefresh
            onRefreshData={refetch}
            onRefreshFilter={() => {
              setSearchText("");
              setFilterStatus("all");
              setFilterAssignedTo("all");
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
