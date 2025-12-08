import {
  Box,
  Toolbar,
  useTheme,
  FormControlLabel,
  Switch,
} from "@mui/material";
import SearchTextField from "@/components/common/SearchTextField";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import SelectUser from "@/components/common/SelectUser";
import { MdRebaseEdit } from "react-icons/md";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import ActionButton from "@/components/common/ActionButton";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import { GridColDef } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { useEditableModelsQuery } from "@/hooks/query/useModelsQuery";
import { useSetReadOnlyModel } from "@/hooks/mutations/useModelMutations";
import SelectModelCategory from "@/components/common/SelectModelCategory";
import SelectModelType from "@/components/common/SelectModelType";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";
import { ModelQuery } from "@/services/types";

function EditableModelTable() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterReadOnly, setFilterReadOnly] = useState<ReadOnlyFilter>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState<keyof Model>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const readOnlyOptions = [
    { value: "all", label: t("All") },
    { value: "true", label: t("On") },
    { value: "false", label: t("Off") },
  ];

  const params: ModelQuery = useMemo(
    () => ({
      hasConfig: false,
      limit: rowsPerPage,
      page: page + 1,
      search: searchText || undefined,
      owner: filterOwner !== "all" ? filterOwner : undefined,
      categoryId: filterCategory !== "all" ? filterCategory : undefined,
      typeId: filterType !== "all" ? filterType : undefined,
      readOnly:
        filterReadOnly === "all"
          ? undefined
          : filterReadOnly === "true"
          ? true
          : false,
      sortBy: sortBy || undefined,
      orderBy: orderBy || undefined,
    }),
    [
      rowsPerPage,
      page,
      searchText,
      filterOwner,
      filterCategory,
      filterType,
      filterReadOnly,
      sortBy,
      orderBy,
    ]
  );

  const { data: dataModels, refetch } = useEditableModelsQuery(params, true);
  const { data: dataModelCategories } = useModelCategoriesQuery({}, true);
  const { data: dataModelTypes } = useModelTypesQuery({}, true);
  const models = dataModels?.items ?? [];
  const modelCategories = dataModelCategories?.items ?? [];
  const modelTypes = dataModelTypes?.items ?? [];
  const totalModels = dataModels?.total ?? 0;

  useEffect(() => {
    setPage(0);
  }, [searchText, filterOwner, filterCategory, filterType, filterReadOnly]);

  const setReadOnlyMutation = useSetReadOnlyModel();

  function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setSearchText("");
    setFilterCategory("all");
    setFilterType("all");
    setFilterReadOnly("all");
    setFilterOwner("all");
  }

  function handleEditModel(modelId: string) {
    window.open(`/model/${modelId}`, "_blank");
  }

  function handleReadOnlyChange(modelId: string, check: boolean) {
    setReadOnlyMutation.mutate({ id: modelId, readOnly: check });
  }

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeSort = (sortModel) => {
    if (sortModel?.length > 0) {
      setSortBy(sortModel[0].field as keyof Model);
      setOrderBy((sortModel[0].sort ?? "asc") as "asc" | "desc");
    } else {
      setSortBy("updated_at");
      setOrderBy("desc");
    }
  };

  const columns: GridColDef<Model>[] = [
    { field: "_id", headerName: t("ID"), flex: 1 },
    { field: "_id_version", headerName: t("ID version"), flex: 1 },
    { field: "owner", headerName: t("Owner"), flex: 1 },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "description", headerName: t("Description"), flex: 1 },
    {
      field: "read_only",
      headerName: t("Read only"),
      flex: 1,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={Boolean(params.value)}
              onChange={(e) =>
                handleReadOnlyChange(params.row._id, e.target.checked)
              }
              color="success"
            />
          }
          label={params.value ? t("On") : t("Off")}
          sx={{ "& .MuiTypography-root": { fontSize: 13 } }}
        />
      ),
    },
    {
      field: "categoryId",
      headerName: t("Category"),
      flex: 1,
      renderCell: (p) => {
        const categoryName =
          modelCategories.find((c) => c._id === p.row.categoryId)?.name ?? null;
        if (!categoryName)
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
        return <span>{categoryName}</span>;
      },
    },
    {
      field: "typeId",
      headerName: t("Type"),
      flex: 1,
      renderCell: (p) => {
        const typeName =
          modelTypes.find((c) => c._id === p.row.typeId)?.name ?? null;
        if (!typeName)
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
        return <span>{typeName}</span>;
      },
    },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (p) => new Date(p.row.created_at).toLocaleString(),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (p) => new Date(p.row.updated_at).toLocaleString(),
    },
    {
      field: "actions",
      headerName: t("Action"),
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <ActionButton
          icon={<MdRebaseEdit size={20} />}
          color={theme.palette.primary.main}
          tooltip={t("Edit model")}
          onClick={() => handleEditModel(p.row._id)}
        />
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
      <Toolbar sx={{ gap: 1, flexShrink: 0 }}>
        <SearchTextField
          value={searchText}
          onChangeDebounced={(val) => setSearchText(val)}
          tooltip="Search (ID, ID version, name, description)"
        />

        <SelectUser
          label={t("Owner")}
          minWidth={160}
          userId={filterOwner}
          setUserId={setFilterOwner}
        />

        <SelectModelCategory
          label={t("Category")}
          minWidth={160}
          categoryId={filterCategory}
          setCategoryId={setFilterCategory}
        />

        <SelectModelType
          label={t("Type")}
          minWidth={160}
          typeId={filterType}
          setTypeId={setFilterType}
        />

        <CustomSelect
          label={t("Read only mode")}
          value={filterReadOnly}
          onChange={(e) => setFilterReadOnly(e.target.value as ReadOnlyFilter)}
          options={readOnlyOptions}
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
        <GenericDataGrid<Model>
          rows={models}
          columns={columns}
          getRowId={(row) => row._id}
          onSortChange={handleChangeSort}
        />

        <CustomTablePagination
          count={totalModels}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
}

export default EditableModelTable;
