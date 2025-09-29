import { defaultModelType, formatDate } from "@/utils/defines";
import { Box, Button, Toolbar, useTheme } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import AddModelTypeDialog from "@/components/dialogs/AddModelTypeDialog";
import UpdateModelTypeDialog from "@/components/dialogs/UpdateModelTypeDialog";
import SearchTextField from "@/components/common/SearchTextField";
import { useAppContext } from "@/hooks/useAppContext";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import ActionButton from "@/components/common/ActionButton";
import { useDeleteModelType } from "@/hooks/mutations/useModelTypeMutations";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { ModelTypeQuery } from "@/services/types";

function ModelCategoryTable() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof ModelType>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isAddModelTypeDialogOpen, setIsAddModelTypeDialogOpen] =
    useState(false);
  const [isUpdateModelTypeDialogOpen, setIsUpdateModelTypeDialogOpen] =
    useState(false);
  const [modelTypeToUpdate, setModelTypeToUpdate] =
    useState<ModelType>(defaultModelType);

  const params: ModelTypeQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [rowsPerPage, page, searchText, sortBy, orderBy]
  );

  const deleteModelTypeMutation = useDeleteModelType();
  const { data } = useModelTypesQuery(params, true);
  const modelTypes = data?.items ?? [];
  const totalModelTypes = data?.total ?? 0;

  const handleDeleteModelType = useCallback(
    (modelTypeId: string) => {
      openConfirm({
        title: t("Delete Model Type"),
        message: t("Are you sure you want to delete this model type?"),
        onOk: () => {
          deleteModelTypeMutation.mutate(
            { modelTypeId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteModelTypeMutation, t, openConfirm, closeConfirm]
  );

  const handleUpdateModelType = useCallback((modelType: ModelType) => {
    setModelTypeToUpdate(modelType);
    setIsUpdateModelTypeDialogOpen(true);
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

  const handleChangeSort = (sortModelType) => {
    if (sortModelType.length > 0) {
      setSortBy(sortModelType[0].field as keyof ModelType);
      setOrderBy((sortModelType[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  };

  const columns: GridColDef<ModelType>[] = [
    { field: "_id", headerName: t("ID"), flex: 1 },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "description", headerName: t("Description"), flex: 1 },
    { field: "creator", headerName: t("Creator"), flex: 1 },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<ModelType, string>) => (
        <>{formatDate(params.row.updated_at)}</>
      ),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<ModelType, string>) => (
        <>{formatDate(params.row.updated_at)}</>
      ),
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
      renderCell: (params: GridRenderCellParams<ModelType>) => (
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
            onClick={() => handleUpdateModelType(params.row)}
          />
          <ActionButton
            icon={<MdDelete size={20} />}
            color={theme.palette.error.main}
            tooltip={t("Delete")}
            onClick={() => handleDeleteModelType(params.row._id)}
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
          tooltip="Search (name, description)"
        />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setIsAddModelTypeDialogOpen(true)}
          sx={{ whiteSpace: "nowrap", fontSize: 12 }}
        >
          {t("Add type")}
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
        <GenericDataGrid<ModelType>
          rows={modelTypes}
          columns={columns}
          getRowId={(row) => row._id}
          onSortChange={handleChangeSort}
        />

        <CustomTablePagination
          count={totalModelTypes}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <AddModelTypeDialog
        isOpen={isAddModelTypeDialogOpen}
        onClose={() => setIsAddModelTypeDialogOpen(false)}
      />

      <UpdateModelTypeDialog
        isOpen={isUpdateModelTypeDialogOpen}
        onClose={() => setIsUpdateModelTypeDialogOpen(false)}
        modelType={modelTypeToUpdate}
      />
    </Box>
  );
}

export default ModelCategoryTable;
