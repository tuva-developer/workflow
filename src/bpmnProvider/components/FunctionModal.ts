import { html } from "htm/preact";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getReadonlyMode, getTheme } from "@/global/appState";
import { readFunctionsFromCollaboration } from "@/bpmnProvider/utils/defines";
import {
  addGlobalCompleter,
  setFunctionSuggestions,
} from "@/bpmnProvider/utils/suggestionHub";
import { showError, showSuccess, showWarn } from "@/utils/toastConfig";

import ace from "ace-builds/src-noconflict/ace";
ace.config.set("basePath", "/node_modules/ace-builds/src-noconflict");
ace.config.setModuleUrl(
  "ace/mode/javascript_worker",
  `${import.meta.env.BASE_URL}ace/worker-javascript.js`
);
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/worker-javascript";
import "ace-builds/src-noconflict/ext-beautify";

import {
  loadFunctions,
  addFunction,
  deleteFunction,
} from "@/services/functions";
import type { RemoteFunction } from "@/services/types";
import { ConfirmDialog } from "@/bpmnProvider/components/ConfirmDialog";

const BPMN_EXTENSION_ELEMENTS = "bpmn:ExtensionElements";
const NS_FUNCTION_LIBRARY = "customExtension:FunctionLibrary";
const NS_FUNCTION = "customExtension:Function";

type FnItem = {
  id: string;
  caption?: string;
  value?: string;
  code?: string;
};

type ConfirmState = {
  open: boolean;
  message: string;
  onConfirm: () => void | Promise<void>;
};

