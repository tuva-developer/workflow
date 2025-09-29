import "react-toastify/dist/ReactToastify.css";
import { useMemo, useState } from "react";
import { Toolbar, Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import LogMessageDialog from "@/components/dialogs/LogMessageDlg";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { formatDate } from "@/utils/defines";

interface LogsTableProps {
  logs: Log[];
}

function LogsTable({ logs }: LogsTableProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof Log>("date");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isOpenLogMessage, setIsOpenLogMessage] = useState(false);
  const [logMessage, setLogMessage] = useState("");

  const logOptions = useMemo(() => {
    const uniqueLevels = Array.from(
      new Set(logs.map((log) => log.level.toLowerCase()))
    );

    uniqueLevels.sort();

    const options = uniqueLevels.map((level) => ({
      label: level,
      value: level,
    }));

    return [{ label: t("All"), value: "all" }, ...options];
  }, [logs, t]);

  const filteredLogs = logs
    .filter((log: Log) => {
      if (
        filterLevel !== "all" &&
        log.level.toLowerCase() !== filterLevel.toLowerCase()
      )
        return false;
      const searchLower = searchText.toLowerCase();
      return (
        log?.activityId?.toLowerCase().includes(searchLower) ||
        log?.level?.toLowerCase().includes(searchLower) ||
        log?.log?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return orderBy === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeSort = (sortLog) => {
    if (sortLog.length > 0) {
      setSortBy(sortLog[0].field as keyof Log);
      setOrderBy((sortLog[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("date");
      setOrderBy("desc");
    }
  };

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  function handleClickLog(log: string) {
    setLogMessage(log);
    setIsOpenLogMessage(true);
  }

  const columns: GridColDef<Log>[] = [
    { field: "activityId", headerName: t("Activity ID"), flex: 1 },
    { field: "level", headerName: t("Level"), flex: 1 },
    {
      field: "date",
      headerName: t("Date"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Log, string>) => (
        <>{formatDate(params.row.date)}</>
      ),
    },
    {
      field: "log",
      headerName: t("Log"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<Log>) => (
        <Box
          sx={{ cursor: "pointer", color: theme.palette.info.main }}
          onClick={() => {
            handleClickLog(params.row.log);
          }}
        >
          {params.row.log.length > 50
            ? `${params.row.log.slice(0, 50)}...`
            : params.row.log}
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            gap: 1,
            flexShrink: 0,
            pl: "0 !important",
          }}
        >
          <SearchTextField
            value={searchText}
            onChangeDebounced={(val) => setSearchText(val)}
          />

          <CustomSelect
            label={t("Level")}
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as string)}
            options={logOptions}
          />
        </Toolbar>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <GenericDataGrid<Log>
            rows={paginatedLogs}
            columns={columns}
            getRowId={(row) => `${row.activityId}-${row.date}`}
            onSortChange={handleChangeSort}
          />

          <CustomTablePagination
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

      <LogMessageDialog
        isOpen={isOpenLogMessage}
        logMessage={logMessage}
        onClose={() => setIsOpenLogMessage(false)}
      />
    </>
  );
}

export default LogsTable;
