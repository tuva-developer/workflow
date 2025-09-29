import "react-toastify/dist/ReactToastify.css";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Toolbar,
  Box,
  useTheme,
  Button,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { useAppContext } from "@/hooks/useAppContext";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import SelectUser from "@/components/common/SelectUser";
import { MdAdd, MdDelete, MdDeleteOutline } from "react-icons/md";
import { showWarn } from "@/utils/toastConfig";
import { defaultModel, formatDate } from "@/utils/defines";
import { IoIosClose } from "react-icons/io";
import ModelListDialog from "@/components/dialogs/ModelListDlg";
import AddScheduleDialog from "@/components/dialogs/AddScheduleDlg";
import ActionButton from "@/components/common/ActionButton";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { ScheduleQuery } from "@/services/types";
import { useSchedulesQuery } from "@/hooks/query/useSchedulesQuery";
import {
  useDeleteAllSchedules,
  useDeleteSchedule,
  useUpdateSchedule,
} from "@/hooks/mutations/useScheduleMutations";

function SchedulesTable() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [filterCreator, setFilterCreator] = useState("all");
  const [sortBy, setSortBy] = useState<keyof User>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isOpenModelList, setIsOpenModelList] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model>(defaultModel);
  const [isAddScheduleDialogOpen, setIsAddScheduleDialogOpen] = useState(false);

  const params: ScheduleQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      modelId: currentModel._id || undefined,
      owner: filterCreator !== "all" ? filterCreator : undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [
      rowsPerPage,
      page,
      searchText,
      currentModel._id,
      filterCreator,
      sortBy,
      orderBy,
    ]
  );

  const deleteScheduleMutation = useDeleteSchedule();
  const deleteAllSchedule = useDeleteAllSchedules();
  const updateScheduleMutation = useUpdateSchedule();
  const { data, refetch } = useSchedulesQuery(params, true);
  const schedules = data?.items ?? [];
  const totalSchedules = data?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [rowsPerPage, searchText, currentModel._id, filterCreator]);

  async function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setSearchText("");
    setFilterCreator("all");
    setCurrentModel(defaultModel);
  }

  function handleAddSchedule() {
    if (!currentModel._id) {
      showWarn(t("Please select a model to add a schedule"));
      return;
    }

    setIsAddScheduleDialogOpen(true);
  }

  const handleDeleteSchedule = useCallback(
    (scheduleId: string) => {
      openConfirm({
        title: t("Delete Schedule"),
        message: t("Are you sure you want to delete this schedule?"),
        onOk: () => {
          deleteScheduleMutation.mutate(
            { scheduleId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteScheduleMutation, t, openConfirm, closeConfirm]
  );

  const handleDeleteAllSchedule = useCallback(() => {
    openConfirm({
      title: t("Delete All Schedules"),
      message: t("Are you sure you want to delete all schedules?"),
      onOk: () => {
        deleteAllSchedule.mutate(undefined, {
          onSettled: () => closeConfirm(),
        });
      },
    });
  }, [deleteAllSchedule, t, openConfirm, closeConfirm]);

  function handleActiveChange(scheduleId: string, isActive: boolean) {
    updateScheduleMutation.mutate({ scheduleId, active: isActive });
  }

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

  const columns: GridColDef<Schedule>[] = [
    {
      field: "_id",
      headerName: t("ID"),
      flex: 1,
    },
    {
      field: "modelId",
      headerName: t("Model ID"),
      flex: 1,
    },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "description", headerName: t("Description"), flex: 1 },
    { field: "creator", headerName: t("Creator"), flex: 1 },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Schedule, string>) => (
        <span>{formatDate(params.row.created_at)}</span>
      ),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Schedule, string>) => (
        <span>{formatDate(params.row.updated_at)}</span>
      ),
    },
    {
      field: "active",
      headerName: t("Activate"),
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Schedule, boolean>) => (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={params.value}
              onChange={(e) =>
                handleActiveChange(params.row._id, e.target.checked)
              }
              color="success"
            />
          }
          label={params.value ? t("Active") : t("Inactive")}
          sx={{ "& .MuiTypography-root": { fontSize: 13 } }}
        />
      ),
    },
    { field: "cron", headerName: t("Cron"), flex: 1 },
    {
      field: "action",
      headerName: t("Action"),
      flex: 0,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      headerClassName: "no-separator",
      renderCell: (params: GridRenderCellParams<Schedule>) => (
        <ActionButton
          icon={<MdDelete size={20} />}
          color={theme.palette.error.main}
          tooltip={t("Delete schedule")}
          onClick={() => handleDeleteSchedule(params.row._id)}
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
        <Toolbar
          sx={{
            flexShrink: 0,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
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
                onClick={() => {
                  setIsOpenModelList(true);
                }}
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
              tooltip="Search (ID, model ID, name, description)"
            />

            <SelectUser
              label={t("Creator")}
              minWidth={160}
              userId={filterCreator}
              setUserId={setFilterCreator}
            />
            <ButtonRefresh
              onRefreshData={handleRefreshData}
              onRefreshFilter={handleRefreshFilter}
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mt: 0.5,
              ml: 1,
            }}
          >
            <Tooltip title={t("Add schedule")}>
              <IconButton
                size="small"
                onClick={handleAddSchedule}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  "&:hover": {
                    bgcolor: theme.palette.info.light,
                  },
                }}
              >
                <MdAdd />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("Delete all schedule")}>
              <IconButton
                size="small"
                onClick={handleDeleteAllSchedule}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.common.white,
                  "&:hover": {
                    bgcolor: theme.palette.error.light,
                  },
                }}
              >
                <MdDeleteOutline />
              </IconButton>
            </Tooltip>
          </Box>
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
          <GenericDataGrid<Schedule>
            rows={schedules}
            columns={columns}
            getRowId={(row) => row._id}
            onSortChange={handleChangeSort}
          />

          <CustomTablePagination
            count={totalSchedules}
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

      <AddScheduleDialog
        isOpen={isAddScheduleDialogOpen}
        onClose={() => setIsAddScheduleDialogOpen(false)}
        modelId={currentModel._id}
        refreshData={handleRefreshData}
      />
    </>
  );
}

export default SchedulesTable;
