import { defaultModelCategory, formatDate } from "@/utils/defines";
import { Box, Button, Toolbar, useTheme } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import AddModelCategoryDialog from "@/components/dialogs/AddModelCategoryDlg";
import UpdateModelCategoryDialog from "@/components/dialogs/UpdateModelCategoryDlg";
import SearchTextField from "@/components/common/SearchTextField";
import { useAppContext } from "@/hooks/useAppContext";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import ActionButton from "@/components/common/ActionButton";
import { useDeleteModelCategory } from "@/hooks/mutations/useModelCategoryMutations";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { ModelCategoryQuery } from "@/services/types";

function ModelCategoriesTable() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof ModelCategory>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState<ModelCategory>(defaultModelCategory);

  const params: ModelCategoryQuery = useMemo(
    () => ({
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [rowsPerPage, page, searchText, sortBy, orderBy]
  );

  const deleteCategoryMutation = useDeleteModelCategory();
  const { data } = useModelCategoriesQuery(params, true);
  const categories = data?.items ?? [];
  const totalCategories = data?.total ?? 0;

  const handleDelete = useCallback(
    (modelCategoryId: string) => {
      openConfirm({
        title: t("Delete Model Category"),
        message: t("Are you sure you want to delete this model category?"),
        onOk: () => {
          deleteCategoryMutation.mutate(
            { modelCategoryId },
            { onSettled: () => closeConfirm() }
          );
        },
      });
    },
    [deleteCategoryMutation, t, openConfirm, closeConfirm]
  );

  const handleUpdate = useCallback((category: ModelCategory) => {
    setCategoryToUpdate(category);
    setIsUpdateDialogOpen(true);
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const handleChangeSort = (sortModelCategory) => {
    if (sortModelCategory.length > 0) {
      setSortBy(sortModelCategory[0].field as keyof ModelCategory);
      setOrderBy((sortModelCategory[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  };

  const columns: GridColDef<ModelCategory>[] = [
    { field: "_id", headerName: t("ID"), flex: 1 },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "description", headerName: t("Description"), flex: 1 },
    { field: "creator", headerName: t("Creator"), flex: 1 },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<ModelCategory, string>) => (
        <>{formatDate(params.row.created_at)}</>
      ),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (params: GridRenderCellParams<ModelCategory, string>) => (
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
      renderCell: (params: GridRenderCellParams<ModelCategory>) => (
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
            onClick={() => handleUpdate(params.row)}
          />
          <ActionButton
            icon={<MdDelete size={20} />}
            color={theme.palette.error.main}
            tooltip={t("Delete")}
            onClick={() => handleDelete(params.row._id)}
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
      <Toolbar sx={{ gap: 1, flexShrink: 0, justifyContent: "space-between" }}>
        <SearchTextField
          value={searchText}
          onChangeDebounced={(val) => setSearchText(val)}
          tooltip="Search (name, description)"
        />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{ whiteSpace: "nowrap", fontSize: 12 }}
        >
          {t("Add category")}
        </Button>
      </Toolbar>

      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", pl: 3, pr: 3, pb: 2 }}>
        <GenericDataGrid<ModelCategory>
          rows={categories}
          columns={columns}
          getRowId={(row) => row._id}
          onSortChange={handleChangeSort}
        />

        <CustomTablePagination
          count={totalCategories}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <AddModelCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      <UpdateModelCategoryDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        modelCategory={categoryToUpdate}
      />
    </Box>
  );
}

export default ModelCategoriesTable;