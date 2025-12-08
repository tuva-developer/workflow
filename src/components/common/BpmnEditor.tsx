import { useCallback, useEffect, useRef, useState } from "react";

import BpmnModeler from "bpmn-js/lib/Modeler";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { layoutProcess } from "bpmn-auto-layout";
import TranslateModule from "diagram-js/lib/i18n/translate";
import { is } from "bpmn-js/lib/util/ModelUtil";
import { Box, Menu, MenuItem, Tooltip, useTheme } from "@mui/material";
import CustomProviderModule from "@/bpmnProvider/index.js";
import customExtension from "@/bpmnProvider/descriptors/customExtension.json";
import { RiCalendarScheduleLine, RiFlowChart } from "react-icons/ri";
import { RxUpdate } from "react-icons/rx";
import { VscDebugStart } from "react-icons/vsc";
import { TfiExport, TfiImport, TfiSave } from "react-icons/tfi";
import { TbZoomOutArea } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { CgDebug } from "react-icons/cg";
import { GrFlows } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { FaStackOverflow } from "react-icons/fa";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import CustomTranslateProvider, {
  setLanguage,
} from "@/bpmnProvider/provider/CustomTranslate.js";
import ModelListDialog from "@/components/dialogs/ModelListDlg";
import InstanceListDialog from "@/components/dialogs/InstanceListDlg";
import CreateModelDialog from "@/components/dialogs/CreateModelDlg";
import ExportModelDialog from "@/components/dialogs/ExportModelDlg";
import ImportModelDialog from "@/components/dialogs/ImportModelDlg";
import AddScheduleDialog from "@/components/dialogs/AddScheduleDlg";
import RunModelDialog from "@/components/dialogs/RunModelDlg";
import DebugModelDialog from "@/components/dialogs/DebugModelDlg";
import { LuLayoutDashboard } from "react-icons/lu";
import { ToolbarButton, ToolbarButtonRed, Divider } from "@/styles/styles";
import { useUser } from "@/hooks/useUser";
import { useAppContext } from "@/hooks/useAppContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import BottomToolbar from "@/components/layout/BottomToolbar";
import CopyableModelName from "@/components/common/CopyableModelName";
import { defaultModel, defaultTemplate } from "@/utils/defines";
import { setReadonlyMode } from "@/global/appState";
import { loadTemplate } from "@/bpmnProvider/utils/defines";
import { showError, showSuccess, showWarn } from "@/utils/toastConfig";
import { loadModelData } from "@/services/models";
import {
  useDeleteModel,
  useUpdateModel,
} from "@/hooks/mutations/useModelMutations";
import { useNavigate } from "react-router-dom";
import { useTemplatesQuery } from "@/hooks/query/useTemplatesQuery";
import type { Element as BpmnJsElement } from "bpmn-js/lib/model/Types";
import type { ModdleElement } from "bpmn-moddle";
import type BpmnFactory from "bpmn-js/lib/features/modeling/BpmnFactory";
import type Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type { Event as BusEvent } from "diagram-js/lib/core/EventBus";
import type EventBus from "diagram-js/lib/core/EventBus";
import type ElementRegistry from "diagram-js/lib/core/ElementRegistry";

const defaultXml = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="true" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;

interface BpmnEditorProps {
  modelId?: string;
  isLimit?: boolean;
}

type ExtensionElements = ModdleElement & { values: ModdleElement[] };

type ConditionTypeEl = ModdleElement & {
  $type: "customExtension:ConditionType";
  value: string;
};

type ScriptFormatEl = ModdleElement & {
  $type: "customExtension:ScriptFormat";
  value: string;
};

type ScriptEl = ModdleElement & {
  $type: "customExtension:Script";
  value: string;
};

function isExt(el: ModdleElement | undefined): el is ExtensionElements {
  return (
    !!el &&
    typeof (el as unknown as { values?: unknown }).values !== "undefined" &&
    Array.isArray((el as unknown as { values?: unknown }).values)
  );
}

