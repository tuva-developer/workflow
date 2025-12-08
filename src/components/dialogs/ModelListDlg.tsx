import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Card,
  useTheme,
  Tooltip,
} from "@mui/material";
import { AiOutlineDelete, AiOutlineInfo } from "react-icons/ai";
import { TfiExport } from "react-icons/tfi";
import BpmnViewer from "bpmn-js/lib/Viewer";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import { FixedSizeList as List } from "react-window";
import ExportModelDialog from "@/components/dialogs/ExportModelDlg";
import { dialogStyles } from "@/styles/styles";
import CustomRenderer from "@/bpmnProvider/provider/CustomRenderer.js";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { defaultModel, formatDate } from "@/utils/defines";
import { useAppContext } from "@/hooks/useAppContext";
import { showWarn } from "@/utils/toastConfig";
import UpdateModelDialog from "@/components/dialogs/UpdateModelDlg";
import SelectUser from "@/components/common/SelectUser";
import CustomTablePagination from "@/components/common/CustomTablePagination";
import CustomSelect from "@/components/common/CustomSelect";
import ButtonRefresh from "@/components/common/ButtonRefresh";
import { useEditableModelsQuery } from "@/hooks/query/useModelsQuery";
import {
  useDeleteModel,
  useUpdateModel,
} from "@/hooks/mutations/useModelMutations";
import SelectModelCategory from "@/components/common/SelectModelCategory";
import SelectModelType from "@/components/common/SelectModelType";
import { useModelCategoriesQuery } from "@/hooks/query/useModelCategoriesQuery";
import { useModelTypesQuery } from "@/hooks/query/useModelTypesQuery";
import AutoSizer from "react-virtualized-auto-sizer";
import { ModelQuery } from "@/services/types";
import { loadModelData } from "@/services/models";

interface ModelListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentModel: (model: Model) => void;
  selectOnly?: boolean;
}

