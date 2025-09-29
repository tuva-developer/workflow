import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  CardContent,
  Card,
  useTheme,
} from "@mui/material";
import { VscFilter } from "react-icons/vsc";
import { Popper, ClickAwayListener } from "@mui/material";
import { DateRange } from "react-date-range";
import { FixedSizeList as List } from "react-window";
import InvokeListDialog from "@/components/dialogs/InvokeListDlg";
import LogListDialog from "@/components/dialogs/LogListDlg.js";
import { dialogStyles } from "@/styles/styles";
import InstanceView from "@/components/common/InstanceView";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { useAppContext } from "@/hooks/useAppContext";
import { showWarn } from "@/utils/toastConfig";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  useInstanceQuery,
  useInstancesQuery,
} from "@/hooks/query/useInstancesQuery";
import { useDeleteInstance } from "@/hooks/mutations/useInstanceMutations";
import { InstanceQuery } from "@/services/types";

const StatusColors: Record<string, string> = {
  completed: "#28a745",
  failed: "#ef4444",
  pending: "#FFB823",
  running: "#007bff",
  "not executed": "#FF7D29",
};

interface InstanceListProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

const InstanceItem = ({ data, index, style }) => {
  const instance = data.items[index] as Instance;
  const theme = useTheme();
  const { t } = useTranslation();
  const color = StatusColors[instance.status] || "#000000";

  const { refetch } = useInstanceQuery(instance._id, false);

  const handleOnClick = async () => {
    try {
      refetch();
      data.handleClick(instance._id);
    } catch {
      showWarn(t("Failed to load instance"));
    }
  };

  return (
    <Box
      style={{ ...style, display: "flex", alignItems: "center", width: "100%" }}
    >
      <Card
        key={instance._id}
        onClick={handleOnClick}
        sx={{
          border:
            instance._id === data.instanceIdSelected
              ? `1px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            instance._id === data.instanceIdSelected
              ? "0 0 0 3px rgba(42, 149, 252, 0.2)"
              : "none",
          cursor: "pointer",
          borderRadius: 2,
          padding: "12px 16px",
          width: "100%",
          "&:hover": { borderColor: theme.palette.primary.main },
          "&:focus": {
            borderColor: theme.palette.primary.main,
            boxShadow: "0 0 0 3px rgba(42, 149, 252, 0.2)",
          },
        }}
      >
        <CardContent
          sx={{
            p: 0,
            "&:last-child": { pb: 0 },
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {instance._id}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 400,
              color,
              backgroundColor: `${color}10`,
              px: "6px",
              py: "2px",
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            {t(instance.status)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

const InstanceListDialog: React.FC<InstanceListProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();
  const [searchText, setSearchText] = useState("");
  const [instanceIdSelected, setInstanceIdSelected] = useState("");
  const [isInvokeDialogOpen, setIsInvokeDialogOpen] = useState(false);
  const [isOpenLogs, setIsOpenLogs] = useState(false);
  const anchorRef = React.useRef(null);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [dateFilter, setDateFilter] = useState<
    { startDate: Date | null; endDate: Date | null; key: string }[]
  >([{ startDate: null, endDate: null, key: "selection" }]);
  const [statusFilter, setStatusFilter] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = [
    { value: "all", label: t("All") },
    { value: "completed", label: t("Completed") },
    { value: "failed", label: t("Failed") },
    { value: "pending", label: t("Pending") },
    { value: "running", label: t("Running") },
    { value: "not executed", label: t("Not Executed") },
  ];

  const params: InstanceQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      updated_from: dateFilter[0].startDate
        ? Math.floor(dateFilter[0].startDate.getTime() / 1000)
        : undefined,
      updated_to: dateFilter[0].endDate
        ? Math.floor(dateFilter[0].endDate.getTime() / 1000)
        : undefined,
      // sortBy: "updated_at",
      // orderBy: "desc",
      modelId: modelId || undefined,
    }),
    [rowsPerPage, page, searchText, statusFilter, dateFilter, modelId]
  );

  const { data, refetch } = useInstancesQuery(params, isOpen);
  const instances = data?.items || [];
  const totalInstances = data?.total || 0;

  const deleteInstanceMutation = useDeleteInstance();

  useEffect(() => {
    if (isOpen) {
      refetch();
    } else {
      setInstanceIdSelected("");
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    setPage(0);
  }, [searchText, statusFilter, dateFilter]);

  function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setDateFilter([{ startDate: null, endDate: null, key: "selection" }]);
    setStatusFilter("all");
    setSearchText("");
  }

  async function handleClick(instanceId: string) {
    setInstanceIdSelected(instanceId);
  }

  function handleClickLogs() {
    setIsOpenLogs(true);
  }

  function handleClickInvokes() {
    if (instanceIdSelected === "") {
      showWarn(t("Instance has not been selected"));
      return;
    }

    setIsInvokeDialogOpen(true);
  }

  function handleClickDelete() {
    openConfirm({
      title: t("Delete instance"),
      message: t("Are you sure you want to delete this instance?"),
      onOk: () => {
        deleteInstanceMutation.mutate(
          { instanceId: instanceIdSelected },
          {
            onSettled: () => {
              closeConfirm();
              setInstanceIdSelected("");
            },
          }
        );
      },
    });
  }

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullScreen
        sx={{
          ...dialogStyles(theme),
          "& .MuiDialog-paper": {
            width: "95vw",
            height: "95vh",
            margin: 0,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography>{t("Workflow instance list")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", padding: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: 600,
              height: "100%",
              gap: 1,
              p: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                ref={anchorRef}
                variant="outlined"
                onClick={() => setIsOpenCalendar((prev) => !prev)}
                startIcon={<VscFilter size={20} />}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: "none",
                  fontSize: 13,
                  padding: "8px 12px",
                  borderRadius: 1,
                  borderColor: theme.palette.divider,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {dateFilter[0].startDate && dateFilter[0].endDate
                  ? `${dateFilter[0].startDate.toLocaleDateString()} - ${dateFilter[0].endDate.toLocaleDateString()}`
                  : t("All time")}
              </Button>

              <Popper
                open={isOpenCalendar}
                anchorEl={anchorRef.current}
                placement="bottom-start"
                sx={{ zIndex: 9999 }}
              >
                <ClickAwayListener onClickAway={() => setIsOpenCalendar(false)}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <DateRange
                      ranges={dateFilter}
                      onChange={(item) => setDateFilter([item.selection])}
                    />
                  </Box>
                </ClickAwayListener>
              </Popper>

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
            </Box>

            <SearchTextField
              value={searchText}
              onChangeDebounced={(val) => setSearchText(val)}
              tooltip="Search instances"
              width={"100%"}
            />

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                ref={containerRef}
                sx={{
                  flex: 1,
                  overflow: "auto",
                }}
              >
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={instances.length}
                      itemSize={80}
                      itemData={{
                        items: instances,
                        handleClick,
                        instanceIdSelected,
                      }}
                    >
                      {InstanceItem}
                    </List>
                  )}
                </AutoSizer>
              </Box>

              <CustomTablePagination
                count={totalInstances}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>
          <InstanceView instanceId={instanceIdSelected} isResetZoom={false} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClickLogs} className="blue">
            {t("Logs")}
          </Button>
          <Button onClick={handleClickInvokes} className="blue">
            {t("Invokes")}
          </Button>
          <Button onClick={handleClickDelete} className="red">
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <InvokeListDialog
        isOpen={isInvokeDialogOpen}
        onClose={() => setIsInvokeDialogOpen(false)}
        instanceId={instanceIdSelected}
      />

      <LogListDialog
        isOpen={isOpenLogs}
        onClose={() => setIsOpenLogs(false)}
        instanceId={instanceIdSelected}
      />
    </>
  );
};

export default InstanceListDialog;