export function FunctionModal(props: {
  element;
  injector;
  onClose: () => void;
}) {
  const { element, injector, onClose } = props;

  const bpmnFactory = injector.get("bpmnFactory");
  const commandStack = injector.get("commandStack");
  const eventBus = injector.get("eventBus");
  const translate = useService("translate");

  const readOnly = getReadonlyMode();
  const theme = getTheme();

  const title = translate("Function library");
  const hintText = translate("Add reusable JS function(s)");

  const [items, setItems] = useState<FnItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [editing, setEditing] = useState<FnItem | null>(null);
  const [caption, setCaption] = useState("");
  const [value, setValue] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [remoteFns, setRemoteFns] = useState<RemoteFunction[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [savingToMyFunc, setSavingToMyFunc] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const aceEditor = useRef<ReturnType<typeof ace.edit> | null>(null);
  const codeRef = useRef<string>("");

  const getCollaborationBO = useCallback(() => {
    let root = element;
    while (root?.parent) root = root.parent;
    const bo = root?.businessObject;
    if (!bo || bo.$type !== "bpmn:Collaboration") {
      console.warn(
        "[FunctionModal] FunctionLibrary is only supported on bpmn:Collaboration"
      );
      return null;
    }
    return bo;
  }, [element]);

  const ensureExtensionElementsOnCollab = useCallback(() => {
    const collab = getCollaborationBO();
    if (!collab) return null;

    let ext = collab.extensionElements;
    if (!ext) {
      ext = bpmnFactory.create(BPMN_EXTENSION_ELEMENTS, { values: [] });
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: collab,
        properties: { extensionElements: ext },
      });
    }
    if (!Array.isArray(ext.values)) {
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: ext,
        properties: { values: [] },
      });
    }
    return ext;
  }, [bpmnFactory, commandStack, element, getCollaborationBO]);

  const getOrCreateFunctionLibrary = useCallback(() => {
    const ext = ensureExtensionElementsOnCollab();
    if (!ext) return null;

    const values = ext.values || [];
    let lib = values.find((v) => v?.$type === NS_FUNCTION_LIBRARY);

    if (!lib) {
      lib = bpmnFactory.create(NS_FUNCTION_LIBRARY, { functions: [] });
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: ext,
        properties: { values: [...values, lib] },
      });
    }

    if (!Array.isArray(lib.functions)) {
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: lib,
        properties: { functions: [] },
      });
    }

    return lib;
  }, [bpmnFactory, commandStack, element, ensureExtensionElementsOnCollab]);

  const getLibAndFns = useCallback(() => {
    const lib = getOrCreateFunctionLibrary();
    const fns = Array.isArray(lib?.functions) ? lib!.functions : [];
    return { lib, fns };
  }, [getOrCreateFunctionLibrary]);

  const addFunctionToModel = useCallback(
    (payload: { caption: string; value: string; code: string }) => {
      const { lib, fns } = getLibAndFns();
      if (!lib) return null;
      const newFn = bpmnFactory.create(NS_FUNCTION, {
        id: rid(),
        ...payload,
      });
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: lib,
        properties: { functions: [...fns, newFn] },
      });
      return newFn;
    },
    [bpmnFactory, commandStack, element, getLibAndFns]
  );

  const editFunction = useCallback(
    (id: string, payload: { caption: string; value: string; code: string }) => {
      const { fns } = getLibAndFns();
      const target = fns.find((fn) => fn.id === id);
      if (!target) return;
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: target,
        properties: payload,
      });
    },
    [commandStack, element, getLibAndFns]
  );

  const removeFunctionFromModel = useCallback(
    (id: string) => {
      const { lib, fns } = getLibAndFns();
      if (!lib) return;
      const next = fns.filter((fn) => fn.id !== id);
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: lib,
        properties: { functions: next },
      });
    },
    [commandStack, element, getLibAndFns]
  );

  const refresh = useCallback(() => {
    const list = readFunctionsFromCollaboration(element) as FnItem[];
    setItems(list);
  }, [element]);

  useEffect(() => {
    refresh();
  }, [element?.id, refresh]);

  const filtered = useMemo(() => {
    const q = (searchText || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.caption || ""} ${it.value || ""}`.toLowerCase().includes(q)
    );
  }, [items, searchText]);

  const broadcastSuggestions = useCallback(() => {
    const list = readFunctionsFromCollaboration(element);
    setFunctionSuggestions(list);
    eventBus.fire("ms.functions.updated", { list });
  }, [element, eventBus]);

  const onAddNew = () => {
    setEditing(null);
    setCaption("");
    setValue("");
    setIsEdit(false);
    codeRef.current = "";
    aceEditor.current?.setValue("", -1);
  };

  const onEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setEditing(item);
    setCaption(item.caption || "");
    setValue(item.value || "");
    setIsEdit(true);
    codeRef.current = item.code || "";
    aceEditor.current?.setValue(codeRef.current, -1);
  };

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void | Promise<void>) => {
      setConfirmState({
        open: true,
        message,
        onConfirm,
      });
    },
    []
  );

  const handleConfirmOk = useCallback(() => {
    if (!confirmState) return;
    const { onConfirm } = confirmState;
    setConfirmState(null);
    void onConfirm();
  }, [confirmState]);

  const handleConfirmCancel = useCallback(() => {
    setConfirmState(null);
  }, []);

  const onDelete = useCallback(
    (id: string) => {
      if (readOnly) return;
      showConfirm(
        translate("Are you sure you want to remove this function?"),
        () => {
          removeFunctionFromModel(id);
          refresh();
          broadcastSuggestions();
        }
      );
    },
    [
      readOnly,
      showConfirm,
      translate,
      removeFunctionFromModel,
      refresh,
      broadcastSuggestions,
    ]
  );

  const onSave = () => {
    if (readOnly) return;
    if (!caption.trim() || !value.trim()) {
      showWarn(translate("Caption and Value are required."));
      return;
    }
    const currentCode = aceEditor.current
      ? aceEditor.current.getValue()
      : codeRef.current;

    if (editing) {
      editFunction(editing.id, {
        caption,
        value,
        code: currentCode,
      });
    } else {
      addFunctionToModel({
        caption,
        value,
        code: currentCode,
      });
    }

    refresh();
    broadcastSuggestions();

    setEditing(null);
    setCaption("");
    setValue("");
    codeRef.current = "";
    aceEditor.current?.setValue("", -1);
  };

  useEffect(() => {
    if (!editorRef.current || aceEditor.current) return;

    addGlobalCompleter(ace);

    const editor = ace.edit(editorRef.current);
    aceEditor.current = editor;

    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      showPrintMargin: false,
    });

    const beautify = ace.require("ace/ext/beautify");
    editor.commands.addCommand({
      name: "beautify",
      bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
      exec: (ed) => beautify.beautify(ed.session),
    });

    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWorker(true);
    editor.setReadOnly(readOnly);

    editor.setValue(codeRef.current || "", -1);

    const onChange = () => {
      codeRef.current = editor.getValue();
    };
    editor.on("change", onChange);

    try {
      const list = readFunctionsFromCollaboration(element);
      setFunctionSuggestions(list);
    } catch (e) {
      console.error("Error:", e);
    }

    return () => {
      editor.off("change", onChange);
      editor.destroy();
      aceEditor.current = null;
    };
  }, [readOnly, element]);

  useEffect(() => {
    if (!aceEditor.current) return;
    aceEditor.current.setTheme(
      theme === "light" ? "ace/theme/chrome" : "ace/theme/monokai"
    );
  }, [theme]);

  const fetchRemoteFunctions = useCallback(async () => {
    try {
      setLoadingRemote(true);
      const res = await loadFunctions();
      setRemoteFns(res.items);
    } catch (err) {
      console.error("fetchRemoteFunctions error:", err);
      showWarn(translate("Cannot load My functions."));
    } finally {
      setLoadingRemote(false);
    }
  }, [translate]);

  useEffect(() => {
    fetchRemoteFunctions();
  }, [fetchRemoteFunctions]);

  const onSaveToMyfunctions = useCallback(async () => {
    if (readOnly) return;

    const trimmedCaption = caption.trim();
    const trimmedValue = value.trim();

    if (!trimmedCaption || !trimmedValue) {
      showWarn(
        translate(
          "Caption and Value are required before saving to My functions."
        )
      );
      return;
    }

    const currentCode = aceEditor.current
      ? aceEditor.current.getValue()
      : codeRef.current || "";

    if (!currentCode.trim()) {
      showWarn(translate("Script is empty."));
      return;
    }

    try {
      setSavingToMyFunc(true);

      const name = trimmedValue || trimmedCaption;
      const description = trimmedCaption || trimmedValue;

      await addFunction({
        name,
        description,
        public: false,
        script: currentCode,
      });

      await fetchRemoteFunctions();
      showSuccess(translate("Saved function to My functions successfully."));
    } catch (err) {
      console.error("onSaveToDb error:", err);
      showError(translate("Failed to save function to My functions."));
    } finally {
      setSavingToMyFunc(false);
    }
  }, [readOnly, caption, value, translate, fetchRemoteFunctions]);

  const onImportFromRemote = useCallback(
    (remote: RemoteFunction) => {
      if (readOnly) return;

      const exists = items.some(
        (it) => it.value === remote.name || it.caption === remote.name
      );
      if (exists) {
        showWarn(translate("Function already exists in model list."));
        return;
      }

      addFunctionToModel({
        caption: remote.description || remote.name,
        value: remote.name,
        code: remote.script,
      });

      refresh();
      broadcastSuggestions();
    },
    [
      readOnly,
      items,
      addFunctionToModel,
      refresh,
      broadcastSuggestions,
      translate,
    ]
  );

  const onDeleteRemote = useCallback(
    (remote: RemoteFunction) => {
      if (readOnly) return;

      showConfirm(
        translate(
          "Are you sure you want to delete this function from My functions?"
        ),
        async () => {
          try {
            await deleteFunction(remote._id);
            await fetchRemoteFunctions();
            showSuccess(translate("Deleted function from My functions."));
          } catch (err) {
            console.error("onDeleteRemote error:", err);
            showError(
              translate("Failed to delete function from My functions.")
            );
          }
        }
      );
    },
    [readOnly, showConfirm, fetchRemoteFunctions, translate]
  );

  const stop = (e: Event) => e.stopPropagation();

  const IconButton = ({
    icon,
    color,
    title,
    disabled,
    onClick,
  }: {
    icon: string;
    color?: string;
    title: string;
    disabled?: boolean;
    onClick: () => void;
  }) =>
    html`
      <button
        type="button"
        title=${title}
        disabled=${!!disabled}
        onClick=${onClick}
        style=${{
          ...iconBtnStyle,
          ...(disabled ? iconBtnDisabled : {}),
          color,
        }}
      >
        <i class=${icon}></i>
      </button>
    `;

  return html`
    <div style=${backdropStyle} onClick=${onClose}></div>

    <div style=${modalStyle} role="dialog" aria-modal="true" onClick=${stop}>
      <div style=${modalHeaderStyle}>
        <div style=${modalTitleStyle}>${title}</div>
        <button
          type="button"
          class="close-btn"
          style=${closeBtnStyle}
          onClick=${onClose}
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div style=${hintStyle}>${hintText}</div>

      <div style=${contentWrapStyle}>
        <div style=${remotePaneStyle}>
          <div style=${remoteHeaderStyle}>
            <div style=${remoteTitleStyle}>${translate("My functions")}</div>
          </div>

          <div style=${listWrapStyle}>
            ${loadingRemote &&
            html`<div style=${nodataStyle}>${translate("Loading...")}</div>`}
            ${!loadingRemote &&
            remoteFns.length === 0 &&
            html`<div style=${nodataStyle}>${translate("No data")}</div>`}
            ${!loadingRemote &&
            remoteFns.map((rf) => {
              return html`
                <div
                  key=${rf._id}
                  style=${listItemStyle(false)}
                  title=${rf.name}
                >
                  <div style=${listItemTextWrap}>
                    <div style=${listItemCaption}>${rf.name}</div>
                    <div style=${listItemValue}>${rf.description || ""}</div>
                  </div>
                  <div style=${listItemActions}>
                    ${IconButton({
                      icon: "ri-contract-right-fill",
                      color: "var(--primary-main)",
                      title: translate("Use in model"),
                      disabled: readOnly,
                      onClick: () => onImportFromRemote(rf),
                    })}
                    ${IconButton({
                      icon: "ri-delete-bin-6-line",
                      color: "var(--error-main)",
                      title: translate("Delete"),
                      disabled: readOnly,
                      onClick: () => onDeleteRemote(rf),
                    })}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>

        <div style=${midPaneStyle}>
          <div style=${remoteHeaderStyle}>
            <div style=${remoteTitleStyle}>${translate("Model functions")}</div>
          </div>

          <div style=${midSearchWrapStyle}>
            <input
              type="text"
              placeholder=${translate("Search by caption/value") + "..."}
              value=${searchText}
              onInput=${(e) =>
                setSearchText((e.target as HTMLInputElement).value)}
              style=${midSearchInputStyle}
            />
          </div>

          <div style=${listWrapStyle}>
            ${filtered.length === 0 &&
            html` <div style=${nodataStyle}>${translate("No data")}</div> `}
            ${filtered.map((it) => {
              const isActive = editing?.id === it.id;
              return html`
                <div
                  key=${it.id}
                  style=${listItemStyle(isActive)}
                  title=${it.value || ""}
                >
                  <div style=${listItemTextWrap}>
                    <div style=${listItemCaption}>${it.caption || ""}</div>
                    <div style=${listItemValue}>
                      <code style=${codeBadge}>${it.value || ""}</code>
                    </div>
                  </div>
                  <div style=${listItemActions}>
                    ${IconButton({
                      icon: "ri-edit-line",
                      color: "var(--primary-main)",
                      title: translate("Edit function"),
                      onClick: () => onEdit(it.id),
                    })}
                    ${IconButton({
                      icon: "ri-eraser-line",
                      color: "#FF6D1F",
                      title: translate("Remove function"),
                      disabled: readOnly,
                      onClick: () => onDelete(it.id),
                    })}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>

        <div style=${rightPaneStyle}>
          <div id="ms-form" style=${formStyle}>
            <div style=${actionsRowStyle}>
              <button
                type="button"
                onClick=${onAddNew}
                title=${translate("New function")}
                style=${{
                  ...actionBtnStyle,
                  backgroundColor: "var(--primary-main)",
                }}
                disabled=${readOnly}
              >
                <i class="ri-add-line"></i>
              </button>

              <button
                type="button"
                onClick=${onSaveToMyfunctions}
                title=${translate("Save to My functions")}
                style=${{
                  ...actionBtnStyle,
                  backgroundColor: "var(--primary-main)",
                  opacity: savingToMyFunc ? 0.7 : 1,
                }}
                disabled=${readOnly || savingToMyFunc}
              >
                <i class="ri-upload-cloud-line"></i>
              </button>

              <button
                type="button"
                onClick=${onSave}
                title=${isEdit
                  ? translate("Update function")
                  : translate("Save function to model")}
                style=${{
                  ...actionBtnStyle,
                  backgroundColor: "var(--primary-main)",
                }}
                disabled=${readOnly}
              >
                <i class="ri-save-3-line"></i>
              </button>
            </div>

            <div style=${rowGrid}>
              <label>${translate("Caption")}</label>
              <input
                value=${caption}
                onInput=${(e) =>
                  setCaption((e.target as HTMLInputElement).value)}
                placeholder=${translate("e.g. sum(a,b)")}
                style=${inputStyle}
                disabled=${readOnly}
              />
            </div>

            <div style=${rowGrid}>
              <label>${translate("Value")}</label>
              <input
                value=${value}
                onInput=${(e) => setValue((e.target as HTMLInputElement).value)}
                placeholder="sum(a,b)"
                style=${inputStyle}
                disabled=${readOnly}
              />
            </div>

            <div style=${editorRowStyle}>
              <label style=${editorLabelStyle}>Script (JS)</label>
              <div style=${editorContainerStyle}>
                <div ref=${editorRef} style=${editorBoxStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>

      ${html`<${ConfirmDialog}
        open=${!!confirmState?.open}
        title=${translate("Warning")}
        message=${confirmState?.message || ""}
        okLabel=${translate("Yes")}
        cancelLabel=${translate("Cancel")}
        onOk=${handleConfirmOk}
        onCancel=${handleConfirmCancel}
      />`}
    </div>
  `;
}

const backdropStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,.6)",
  zIndex: 9999,
};

const modalStyle = {
  position: "fixed" as const,
  top: "50%",
  left: "50%",
  transform: "translateX(-50%) translateY(-50%)",
  width: "75vw",
  height: "85vh",
  background: "var(--background-default)",
  borderRadius: "8px",
  border: "1px solid var(--divider)",
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  padding: "12px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column" as const,
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const modalTitleStyle = { fontWeight: 600 };
const hintStyle = { fontSize: "12px", color: "#6b6f76", marginBottom: "8px" };

const contentWrapStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 260px) minmax(220px, 260px) 1fr",
  gap: "12px",
  flex: 1,
  minHeight: 0,
};

const midPaneStyle = {
  display: "flex",
  flexDirection: "column" as const,
  border: "1px solid var(--divider)",
  borderRadius: "8px",
  overflow: "hidden",
  minHeight: 0,
};

const remotePaneStyle = {
  ...midPaneStyle,
};

const midSearchWrapStyle = {
  padding: "8px",
};

const midSearchInputStyle = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid var(--divider)",
  borderRadius: "6px",
  fontSize: "13px",
  background: "var(--background-default)",
  color: "var(--text-primary)",
};

const listWrapStyle = {
  padding: "6px",
  overflowY: "auto" as const,
  height: "100%",
};

const listItemStyle = (active: boolean) => ({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "6px",
  alignItems: "center",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid var(--divider)",
  background: active ? "var(--background-paper)" : "transparent",
  marginBottom: "6px",
  cursor: "default",
});

const listItemTextWrap = {
  minWidth: 0,
};

const listItemCaption = {
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: "4px",
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
  textOverflow: "ellipsis" as const,
};

const listItemValue = {
  fontSize: "12px",
  color: "var(--text-secondary)",
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
  textOverflow: "ellipsis" as const,
};

const listItemActions = {
  display: "inline-flex",
  gap: "6px",
  alignItems: "center",
};

const rightPaneStyle = {
  border: "1px solid var(--divider)",
  borderRadius: "8px",
  padding: "10px",
  display: "flex",
  flexDirection: "column" as const,
  minHeight: 0,
  overflow: "hidden",
};

const rowGrid = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: "8px",
  alignItems: "center",
  marginTop: "8px",
} as const;

const editorRowStyle = {
  display: "flex",
  alignItems: "stretch",
  gap: "8px",
  marginTop: "8px",
  flex: 1,
  minHeight: 0,
} as const;

const editorLabelStyle = {
  width: "120px",
  paddingTop: "4px",
} as const;

const editorContainerStyle = {
  flex: 1,
  minHeight: 0,
};

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid var(--divider)",
  borderRadius: "6px",
  fontSize: "13px",
  background: "var(--background-default)",
  color: "var(--text-primary)",
};

const editorBoxStyle = {
  width: "100%",
  height: "100%",
  border: "1px solid var(--divider)",
  borderRadius: "6px",
};

const actionsRowStyle = {
  display: "flex",
  gap: "8px",
  flexDirection: "row-reverse" as const,
};

const codeBadge = {
  background: "var(--background-paper)",
  padding: "0 6px",
  borderRadius: "4px",
};

const closeBtnStyle = {
  color: "var(--text-primary)",
  cursor: "pointer",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "none",
  background: "transparent",
};

const actionBtnStyle = {
  padding: "6px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
};

const iconBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  cursor: "pointer",
  fontSize: "16px",
  background: "none",
  color: "var(--text-primary)",
  border: "none",
};

const iconBtnDisabled = { opacity: 0.5, cursor: "not-allowed" };

const nodataStyle = {
  opacity: 0.7,
  fontStyle: "italic",
  fontSize: "13px",
  textAlign: "center" as const,
  background: "var(--background-paper)",
  padding: "12px",
  borderRadius: "6px",
};

const remoteHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px",
  borderBottom: "1px solid var(--divider)",
};

const remoteTitleStyle = {
  fontWeight: 500,
  fontSize: "13px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  height: "100%",
  minHeight: 0,
};

function rid() {
  return "fn_" + Math.random().toString(36).slice(2, 10);
}
