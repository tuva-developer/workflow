import { html } from "htm/preact";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getReadonlyMode } from "@/global/appState";
import { loadUsers } from "@/services/users";
import { loadGroups } from "@/services/groups";

const EXT_NS_ASSIGNEE = "customExtension:Assignee";
const BPMN_EXTENSION_ELEMENTS = "bpmn:ExtensionElements";

export function AssignModal(props) {
  const { element, injector, extensionType, onClose } = props;

  const bpmnFactory = injector.get("bpmnFactory");
  const commandStack = injector.get("commandStack");
  const translate = useService("translate");
  const readOnly = getReadonlyMode();

  const bo = element?.businessObject;

  const isGroup = extensionType === "customExtension:GroupAssignment";
  const loader = isGroup ? loadGroups : loadUsers;
  const title = isGroup
    ? translate("Assign groups")
    : translate("Assign users");
  const hintText = isGroup
    ? translate("Choose group(s) to assign")
    : translate("Choose member(s) to assign");
  const searchPlaceholder =
    (isGroup
      ? translate("Search by group ID")
      : translate("Search by user ID")) + "...";

  type AssignItem = { id: string; name: string };
  const [items, setItems] = useState<AssignItem[]>([]);

  const [totalPages, setTotalPages] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchText, setSearchText] = useState("");

  const readAssignedIds = useCallback(() => {
    const ext = bo?.extensionElements;
    const list =
      ext?.values?.find((v) => v.$type === extensionType)?.values || [];
    return (list || [])
      .map((a) => (a.get ? a.get("value") : a?.value))
      .filter(Boolean);
  }, [bo, extensionType]);

  const initialSelected = useMemo(() => readAssignedIds(), [readAssignedIds]);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await loader({
          search: (searchText || "").trim(),
          page: page + 1,
          limit: rowsPerPage,
        });
        if (!alive) return;

        const raw = (res?.items ?? []) as Array<{
          userId?: string;
          _id?: string;
          name?: string;
        }>;
        const normalized: AssignItem[] = raw
          .map((it) => {
            const id = it.userId ?? it._id ?? "";
            const name = it.userId ?? it.name ?? "";
            return { id, name };
          })
          .filter((item) => !!item.id);

        setItems(normalized);
        setTotalPages(res?.totalPages || 0);
        setCanPrev(res?.hasPrev || false);
        setCanNext(res?.hasNext || false);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loader, page, rowsPerPage, searchText]);

  const ensureExtensionElements = () => {
    let ext = bo.extensionElements;
    if (!ext) {
      ext = bpmnFactory.create(BPMN_EXTENSION_ELEMENTS, { values: [] });
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: bo,
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
  };

  const getOrCreateAssignment = () => {
    const ext = ensureExtensionElements();
    const values = ext.values || [];
    let ua = values.find((v) => v.$type === extensionType);
    if (!ua) {
      ua = bpmnFactory.create(extensionType, { values: [] });
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: ext,
        properties: { values: [...values, ua] },
      });
    }
    if (!Array.isArray(ua.values)) {
      commandStack.execute("element.updateModdleProperties", {
        element,
        moddleElement: ua,
        properties: { values: [] },
      });
    }
    return ua;
  };

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const apply = () => {
    const ua = getOrCreateAssignment();
    const newChildren = (selected || []).map((id) =>
      bpmnFactory.create(EXT_NS_ASSIGNEE, { value: id })
    );
    commandStack.execute("element.updateModdleProperties", {
      element,
      moddleElement: ua,
      properties: { values: newChildren },
    });
    onClose();
  };

  const stop = (e: Event) => e.stopPropagation();

  const IconButton = ({
    icon,
    title,
    disabled,
    onClick,
  }: {
    icon: string;
    title: string;
    disabled: boolean;
    onClick: () => void;
  }) => html`
    <button
      type="button"
      title=${title}
      disabled=${disabled}
      onClick=${onClick}
      style=${{ ...iconBtnStyle, ...(disabled ? iconBtnDisabled : {}) }}
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

      <div style=${searchRowStyle}>
        <input
          type="text"
          placeholder=${searchPlaceholder}
          value=${searchText}
          onInput=${(e) => setSearchText(e.target.value)}
          style=${searchInputStyle}
        />
      </div>

      <div style=${gridStyle}>
        ${items.map((it) => {
          const id = it.id;
          const name = it.name;
          const checked = selected.includes(id);
          return html`
            <label style=${checkboxItemStyle(checked)} title=${id}>
              <input
                type="checkbox"
                checked=${checked}
                onChange=${() => toggleItem(id)}
                style="margin-right:8px"
              />
              <div style="display:flex; flex-direction:column;font-size:12px;">
                <span
                  style="
                  display: inline-block;
                  max-width: 160px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  vertical-align: bottom;
                "
                  title=${id}
                >
                  ${id}
                </span>
                ${extensionType === "customExtension:GroupAssignment" &&
                html`<span style="color:var(--text-secondary)">${name}</span>`}
              </div>
            </label>
          `;
        })}
        ${items.length === 0 &&
        html`<div style="opacity:.7">${translate("No data")}</div>`}
      </div>

      <div style=${footerStyle}>
        <div style=${pagerRowStyle}>
          ${IconButton({
            icon: "ri-skip-left-line",
            title: translate("First page"),
            disabled: page === 0,
            onClick: () => setPage(0),
          })}
          ${IconButton({
            icon: "ri-arrow-left-s-line",
            title: translate("Previous page"),
            disabled: !canPrev,
            onClick: () => setPage((p) => Math.max(0, p - 1)),
          })}

          <span style=${pagerTextStyle}
            ><b>${page + 1}</b> / ${totalPages}</span
          >

          ${IconButton({
            icon: "ri-arrow-right-s-line",
            title: translate("Next page"),
            disabled: !canNext,
            onClick: () => setPage((p) => p + 1),
          })}
          ${IconButton({
            icon: "ri-skip-right-line",
            title: translate("Last page"),
            disabled: page + 1 >= totalPages,
            onClick: () => setPage(totalPages - 1),
          })}

          <div style=${rowsPerPageWrapStyle}>
            <p style=${rowsPerPageLabelStyle}>${translate("Page size")}</p>
            <select
              value=${rowsPerPage}
              onChange=${(e) => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
              style=${rowsPerPageSelectStyle}
            >
              ${[10, 25, 50, 100].map(
                (n) => html`<option value=${n}>${n}</option>`
              )}
            </select>
          </div>
        </div>

        <div style=${actionsRowStyle}>
          <button
            type="button"
            onClick=${onClose}
            style=${{ ...actionBtnStyle, backgroundColor: "red" }}
          >
            ${translate("Cancel")}
          </button>
          <button
            type="button"
            onClick=${apply}
            style=${{
              ...actionBtnStyle,
              backgroundColor: "var(--primary-main)",
            }}
            disabled=${readOnly}
          >
            ${translate("Apply")}
          </button>
        </div>
      </div>
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
  top: "10%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(900px, 92vw)",
  background: "var(--background-default)",
  borderRadius: "8px",
  border: "1px solid var(--divider)",
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  padding: "12px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column" as const,
  maxHeight: "80vh",
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const modalTitleStyle = { fontWeight: 600 };
const hintStyle = { fontSize: "12px", color: "#6b6f76", marginBottom: "8px" };

const searchRowStyle = { marginBottom: "8px" };
const searchInputStyle = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid var(--divider)",
  borderRadius: "6px",
  fontSize: "13px",
  background: "var(--background-default)",
  color: "var(--text-primary)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "10px",
  alignItems: "flex-start",
  marginTop: "6px",
  marginBottom: "12px",
  maxHeight: "50vh",
  overflowY: "auto",
  paddingRight: "4px",
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

const checkboxItemStyle = (checked: boolean) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 8px",
  borderRadius: "6px",
  background: checked ? "var(--background-paper)" : "transparent",
  border: "1px solid var(--divider)",
  cursor: "pointer",
});

const footerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "4px",
  gap: "8px",
};

const actionBtnStyle = {
  padding: "4px 8px",
  color: "#fff",
  borderRadius: "6px",
  fontSize: "13px",
  border: "none",
  cursor: "pointer",
};

const pagerRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "8px",
  marginTop: "4px",
  flex: 1,
};

const iconBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  cursor: "pointer",
  fontSize: "16px",
  background: "none",
  color: "var(--text-primary)",
  border: "none",
};

const iconBtnDisabled = {
  opacity: 0.5,
  cursor: "not-allowed",
};

const pagerTextStyle = {
  padding: "0 8px",
  fontSize: "13px",
  color: "var(--text-secondary)",
};

const rowsPerPageWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const rowsPerPageLabelStyle = {
  color: "var(--text-secondary)",
  fontSize: "13px",
};

const rowsPerPageSelectStyle = {
  borderRadius: "6px",
  border: "1px solid var(--divider)",
  background: "var(--background-paper)",
  color: "var(--text-primary)",
  padding: "4px 8px",
  fontSize: "13px",
};

const actionsRowStyle = { display: "flex", gap: "8px" };