function findByType<T extends ModdleElement>(
  values: ModdleElement[] | undefined,
  type: T["$type"]
): T | undefined {
  return (values ?? []).find((v): v is T => v.$type === type);
}

function ensureExtensionElements(
  bo: ModdleElement & { extensionElements?: ExtensionElements },
  bpmnFactory: BpmnFactory
): ExtensionElements {
  if (!isExt(bo.extensionElements)) {
    bo.extensionElements = bpmnFactory.create("bpmn:ExtensionElements", {
      values: [],
    }) as ExtensionElements;
  }
  return bo.extensionElements;
}

type ElementChangedPayload = { element: BpmnJsElement };

function hasElementPayload(
  e: BusEvent | unknown
): e is BusEvent & ElementChangedPayload {
  return (
    !!e && typeof e === "object" && "element" in (e as Record<string, unknown>)
  );
}

export default function BpmnEditor({
  modelId,
  isLimit = false,
}: BpmnEditorProps) {
  const theme = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    templateSelected,
    recentModels,
    openConfirm,
    closeConfirm,
    addRecentModel,
    setTemplateSelected,
  } = useAppContext();

  const modelerContainerRef = useRef<HTMLDivElement | null>(null);
  const modeler = useRef<BpmnModeler | null>(null);
  const propertiesContainerRef = useRef<HTMLDivElement | null>(null);

  const lastRunTokenRef = useRef<symbol | null>(null);
  const lastImportedXmlRef = useRef<string | null>(null);
  const inFlightImportRef = useRef(false);
  const didInitialFitRef = useRef(false);

  const [isModelListDialogOpen, setIsModelListDialogOpen] = useState(false);
  const [isInstanceListDialogOpen, setIsInstanceListDialogOpen] =
    useState(false);
  const [isCreateModelDialogOpen, setIsCreateModelDialogOpen] = useState(false);
  const [isRunModelDialogOpen, setIsRunModelDialogOpen] = useState(false);
  const [isDebugModelDialogOpen, setIsDebugModelDialogOpen] = useState(false);
  const [isExportModelDialogOpen, setIsExportModelDialogOpen] = useState(false);
  const [isImportModelDialogOpen, setIsImportModelDialogOpen] = useState(false);
  const [isAddScheduleDialogOpen, setIsAddScheduleDialogOpen] = useState(false);

  const [currentModel, setCurrentModel] = useState<Model>(defaultModel);
  const [modelXML, setModelXML] = useState("");

  const { canView, canAdd, canEdit, canDelete, canExecute, canInvoke } =
    useUser();

  const [propertiesWidth, setPropertiesWidth] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpenRecentModels = Boolean(anchorEl);

  const updateModelMutation = useUpdateModel();
  const deleteModelMutation = useDeleteModel();
  const { refetch } = useTemplatesQuery(undefined, false);

  const getCanvas = useCallback((): CanvasWithAuto | undefined => {
    return modeler.current?.get<CanvasWithAuto>("canvas");
  }, []);

  const getEventBus = useCallback((): EventBus | undefined => {
    return modeler.current?.get<EventBus>("eventBus");
  }, []);

  const getElementRegistry = useCallback((): ElementRegistry | undefined => {
    return modeler.current?.get<ElementRegistry>("elementRegistry");
  }, []);

  const refreshBpmnUI = useCallback(() => {
    const eventBus = getEventBus();
    const elementRegistry = getElementRegistry();
    if (!eventBus || !elementRegistry) return;

    eventBus.fire("elements.changed", {
      elements: elementRegistry.getAll?.() ?? [],
    });
  }, [getEventBus, getElementRegistry]);

  const fitViewportMinus = useCallback(() => {
    const canvas = modeler.current?.get<CanvasWithAuto>("canvas");
    if (!canvas) return;
    canvas.zoom("fit-viewport", "auto");
    const z = canvas.zoom();
    if (typeof z === "number") canvas.zoom(z - 0.1, "auto");
  }, []);

  const handleUpdate = useCallback(async () => {
    if (currentModel._id === "") {
      showWarn(t("Model has not been saved"));
      return;
    }

    const m = modeler.current;
    if (!m) return;

    const { xml } = await m.saveXML({ format: true });
    updateModelMutation.mutate({ id: currentModel._id, params: {}, xml });
  }, [currentModel._id, t, updateModelMutation]);

  const handleKeyDownUpdateModel = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleUpdate();
      }
    },
    [handleUpdate]
  );

  function createNewModeler() {
    if (!modelerContainerRef.current) return;

    modeler.current = new BpmnModeler({
      container: modelerContainerRef.current,
      propertiesPanel: { parent: propertiesContainerRef.current },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CustomProviderModule,
        {
          translate: ["value", CustomTranslateProvider],
          modeler: ["value", modeler.current],
        },
        TranslateModule,
      ],
      moddleExtensions: { customExtension },
    });

    didInitialFitRef.current = false;
  }

  function isConditionalFlow(element: BpmnJsElement): boolean {
    const businessObject = element.businessObject as ModdleElement & {
      conditionExpression?: unknown;
    };
    return !!businessObject?.conditionExpression;
  }

  function setDefaultConditionalFlow(element: BpmnJsElement) {
    const bpmnFactory = modeler.current?.get<BpmnFactory>("bpmnFactory");
    const modeling = modeler.current?.get<Modeling>("modeling");
    if (!bpmnFactory || !modeling) return;

    const businessObject = element.businessObject as ModdleElement & {
      extensionElements?: ExtensionElements;
    };

    const ext = ensureExtensionElements(businessObject, bpmnFactory);

    let conditionType = findByType<ConditionTypeEl>(
      ext.values,
      "customExtension:ConditionType"
    );
    if (!conditionType) {
      conditionType = bpmnFactory.create("customExtension:ConditionType", {
        value: "Script",
      }) as ConditionTypeEl;
      ext.values.push(conditionType);
    } else {
      modeling.updateProperties(element, { extensionElements: ext });
      return;
    }

    let scriptFormat = findByType<ScriptFormatEl>(
      ext.values,
      "customExtension:ScriptFormat"
    );
    if (!scriptFormat) {
      scriptFormat = bpmnFactory.create("customExtension:ScriptFormat", {
        value: "JavaScript",
      }) as ScriptFormatEl;
      ext.values.push(scriptFormat);
    } else {
      scriptFormat.value = "JavaScript";
    }

    let script = findByType<ScriptEl>(ext.values, "customExtension:Script");
    if (!script) {
      script = bpmnFactory.create("customExtension:Script", {
        value: "activity.setOutput(false);",
      }) as ScriptEl;
      ext.values.push(script);
    } else {
      script.value = "activity.setOutput(false);";
    }

    modeling.updateProperties(element, { extensionElements: ext });
  }

  function setDefaultScripTask(element: BpmnJsElement) {
    const bpmnFactory = modeler.current?.get<BpmnFactory>("bpmnFactory");
    const modeling = modeler.current?.get<Modeling>("modeling");
    if (!bpmnFactory || !modeling) return;

    const businessObject = element.businessObject as ModdleElement & {
      extensionElements?: ExtensionElements;
    };

    const ext = ensureExtensionElements(businessObject, bpmnFactory);

    let scriptFormat = findByType<ScriptFormatEl>(
      ext.values,
      "customExtension:ScriptFormat"
    );
    if (!scriptFormat) {
      scriptFormat = bpmnFactory.create("customExtension:ScriptFormat", {
        value: "JavaScript",
      }) as ScriptFormatEl;
      ext.values.push(scriptFormat);
    } else {
      modeling.updateProperties(element, { extensionElements: ext });
      return;
    }

    let script = findByType<ScriptEl>(ext.values, "customExtension:Script");
    if (!script) {
      script = bpmnFactory.create("customExtension:Script", {
        value: "let input = activity.getInput();",
      }) as ScriptEl;
      ext.values.push(script);
    } else {
      script.value = "let input = activity.getInput();";
    }

    modeling.updateProperties(element, { extensionElements: ext });
  }

  useEffect(() => {
    if (!modelerContainerRef.current) return;

    createNewModeler();
    const m = modeler.current;
    if (!m) return;

    (async () => {
      try {
        await m.importXML(defaultXml);
        fitViewportMinus();
        didInitialFitRef.current = true;
      } catch (err) {
        console.error("Error importing BPMN diagram:", err);
      }
    })();

    const eventBus = getEventBus();
    if (!eventBus) return;

    let isProcessing = false;

    const onElementChanged = (event: BusEvent) => {
      if (!hasElementPayload(event) || isProcessing) return;

      const { element } = event;

      if (is(element, "bpmn:SequenceFlow")) {
        isProcessing = true;
        try {
          if (isConditionalFlow(element)) {
            setDefaultConditionalFlow(element);
          }
        } finally {
          isProcessing = false;
        }
        return;
      }

      if (is(element, "bpmn:ScriptTask")) {
        isProcessing = true;
        try {
          setDefaultScripTask(element);
        } finally {
          isProcessing = false;
        }
      }
    };

    const onTemplateCreated = async () => {
      refetch();
    };

    const onRootSet = async () => {
      const canvas = getCanvas();
      const rootElement = canvas?.getRootElement?.();
      if (rootElement?.type === "bpmn:SubProcess") {
        fitViewportMinus();
      }
    };

    eventBus.on("element.changed", onElementChanged);
    eventBus.on("template.created", onTemplateCreated);
    eventBus.on("root.set", onRootSet);

    eventBus.fire("updateModeler", { modeler: m });

    refreshBpmnUI();

    return () => {
      try {
        eventBus.off("element.changed", onElementChanged);
        eventBus.off("template.created", onTemplateCreated);
        eventBus.off("root.set", onRootSet);
      } catch (err) {
        console.error("Error:", err);
      }
      try {
        modeler.current?.destroy();
      } finally {
        modeler.current = null;
        didInitialFitRef.current = false;
      }
    };
  }, [fitViewportMinus, getCanvas, getEventBus, refetch, refreshBpmnUI]);

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  useEffect(() => {
    if (!modelId) return;

    async function fetchModel() {
      try {
        const result = await loadModelData(modelId || "");
        setCurrentModel(result);
      } catch {
        sessionStorage.setItem("message_type", "model_not_found");
        navigate("/message_error", { replace: true });
      }
    }

    fetchModel();
  }, [modelId, navigate]);

  useEffect(() => {
    if (modeler.current) {
      setLanguage(language);
      const eventBus = getEventBus();
      eventBus?.fire("changeLanguage");
      refreshBpmnUI();
    }
  }, [language, refreshBpmnUI, getEventBus]);

  useEffect(() => {
    refreshBpmnUI();
  }, [theme, refreshBpmnUI]);

  useEffect(() => {
    const el = propertiesContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setPropertiesWidth(el.offsetWidth);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [propertiesContainerRef]);

  useEffect(() => {
    if (!templateSelected || !templateSelected._id || !modeler.current) return;

    async function load() {
      const result = await loadTemplate(templateSelected, modeler.current!);
      if (result.success) {
        showSuccess(t("Import template successfully"));
      } else {
        showWarn(t("Import template failed"));
      }
    }

    load();

    return () => {
      setTemplateSelected(defaultTemplate);
    };
  }, [templateSelected, t, setTemplateSelected]);

  useEffect(() => {
    if (!modeler.current) return;
    if (!currentModel._id || !currentModel.config) return;

    if (lastImportedXmlRef.current === currentModel.config) return;
    if (inFlightImportRef.current) return;

    const token = Symbol();
    lastRunTokenRef.current = token;
    inFlightImportRef.current = true;

    (async () => {
      try {
        await modeler.current!.importXML(currentModel.config);
        if (lastRunTokenRef.current !== token) return;

        lastImportedXmlRef.current = currentModel.config;

        fitViewportMinus();
        didInitialFitRef.current = true;
      } catch (err) {
        console.error("Error importing BPMN diagram:", err);
      } finally {
        inFlightImportRef.current = false;
      }
    })();
  }, [currentModel._id, currentModel.config, fitViewportMinus]);

  useEffect(() => {
    if (!modeler.current || !currentModel._id) return;

    setReadonlyMode(currentModel.read_only);

    const eventBus = getEventBus();
    eventBus?.fire("updatePalete");
  }, [currentModel._id, currentModel.read_only, getEventBus]);

  useEffect(() => {
    const editorElement = modelerContainerRef.current;
    if (!editorElement) return;

    editorElement.addEventListener("keydown", handleKeyDownUpdateModel);
    return () => {
      editorElement.removeEventListener("keydown", handleKeyDownUpdateModel);
    };
  }, [handleKeyDownUpdateModel]);

  useEffect(() => {
    const eventBus = getEventBus();
    if (!eventBus) return;

    eventBus.on("updateModel", handleUpdate);
    return () => {
      eventBus.off("updateModel", handleUpdate);
    };
  }, [getEventBus, handleUpdate]);

  useEffect(() => {
    if (currentModel._id === "") return;

    addRecentModel({ id: currentModel._id, name: currentModel.name });
  }, [currentModel._id, currentModel.name, addRecentModel]);

  function handleModelList() {
    setIsModelListDialogOpen(true);
  }

  async function handleInstanceList() {
    if (currentModel._id === "") {
      showWarn(t("Model has not been saved"));
      return;
    }
    setIsInstanceListDialogOpen(true);
  }

  const handleNewModelOk = useCallback(async () => {
    const m = modeler.current;
    if (!m) return;

    try {
      await m.importXML(defaultXml);
      fitViewportMinus();
      didInitialFitRef.current = true;
    } catch (error) {
      console.error("Error importing BPMN diagram:", error);
    }

    const eventBus = m.get<EventBus>("eventBus");
    eventBus?.fire("updateModeler", { modeler: m });

    setCurrentModel(defaultModel);
    closeConfirm();
  }, [fitViewportMinus, closeConfirm, setCurrentModel]);

  function handleNew() {
    openConfirm({
      title: t("Create New Model"),
      message: t(
        "Are you sure you want to create a new model? Any unsaved changes to the current model will be lost."
      ),
      onOk: handleNewModelOk,
    });
  }

  async function handleCreate() {
    const { xml } = await modeler.current!.saveXML({ format: true });
    setModelXML(xml || "");
    setIsCreateModelDialogOpen(true);
  }

  async function handleRun() {
    if (currentModel._id === "") {
      showWarn(t("Model has not been saved"));
      return;
    }
    setIsRunModelDialogOpen(true);
  }

  async function handleExport() {
    const { xml } = await modeler.current!.saveXML({ format: true });
    setModelXML(xml || "");
    setIsExportModelDialogOpen(true);
  }

  const handleImport = async (xml: string) => {
    try {
      await modeler.current!.importXML(xml);
      fitViewportMinus();
      didInitialFitRef.current = true;
    } catch (error) {
      console.error("Error importing model:", error);
      showError(t("Import file failed"));
    }
  };

  const handleDelete = useCallback(
    (id: string) => {
      openConfirm({
        title: t("Delete Model"),
        message: t("Are you sure you want to delete this model?"),
        onOk: () => {
          deleteModelMutation.mutate(
            { id },
            {
              onSettled: () => {
                handleNewModelOk();
              },
            }
          );
        },
      });
    },
    [deleteModelMutation, t, openConfirm, handleNewModelOk]
  );

  async function handleAddSchedule() {
    if (currentModel._id === "") {
      showWarn(t("Model has not been saved"));
      return;
    }
    setIsAddScheduleDialogOpen(true);
  }

  async function handleDebug() {
    if (currentModel._id === "") {
      showWarn(t("Model has not been saved"));
      return;
    }
    setIsDebugModelDialogOpen(true);
  }

  async function handleAutoLayout() {
    const { xml } = await modeler.current!.saveXML({ format: true });
    const newXml = await layoutProcess(xml);

    if (currentModel._id !== "") {
      setCurrentModel((prevModel) => ({
        ...prevModel,
        config: newXml,
      }));
    } else {
      if (!modeler.current) return;
      await modeler.current.importXML(newXml);
      fitViewportMinus();
      didInitialFitRef.current = true;
    }
  }

  const handleClickOpenRecentModels = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseRecentModels = () => {
    setAnchorEl(null);
  };
  const handleLoadRecentModel = async (id: string) => {
    const result = await loadModelData(id);
    if (result) setCurrentModel(result);
    else showWarn(t("Load recent model failed"));
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          backgroundImage: `radial-gradient(circle, ${theme.palette.divider} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          position: "relative",
        }}
      >
        <Box
          ref={modelerContainerRef}
          sx={{ height: "calc(100% - 50px)", width: "100%" }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "150px",
            top: "10px",
            zIndex: "10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            "& button": { fontSize: "20px" },
          }}
        >
          {canView() && !isLimit && (
            <Tooltip title={t("Workflow model list")} arrow>
              <ToolbarButton
                onClick={handleModelList}
                onMouseDown={(e) => e.preventDefault()}
              >
                <RiFlowChart />
              </ToolbarButton>
            </Tooltip>
          )}

          {canView() && !isLimit && (
            <>
              <Tooltip title={t("Open recent model")} arrow>
                <ToolbarButton
                  onClick={handleClickOpenRecentModels}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <FaStackOverflow />
                </ToolbarButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={isOpenRecentModels}
                onClose={handleCloseRecentModels}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                {recentModels.length === 0 ? (
                  <MenuItem disabled sx={{ fontSize: 13 }}>
                    {t("No recent models")}
                  </MenuItem>
                ) : (
                  recentModels.map((m) => (
                    <MenuItem
                      key={m.id}
                      onClick={() => {
                        handleCloseRecentModels();
                        handleLoadRecentModel(m.id);
                      }}
                      sx={{ fontSize: 13 }}
                    >
                      {m.name}
                    </MenuItem>
                  ))
                )}
              </Menu>
            </>
          )}

          {canView() && (
            <Tooltip title={t("Workflow instance list")} arrow>
              <ToolbarButton
                onClick={handleInstanceList}
                onMouseDown={(e) => e.preventDefault()}
              >
                <GrFlows />
              </ToolbarButton>
            </Tooltip>
          )}

          <Divider />

          {canAdd() && !isLimit && (
            <Tooltip title={t("Create new workflow model")} arrow>
              <ToolbarButton
                onClick={handleNew}
                onMouseDown={(e) => e.preventDefault()}
              >
                <IoMdAdd />
              </ToolbarButton>
            </Tooltip>
          )}

          {canEdit() && !isLimit && (
            <Tooltip title={t("Save workflow model")} arrow>
              <ToolbarButton
                onClick={handleCreate}
                onMouseDown={(e) => e.preventDefault()}
              >
                <TfiSave />
              </ToolbarButton>
            </Tooltip>
          )}

          {canEdit() && (
            <Tooltip title={t("Update workflow model")} arrow>
              <ToolbarButton
                onClick={handleUpdate}
                onMouseDown={(e) => e.preventDefault()}
              >
                <RxUpdate />
              </ToolbarButton>
            </Tooltip>
          )}

          {canExecute() && (
            <Tooltip title={t("Execute workflow model")} arrow>
              <ToolbarButton
                onClick={handleRun}
                onMouseDown={(e) => e.preventDefault()}
              >
                <VscDebugStart />
              </ToolbarButton>
            </Tooltip>
          )}

          {canInvoke() && (
            <Tooltip title={t("Schedule")} arrow>
              <ToolbarButton
                onClick={handleAddSchedule}
                onMouseDown={(e) => e.preventDefault()}
              >
                <RiCalendarScheduleLine />
              </ToolbarButton>
            </Tooltip>
          )}

          {canView() && (
            <Tooltip title={t("Debug workflow model")} arrow>
              <ToolbarButton
                onClick={handleDebug}
                onMouseDown={(e) => e.preventDefault()}
              >
                <CgDebug />
              </ToolbarButton>
            </Tooltip>
          )}

          {canView() && (
            <Tooltip title={t("Export workflow model")} arrow>
              <ToolbarButton
                onClick={handleExport}
                onMouseDown={(e) => e.preventDefault()}
              >
                <TfiExport />
              </ToolbarButton>
            </Tooltip>
          )}

          {canAdd() && (
            <Tooltip title={t("Import workflow model")} arrow>
              <ToolbarButton
                onClick={() => setIsImportModelDialogOpen(true)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <TfiImport />
              </ToolbarButton>
            </Tooltip>
          )}

          {canDelete() && !isLimit && (
            <Tooltip title={t("Delete workflow model")} arrow>
              <ToolbarButtonRed
                onClick={() => {
                  handleDelete(currentModel._id);
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <AiOutlineDelete />
              </ToolbarButtonRed>
            </Tooltip>
          )}

          <Divider />

          <Tooltip title={t("Zoom fit")} arrow>
            <ToolbarButton
              onClick={fitViewportMinus}
              onMouseDown={(e) => e.preventDefault()}
            >
              <TbZoomOutArea />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title={t("Auto layout")} arrow>
            <ToolbarButton
              onClick={handleAutoLayout}
              onMouseDown={(e) => e.preventDefault()}
            >
              <LuLayoutDashboard />
            </ToolbarButton>
          </Tooltip>

          {!isLimit && <CopyableModelName model={currentModel} />}
        </Box>

        <Box ref={propertiesContainerRef} />

        <BottomToolbar sx={{ width: `calc(100% - ${propertiesWidth}px)` }} />
      </Box>

      <CreateModelDialog
        isOpen={isCreateModelDialogOpen}
        onClose={() => setIsCreateModelDialogOpen(false)}
        setCurrentModel={setCurrentModel}
        modelXML={modelXML}
      />

      <RunModelDialog
        isOpen={isRunModelDialogOpen}
        onClose={() => setIsRunModelDialogOpen(false)}
        modelId={currentModel._id}
      />

      <DebugModelDialog
        isOpen={isDebugModelDialogOpen}
        onClose={() => setIsDebugModelDialogOpen(false)}
        modelId={currentModel._id}
      />

      <ExportModelDialog
        isOpen={isExportModelDialogOpen}
        onClose={() => setIsExportModelDialogOpen(false)}
        modelXML={modelXML}
        modelName={currentModel.name}
      />

      <ImportModelDialog
        isOpen={isImportModelDialogOpen}
        onClose={() => setIsImportModelDialogOpen(false)}
        onImport={handleImport}
      />

      <AddScheduleDialog
        isOpen={isAddScheduleDialogOpen}
        onClose={() => setIsAddScheduleDialogOpen(false)}
        modelId={currentModel._id}
      />

      <ModelListDialog
        isOpen={isModelListDialogOpen}
        onClose={() => setIsModelListDialogOpen(false)}
        setCurrentModel={setCurrentModel}
      />

      <InstanceListDialog
        isOpen={isInstanceListDialogOpen}
        onClose={() => setIsInstanceListDialogOpen(false)}
        modelId={currentModel._id}
      />
    </>
  );
}
