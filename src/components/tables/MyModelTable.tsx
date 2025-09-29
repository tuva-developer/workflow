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
import RunModelDialog from "@/components/dialogs/RunModelDlg";
import UpdateModelPermissions from "@/components/dialogs/UpdateModelPermissionDlg";
import { showWarn } from "@/utils/toastConfig";
import { defaultModel, formatDate } from "@/utils/defines";
import { MdEdit, MdRebaseEdit } from "react-icons/md";
import { IoPlay } from "react-icons/io5";
import { FaUserLock } from "react-icons/fa";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import ActionButton from "@/components/common/ActionButton";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import GenericDataGrid from "@/components/common/GenericDataGrid";
import { useAllModelsQuery } from "@/hooks/query/useModelsQuery";
import {
  useSetReadOnlyModel,
  useUpdateModel,
} from "@/hooks/mutations/useModelMutations";
import { useModelPermissionQuery } from "@/hooks/query/useModelPermissionQuery";
import { useUpdateModelPermission } from "@/hooks/mutations/useModelPermissionMutations";
import type { ModelPermission, ModelQuery } from "@/services/types";
import SelectModelCategory from "@/components/common/SelectModelCategory";
import SelectModelType from "@/components/common/SelectModelType";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";
import UpdateModelDialog from "@/components/dialogs/UpdateModelDlg";

type Role = "edit" | "execute";
type PermissionData = {
  [K in Role]: { users: string[]; groups: string[] };
};

const defaultPermissionData: PermissionData = {
  edit: { users: [], groups: [] },
  execute: { users: [], groups: [] },
};

function MyModelTable() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [filterReadOnly, setFilterReadOnly] = useState<ReadOnlyFilter>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof Model>("updated_at");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [
    isUpdateModelPermissionDialogOpen,
    setIsUpdateModelPermissionDialogOpen,
  ] = useState(false);
  const [isUpdateModelDialogOpen, setIsUpdateModelDialogOpen] = useState(false);
  const [isRunModel, setIsRunModel] = useState(false);
  const [modelIdToRun, setModelIdToRun] = useState("");
  const [modelIdToUpdatePermission, setModelIdToUpdatePermission] =
    useState<string>("");
  const [modelToUpdate, setModelToUpdate] = useState<Model>(defaultModel);

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
      filterCategory,
      filterType,
      filterReadOnly,
      sortBy,
      orderBy,
    ]
  );

  const { data: dataModels, refetch } = useAllModelsQuery(params, true);
  const { data: dataModelCategories } = useModelCategoriesQuery({}, true);
  const { data: dataModelTypes } = useModelTypesQuery({}, true);
  const models = dataModels?.items ?? [];
  const modelCategories = dataModelCategories?.items ?? [];
  const modelTypes = dataModelTypes?.items ?? [];
  const totalModels = dataModels?.total ?? 0;

  const { data: permissionData } = useModelPermissionQuery(
    modelIdToUpdatePermission,
    isUpdateModelPermissionDialogOpen
  );

  const setReadOnlyMutation = useSetReadOnlyModel();
  const updateModelMutation = useUpdateModel();
  const updatePermissionMutation = useUpdateModelPermission();

  useEffect(() => {
    setPage(0);
  }, [searchText, filterCategory, filterType, filterReadOnly]);

  function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setSearchText("");
    setFilterCategory("all");
    setFilterType("all");
    setFilterReadOnly("all");
  }

  function handleUpdateModelPermissionOpen(modelId: string) {
    setModelIdToUpdatePermission(modelId);
    setIsUpdateModelPermissionDialogOpen(true);
  }

  function handleQuickUpdate(model: Model) {
    setModelToUpdate(model);
    setIsUpdateModelDialogOpen(true);
  }

  function handleExecuteModel(modelId: string) {
    setModelIdToRun(modelId);
    setIsRunModel(true);
  }

  function handleReadOnlyChange(modelId: string, check: boolean) {
    setReadOnlyMutation.mutate({ id: modelId, readOnly: check });
  }

  function handleUpdateModel(
    rename: string,
    typeId: string,
    categoryId: string
  ) {
    updateModelMutation.mutate({
      id: modelToUpdate._id,
      params: { rename, typeId, categoryId },
    });
  }

  function handleSubmitPermission(data: ModelPermission) {
    if (!modelIdToUpdatePermission) {
      showWarn(t("An error occurred please try again later"));
      return;
    }
    updatePermissionMutation.mutate({ id: modelIdToUpdatePermission, data });
  }

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeSort = (sortModel) => {
    if (sortModel.length > 0) {
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
      renderCell: (p) =>
        modelCategories.find((c) => c._id === p.row.categoryId)?.name ??
        t("null"),
    },
    {
      field: "typeId",
      headerName: t("Type"),
      flex: 1,
      renderCell: (p) =>
        modelTypes.find((tt) => tt._id === p.row.typeId)?.name ?? t("null"),
    },
    {
      field: "created_at",
      headerName: t("Created at"),
      flex: 1,
      renderCell: (p: GridRenderCellParams<Model, string>) => (
        <span>{formatDate(p.row.created_at)}</span>
      ),
    },
    {
      field: "updated_at",
      headerName: t("Updated at"),
      flex: 1,
      renderCell: (p: GridRenderCellParams<Model, string>) => (
        <span>{formatDate(p.row.updated_at)}</span>
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
      renderCell: (p: GridRenderCellParams<Model>) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ActionButton
            icon={<FaUserLock size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Update permission")}
            onClick={() => handleUpdateModelPermissionOpen(p.row._id)}
          />
          <ActionButton
            icon={<MdRebaseEdit size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Edit model")}
            onClick={() => window.open(`/model/${p.row._id}`, "_blank")}
          />
          <ActionButton
            icon={<MdEdit size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Quick update")}
            onClick={() => handleQuickUpdate(p.row)}
          />
          <ActionButton
            icon={<IoPlay size={20} />}
            color={theme.palette.primary.main}
            tooltip={t("Execute")}
            onClick={() => handleExecuteModel(p.row._id)}
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
      <Toolbar sx={{ gap: 1, flexShrink: 0 }}>
        <SearchTextField
          value={searchText}
          onChangeDebounced={(val) => setSearchText(val)}
          tooltip="Search (ID, ID version, name, description)"
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

      <RunModelDialog
        isOpen={isRunModel}
        onClose={() => setIsRunModel(false)}
        modelId={modelIdToRun}
      />

      <UpdateModelPermissions
        isOpen={isUpdateModelPermissionDialogOpen}
        onClose={() => setIsUpdateModelPermissionDialogOpen(false)}
        onSubmit={handleSubmitPermission}
        initialValue={
          permissionData ??
          (defaultPermissionData as unknown as ModelPermission)
        }
      />

      <UpdateModelDialog
        isOpen={isUpdateModelDialogOpen}
        onClose={() => setIsUpdateModelDialogOpen(false)}
        onOk={({ rename, type, category }) =>
          handleUpdateModel(rename, type, category)
        }
        initialValue={modelToUpdate}
      />
    </Box>
  );
}

export default MyModelTable;
