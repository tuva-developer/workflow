import {
  Box,
  Toolbar,
  useTheme,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { IoIosClose } from "react-icons/io";
import SearchTextField from "@/components/common/SearchTextField";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import ModelListDialog from "@/components/dialogs/ModelListDlg";
import { defaultModel } from "@/utils/defines";
import SelectUser from "@/components/common/SelectUser";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import ActionButton from "@/components/common/ActionButton";
import { FaInfo } from "react-icons/fa";
import InstanceDetailDialog from "@/components/dialogs/InstanceDetailDlg";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { useInstancesQuery } from "@/hooks/query/useInstancesQuery";
import type { InstanceQuery } from "@/services/types";
import { DateCell } from "@/components/common/DateCell";
import { StatusColors } from "@/styles/styles";

function InstanceTable() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState("all");
  const [executorFilter, setExecutorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof Instance>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [isOpenModelList, setIsOpenModelList] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model>(defaultModel);
  const [isOpenInstanceDetail, setIsOpenInstanceDetail] = useState(false);
  const [instanceIdDetail, setInstanceIdDetail] = useState("");

  const statusOptions = [
    { value: "all", label: t("All") },
    { value: "completed", label: t("Completed") },
    { value: "failed", label: t("Failed") },
    { value: "pending", label: t("Pending") },
    { value: "running", label: t("Running") },
    { value: "not executed", label: t("Not Executed") },
    { value: "error", label: t("Error") },
  ];

  const params: InstanceQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      executor: executorFilter !== "all" ? executorFilter : undefined,
      sortBy:
        (sortBy === "executor" ? "userId" : (sortBy as string)) || undefined,
      orderBy: orderBy || undefined,
      modelId: currentModel._id || undefined,
    }),
    [
      rowsPerPage,
      page,
      searchText,
      statusFilter,
      executorFilter,
      sortBy,
      orderBy,
      currentModel._id,
    ]
  );

  const { data, refetch } = useInstancesQuery(params, true);
  const instances = data?.items ?? [];
  const totalInstances = data?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText, statusFilter, executorFilter, currentModel._id]);

  function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setSearchText("");
    setStatusFilter("all");
    setExecutorFilter("all");
    setCurrentModel(defaultModel);
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeSort = (sortModel) => {
    if (sortModel.length > 0) {
      setSortBy(sortModel[0].field as keyof Instance);
      setOrderBy((sortModel[0].sort ?? "asc") as "asc" | "desc");
      setPage(0);
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
      setPage(0);
    }
  };

  const handleClickDetail = (instanceId: string) => {
    setInstanceIdDetail(instanceId);
    setIsOpenInstanceDetail(true);
  };

  const columns: GridColDef<Instance>[] = [
    { field: "_id", headerName: t("ID"), flex: 1 },
    { field: "workflow", headerName: t("Model"), flex: 1 },
    {
      field: "status",
      headerName: t("Status"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Instance, string>) => {
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
    { field: "executor", headerName: t("Executor"), flex: 1 },
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
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      headerClassName: "no-separator",
      renderCell: (p) => (
        <ActionButton
          icon={<FaInfo size={20} />}
          color={theme.palette.info.main}
          tooltip={t("Detail")}
          onClick={() => handleClickDetail(p.row._id)}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              py: 1,
              px: 2,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => setIsOpenModelList(true)}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                backgroundColor: theme.palette.info.main,
                color: theme.palette.common.white,
                "&:hover": {
                  backgroundColor: theme.palette.info.light,
                },
              }}
            >
              {t("Select model")}
            </Button>

            <Typography
              sx={{
                fontSize: 13,
                color: currentModel._id
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
              }}
            >
              {currentModel.name || t("No model selected")}
            </Typography>

            {currentModel._id && (
              <IconButton
                size="small"
                onClick={() => setCurrentModel(defaultModel)}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": { color: theme.palette.error.main },
                }}
              >
                <IoIosClose />
              </IconButton>
            )}
          </Box>

          <SearchTextField
            value={searchText}
            onChangeDebounced={(val) => setSearchText(val)}
            tooltip="Search (ID, status, executor)"
          />

          <SelectUser
            label={t("Executor")}
            minWidth={160}
            userId={executorFilter}
            setUserId={setExecutorFilter}
          />

          <CustomSelect
            label={t("Status")}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as string)}
            options={statusOptions}
          />

          <ButtonRefresh
            onRefreshData={handleRefreshData}
            onRefreshFilter={handleRefreshFilter}
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
          <GenericDataGrid<Instance>
            rows={instances}
            columns={columns}
            getRowId={(row) => row._id}
            onSortChange={handleChangeSort}
          />

          <CustomTablePagination
            count={totalInstances}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

      <ModelListDialog
        isOpen={isOpenModelList}
        onClose={() => setIsOpenModelList(false)}
        setCurrentModel={setCurrentModel}
        selectOnly={true}
      />

      <InstanceDetailDialog
        isOpen={isOpenInstanceDetail}
        onClose={() => setIsOpenInstanceDetail(false)}
        instanceId={instanceIdDetail}
      />
    </>
  );
}

export default InstanceTable;
