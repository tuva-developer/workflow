import { useTheme } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
  type GridLocaleText,
  type GridValidRowModel,
  type GridRowId,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface GenericDataGridProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  getRowId?: (row: T) => GridRowId;
  onSortChange?: (sortModel: GridSortModel) => void;
  paginationMode?: "client" | "server";
  sortingMode?: "client" | "server";
  hideFooter?: boolean;
  defaultColDefOverride?: GridColDef<T>;
}

function GenericDataGrid<T extends GridValidRowModel>({
  rows,
  columns,
  loading,
  getRowId,
  onSortChange,
  paginationMode = "client",
  sortingMode = "server",
  hideFooter = true,
}: GenericDataGridProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();

  const localeText: Partial<GridLocaleText> = {
    noRowsLabel: t("No rows"),
    noResultsOverlayLabel: t("No results"),
    toolbarColumns: t("Columns"),
    toolbarFilters: t("Filters"),
    columnHeaderSortIconLabel: t("Sort"),
  };

  const computedColumns = useMemo<GridColDef<T>[]>(() => {
    return columns.map((col) => {
      if (col.renderCell) return col;

      return {
        ...col,
        renderCell: (params) => {
          const value = params.value;
          if (value === null || value === undefined || value === "") {
            return (
              <span
                style={{
                  fontStyle: "italic",
                  color: theme.palette.text.secondary,
                }}
              >
                {t("No data")}
              </span>
            );
          }
          return <>{String(value)}</>;
        },
      };
    });
  }, [columns, t, theme]);

  return (
    <DataGrid<T>
      rows={rows}
      columns={computedColumns}
      loading={loading}
      getRowId={getRowId}
      paginationMode={paginationMode}
      sortingMode={sortingMode}
      onSortModelChange={(sortModel: GridSortModel) => {
        if (sortingMode === "server") onSortChange?.(sortModel);
      }}
      sortingOrder={["asc", "desc"]}
      disableColumnMenu
      disableRowSelectionOnClick
      autoHeight={false}
      hideFooter={hideFooter}
      localeText={localeText}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        "& .MuiDataGrid-columnHeaders": {
          fontSize: 13,
          color: theme.palette.info.main,
        },
        "& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader": { px: 2 },
        "& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader, .MuiDataGrid-columnHeaders .MuiDataGrid-filler, .MuiDataGrid-columnHeaders .MuiDataGrid-scrollbarFiller":
          { borderBottom: `1px solid ${theme.palette.divider}` },
        "& .MuiDataGrid-columnHeaders .no-separator .MuiDataGrid-columnSeparator":
          {
            display: "none",
          },
        "& .MuiDataGrid-cell, .MuiDataGrid-row .MuiDataGrid-filler, .MuiDataGrid-row .MuiDataGrid-scrollbarFiller":
          {
            fontSize: 13,
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        "& .MuiDataGrid-row--borderBottom .MuiDataGrid-iconSeparator": {
          color: theme.palette.divider,
          fontSize: 24,
        },
      }}
    />
  );
}

export default GenericDataGrid;