const Item = ({ data, index, style }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const model = data.items[index] as Model;
  const types = data.types;
  const categories = data.categories;
  const selectOnly = data.selectOnly;

  const clickTimeout = useRef<number | null>(null);

  const handleOnClick = () => {
    if (clickTimeout.current) return;

    clickTimeout.current = window.setTimeout(() => {
      clickTimeout.current = null;
      try {
        data.handleClick(model);
      } catch (err) {
        console.error("Error:", err);
      }
    }, 200);
  };

  const handleOnDoubleClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    try {
      data.handleDoubleClick(model);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      try {
        data.handleKeyDown(model);
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const oneLineText = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "16px",
    display: "block",
  };

  const categoryName =
    categories.find((cat) => cat._id === model.categoryId)?.name || t("N/A");
  const typeName =
    types.find((type) => type._id === model.typeId)?.name || t("N/A");

  const detailTooltip = (
    <Box sx={{ p: 1, fontSize: 12, maxWidth: 320 }}>
      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("ID")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {model?._id || t("N/A")}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Created at")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {formatDate(model?.created_at)}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Updated at")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {formatDate(model?.updated_at)}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Owner")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {model?.owner || t("N/A")}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Type")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {typeName}
        </Box>
      </Box>

      <Box sx={{ mb: 0.75, display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Category")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            wordBreak: "break-all",
          }}
        >
          {categoryName}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
        <Box
          sx={{
            fontSize: 11,
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[400]
                : theme.palette.text.secondary,
          }}
        >
          {t("Description")}:
        </Box>
        <Box
          sx={{
            fontSize: 12,
            userSelect: "text",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {model?.description || t("N/A")}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box style={{ ...style, display: "flex", alignItems: "center" }}>
      <Card
        key={model._id}
        variant="outlined"
        tabIndex={0}
        sx={{
          border:
            model._id === data.modelViewSelected?._id
              ? `1px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          boxShadow:
            model._id === data.modelViewSelected?._id
              ? "0 0 0 3px rgba(42, 149, 252, 0.2)"
              : "none",
          cursor: "pointer",
          borderRadius: 2,
          padding: "6px 10px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "&:hover": {
            borderColor: theme.palette.primary.main,
          },
          "&:focus": {
            borderColor: theme.palette.primary.main,
            boxShadow: "0 0 0 3px rgba(42, 149, 252, 0.2)",
          },
        }}
        onClick={handleOnClick}
        onDoubleClick={handleOnDoubleClick}
        onKeyDown={handleOnKeyDown}
      >
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography
            sx={{
              ...oneLineText,
              fontSize: "14px",
              fontWeight: 500,
              color: theme.palette.primary.light,
            }}
          >
            {model.name}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              visibility: "hidden",
              ".MuiCard-root:hover &": {
                visibility: "visible",
              },
            }}
          >
            <Tooltip title={detailTooltip}>
              <IconButton
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  color: theme.palette.success.main,
                  transition: "all 0.15s",
                  border: `1px solid ${theme.palette.success.main}33`,
                  "&:hover": {
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.common.white,
                    boxShadow: `0 0 4px ${theme.palette.success.main}80`,
                  },
                }}
              >
                <AiOutlineInfo size={16} />
              </IconButton>
            </Tooltip>
            {!selectOnly && (
              <>
                <Tooltip title={t("Export")}>
                  <IconButton
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      color: theme.palette.primary.main,
                      transition: "all 0.15s",
                      border: `1px solid ${theme.palette.primary.main}33`,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.common.white,
                        boxShadow: `0 0 4px ${theme.palette.primary.main}80`,
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      data.handelClickExport(model);
                    }}
                  >
                    <TfiExport size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={t("Delete")}>
                  <IconButton
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      color: theme.palette.error.main,
                      transition: "all 0.15s",
                      border: `1px solid ${theme.palette.error.main}33`,
                      "&:hover": {
                        backgroundColor: theme.palette.error.light,
                        color: theme.palette.common.white,
                        boxShadow: `0 0 4px ${theme.palette.error.main}80`,
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      data.handleClickDelete(model._id);
                    }}
                  >
                    <AiOutlineDelete size={16} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

const ModelListDialog: React.FC<ModelListDialogProps> = ({
  isOpen,
  onClose,
  setCurrentModel,
  selectOnly = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openConfirm, closeConfirm } = useAppContext();
  const [modelViewSelected, setModelViewSelected] =
    useState<Model>(defaultModel);

  const viewModelRef = useRef<HTMLDivElement>(null);
  const viewerModel = useRef<BpmnViewer | null>(null);
  const lastImportedRef = useRef<{ id?: string; configHash?: string }>({});

  const [isExportModelDialogOpen, setIsExportModelDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelConfigToExport, setModelConfigToExport] = useState("");

  const listRef = useRef<unknown>(null);

  const [searchText, setSearchText] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterReadOnly, setFilterReadOnly] = useState<
    "all" | "true" | "false"
  >("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [isUpdateModelDialogOpen, setIsUpdateModelDialogOpen] = useState(false);

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
      sortBy: "updated_at",
      orderBy: "desc",
    }),
    [
      rowsPerPage,
      page,
      searchText,
      filterOwner,
      filterCategory,
      filterType,
      filterReadOnly,
    ]
  );

  const { data: dataModels, refetch } = useEditableModelsQuery(params, isOpen);
  const { data: dataModelCategories } = useModelCategoriesQuery({}, isOpen);
  const { data: dataModelTypes } = useModelTypesQuery({}, isOpen);
  const models = dataModels?.items ?? [];
  const modelCategories = dataModelCategories?.items ?? [];
  const modelTypes = dataModelTypes?.items ?? [];
  const totalModels = dataModels?.total ?? 0;

  const updateModelMutation = useUpdateModel();
  const deleteModelMutation = useDeleteModel();

  const ensureModelConfig = useCallback(
    async (model: Model): Promise<Model | null> => {
      try {
        const xml = await loadModelData(model._id, true);

        const mergedModel: Model = {
          ...model,
          config: xml,
        };

        setModelViewSelected((prev) =>
          prev._id === model._id ? { ...prev, config: xml } : prev
        );

        return mergedModel;
      } catch (err) {
        console.error("Error loading model config:", err);
        showWarn(t("Failed to load model config"));
        return null;
      }
    },
    [t]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!viewerModel.current) return;
    if (!modelViewSelected?._id || !modelViewSelected.config) return;

    importModelXml(modelViewSelected._id, modelViewSelected.config);
  }, [isOpen, modelViewSelected?._id, modelViewSelected?.config]);

  useEffect(() => {
    setPage(0);
  }, [searchText, filterOwner, filterCategory, filterType, filterReadOnly]);

  const importModelXml = async (id: string, xml: string) => {
    if (!viewerModel.current) return;

    const configHash = `${xml.length}:${xml.slice(0, 64)}`;
    const { id: lastId, configHash: lastHash } = lastImportedRef.current;

    if (lastId === id && lastHash === configHash) return;

    try {
      const viewer = viewerModel.current;
      if (!viewer) throw new Error("BPMN viewer is not ready");
      if (!xml) throw new Error("XML is empty");

      const { warnings } = await viewer.importXML(xml);
      if (warnings?.length) {
        console.warn("BPMN import warnings:", warnings);
      }

      const canvas = viewer.get<CanvasWithAuto>("canvas");
      canvas.zoom("fit-viewport", "auto");

      const currentZoom = Number(canvas.zoom());
      const targetZoom = Math.max(0.2, currentZoom - 0.1);
      canvas.zoom(targetZoom);

      lastImportedRef.current = { id, configHash };
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("Error importing BPMN diagram:", e);
    }
  };

  const handleEntered = () => {
    if (!viewModelRef.current) return;

    viewerModel.current?.destroy();
    viewerModel.current = new BpmnViewer({
      container: viewModelRef.current,
      additionalModules: [
        MoveCanvasModule,
        ZoomScrollModule,
        {
          __init__: ["customRendererProvider"],
          customRendererProvider: ["type", CustomRenderer],
        },
      ],
    });

    lastImportedRef.current = {};

    if (modelViewSelected?._id && modelViewSelected.config) {
      importModelXml(modelViewSelected._id, modelViewSelected.config);
    }
  };

  const handleExited = () => {
    viewerModel.current?.destroy();
    viewerModel.current = null;
    lastImportedRef.current = {};
  };

  const handleClick = (model: Model) => {
    setModelViewSelected(model);
    void ensureModelConfig(model);
  };

  const handleDoubleClick = async (model: Model) => {
    const fullModel = await ensureModelConfig(model);
    if (!fullModel) return;

    setCurrentModel(fullModel);
    setModelViewSelected(fullModel);
    onClose();
  };

  const handleKeyDown = async (model: Model) => {
    const fullModel = await ensureModelConfig(model);
    if (!fullModel) return;

    setCurrentModel(fullModel);
    setModelViewSelected(fullModel);
    onClose();
  };

  async function handleClickSelect() {
    if (!modelViewSelected._id) {
      showWarn(t("No model selected"));
      return;
    }

    const fullModel = await ensureModelConfig(modelViewSelected);
    if (!fullModel) return;

    setCurrentModel(fullModel);
    onClose();
  }

  function handelClickExport(model?: Model) {
    const target = model ?? modelViewSelected;

    if (!target || !target._id) {
      showWarn(t("Model has not been selected"));
      return;
    }

    void (async () => {
      const fullModel = await ensureModelConfig(target);
      if (!fullModel?.config) {
        showWarn(t("Model config is empty"));
        return;
      }

      setModelConfigToExport(fullModel.config);
      setIsExportModelDialogOpen(true);
    })();
  }

  const handleClickDelete = useCallback(
    (id: string) => {
      openConfirm({
        title: t("Delete Model"),
        message: t("Are you sure you want to delete this model?"),
        onOk: () => {
          deleteModelMutation.mutate(
            { id },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteModelMutation, t, openConfirm, closeConfirm]
  );

  async function handleRefreshData() {
    refetch();
  }

  function handleRefreshFilter() {
    setSearchText("");
    setFilterOwner("all");
    setFilterCategory("all");
    setFilterType("all");
    setFilterReadOnly("all");
  }

  function handleClickUpdate() {
    if (modelViewSelected._id === "") {
      showWarn(t("Model has not been selected"));
      return;
    }

    setIsUpdateModelDialogOpen(true);
  }

  function handleUpdateModel(
    rename: string,
    typeId: string,
    categoryId: string
  ) {
    updateModelMutation.mutate({
      id: modelViewSelected._id,
      params: { rename, typeId, categoryId },
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
        TransitionProps={{
          onEntered: handleEntered,
          onExited: handleExited,
        }}
        keepMounted
      >
        <DialogTitle>
          <Typography>{t("Workflow model list")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", padding: 0, overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: 670,
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
                gap: 1,
                alignItems: "center",
              }}
            >
              <SelectUser
                label={t("Owner")}
                minWidth={150}
                userId={filterOwner}
                setUserId={setFilterOwner}
                isOpen={isOpen}
              />

              <SelectModelCategory
                label={t("Category")}
                minWidth={160}
                categoryId={filterCategory}
                setCategoryId={setFilterCategory}
                isOpen={isOpen}
              />

              <SelectModelType
                label={t("Type")}
                minWidth={160}
                typeId={filterType}
                setTypeId={setFilterType}
                isOpen={isOpen}
              />

              <CustomSelect
                label={t("Read only mode")}
                value={filterReadOnly}
                onChange={(e) =>
                  setFilterReadOnly(e.target.value as ReadOnlyFilter)
                }
                options={readOnlyOptions}
                minWidth={110}
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
              tooltip="Search workflow model"
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
              <Box ref={containerRef} sx={{ flex: 1, overflow: "hidden" }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      ref={listRef}
                      height={height}
                      width={width}
                      itemCount={models.length}
                      itemSize={52}
                      itemData={{
                        items: models,
                        categories: modelCategories,
                        types: modelTypes,
                        handleClick,
                        handleDoubleClick,
                        handleKeyDown,
                        handelClickExport,
                        handleClickDelete,
                        modelViewSelected,
                        selectOnly,
                      }}
                    >
                      {Item}
                    </List>
                  )}
                </AutoSizer>
              </Box>

              <CustomTablePagination
                count={totalModels}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>

          <Box
            ref={viewModelRef}
            sx={{
              flex: 1,
              position: "relative",
              backgroundColor: theme.palette.background.paper,
              backgroundImage: `radial-gradient(circle, ${theme.palette.divider} 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClickSelect} className="blue">
            {t("Select")}
          </Button>
          {!selectOnly && (
            <>
              <Button onClick={() => handelClickExport()} className="blue">
                {t("Export")}
              </Button>
              <Button onClick={handleClickUpdate} className="blue">
                {t("Update")}
              </Button>
              <Button
                onClick={() => handleClickDelete(modelViewSelected._id)}
                className="red"
                disabled={!modelViewSelected._id}
              >
                {t("Delete")}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ExportModelDialog
        isOpen={isExportModelDialogOpen}
        onClose={() => setIsExportModelDialogOpen(false)}
        modelXML={modelConfigToExport}
      />

      <UpdateModelDialog
        isOpen={isUpdateModelDialogOpen}
        onClose={() => setIsUpdateModelDialogOpen(false)}
        onOk={({ rename, type, category }) => {
          handleUpdateModel(rename, type, category);
        }}
        initialValue={modelViewSelected}
      />
    </>
  );
};

export default ModelListDialog;
