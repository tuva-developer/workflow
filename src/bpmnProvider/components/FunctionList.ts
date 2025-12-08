import { html } from "htm/preact";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";

export function FunctionList(props) {
  const { element, id } = props;
  const translate = useService("translate");
  const eventBus = useService("eventBus");

  const collapsedCount = 3;

  const [items, setItems] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const total = items.length;

  const readFunctions = useCallback(() => {
    if (!element) return [];

    const bo = element.businessObject;
    const exts = bo?.extensionElements?.values || [];
    const lib = exts.find((v) => v?.$type === "customExtension:FunctionLibrary");

    if (!lib?.functions) return [];

    return lib.functions
      .map((fn) => fn.caption || fn.value || fn.id)
      .filter(Boolean);
  }, [element]);

  const refresh = useCallback(() => {
    const newList = readFunctions();
    setItems((prev) => (newList.join("|") !== prev.join("|") ? newList : prev));
  }, [readFunctions]);

  useEffect(() => {
    refresh();
  }, [element?.id, refresh]);

  useEffect(() => {
    const handler = () => refresh();

    eventBus.on("elements.changed", handler);
    eventBus.on("element.changed", handler);
    eventBus.on("commandStack.changed", handler);

    return () => {
      eventBus.off("elements.changed", handler);
      eventBus.off("element.changed", handler);
      eventBus.off("commandStack.changed", handler);
    };
  }, [eventBus, refresh]);

  const visible = useMemo(() => {
    return expanded ? items : items.slice(0, collapsedCount);
  }, [items, expanded]);

  const hiddenCount = Math.max(0, total - visible.length);

  return html`
    <div data-entry-id=${id} class="bio-properties-panel-entry">
      <div style=${boxStyle} title=${items.join(", ")}>
        ${visible.length
          ? visible.map((name) => html`<span style=${chipStyle}>${name}</span>`)
          : html`<span style=${emptyStyle}>${translate("Null")}</span>`}
        ${hiddenCount > 0 &&
        !expanded &&
        html`
          <button style=${moreBtnStyle} onClick=${() => setExpanded(true)}>
            +${hiddenCount} ${translate("more")}
          </button>
        `}
        ${hiddenCount > 0 &&
        expanded &&
        html`
          <button style=${moreBtnStyle} onClick=${() => setExpanded(false)}>
            ${translate("collapse")}
          </button>
        `}
      </div>
    </div>
  `;
}

const boxStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  padding: "8px",
  border: "1px solid var(--divider)",
  borderRadius: "6px",
  minHeight: "36px",
  width: "100%",
} as const;

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "3px 8px",
  fontSize: "12px",
  borderRadius: "999px",
  border: "1px solid var(--divider)",
  lineHeight: 1.6,
  userSelect: "text",
  background: "var(--background-paper)",
} as const;

const moreBtnStyle = {
  padding: "2px 8px",
  fontSize: "11px",
  borderRadius: "999px",
  border: "1px dashed var(--divider)",
  background: "none",
  cursor: "pointer",
} as const;

const emptyStyle = {
  color: "#6B7280",
  fontSize: "12px",
  fontStyle: "italic",
} as const;
