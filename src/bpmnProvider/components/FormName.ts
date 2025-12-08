import { html } from "htm/preact";
import {
  useEffect,
  useMemo,
  useState,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { loadForms } from "@/services/forms";
import type { Element as BpmnElement } from "bpmn-js/lib/model/Types";

type Props = {
  element: BpmnElement;
  id: string;
  disabled?: boolean;
};

export function FormName(props: Props) {
  const { element, disabled } = props;

  const modeling = useService("modeling");
  const bpmnFactory = useService("bpmnFactory");
  const translate = useService("translate");

  const [formList, setFormList] = useState<FormConfig[]>([]);
  const [open, setOpen] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await loadForms({
          search: searchText || undefined,
          page: page + 1,
          limit: rowsPerPage,
        });
        if (!alive) return;

        setFormList(res?.items || []);
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
  }, [page, rowsPerPage, searchText]);

  const getValue = () => {
    const bo = getBusinessObject(element);
    const ext = bo?.extensionElements;
    const values = Array.isArray(ext?.values) ? ext.values : [];
    const formNameEl = values.find(
      (v: BpmnElement) => v?.$type === "customExtension:FormName"
    );
    return formNameEl?.value ?? "";
  };

  const setValue = (value: string) => {
    const bo = getBusinessObject(element);

    if (!bo.extensionElements) {
      bo.extensionElements = bpmnFactory.create("bpmn:ExtensionElements", {
        values: [],
      });
    }

    const ext = bo.extensionElements;
    const currValues: BpmnElement[] = Array.isArray(ext.values)
      ? [...ext.values]
      : [];

    const formNameEl = currValues.find(
      (v: BpmnElement) => v?.$type === "customExtension:FormName"
    );
    const currentValue = formNameEl?.value ?? "";

    if (value === currentValue) return;

    let nextValues = currValues;

    if (!value) {
      nextValues = currValues.filter(
        (v) =>
          v?.$type !== "customExtension:FormName" &&
          v?.$type !== "customExtension:FormData"
      );
    } else if (formNameEl) {
      formNameEl.value = value;
    } else {
      const newFormName = bpmnFactory.create("customExtension:FormName", {
        value,
      });
      nextValues = [...currValues, newFormName];
    }

    const newExtensionElements = bpmnFactory.create("bpmn:ExtensionElements", {
      values: nextValues,
    });

    modeling.updateProperties(element, {
      extensionElements: newExtensionElements,
    });
  };

  const selectedName = getValue();

  const options = useMemo(
    () => [
      { label: "<none>", value: "" },
      ...formList.map((item) => ({ label: item.name, value: item.name })),
    ],
    [formList]
  );

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
    <div class="bio-properties-panel-entry">
      <div style=${rowStyle}>
        ${selectedName
          ? html`<p style=${nameTextStyle} title=${selectedName}>
              ${selectedName}
            </p>`
          : html`<p
              style=${{
                ...nameTextStyle,
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              ${translate("<none>")}
            </p>`}

        <button
          style=${selectBtnStyle}
          class="bio-properties-panel-button"
          disabled=${disabled}
          onClick=${() => !disabled && setOpen(true)}
          title=${translate("Select form")}
          aria-label=${translate("Select form")}
        >
          ${translate("Select form")}
        </button>
      </div>

      ${open &&
      html`
        <div
          class="bio-properties-panel-modal-overlay"
          style=${overlayStyle}
          onClick=${() => setOpen(false)}
        >
          <div
            class="bio-properties-panel-modal"
            style=${modalStyle}
            onClick=${(e) => e.stopPropagation()}
          >
            <div style=${headerStyle}>
              <strong style=${headerTitleStyle}
                >${translate("Choose a form")}</strong
              >
              <a style=${closeBtnStyle} onClick=${() => setOpen(false)}>
                <i class="ri-close-line"></i>
              </a>
            </div>

            <div style=${searchWrapStyle}>
              <input
                class="bio-properties-panel-input"
                type="text"
                placeholder=${translate("Search forms")}
                value=${searchText}
                onInput=${(e) => setSearchText(e?.target?.value ?? "")}
                style=${searchInputStyle}
              />
            </div>

            <div style=${listWrapStyle}>
              <div
                role="button"
                tabindex=${0}
                onClick=${() => {
                  setValue("");
                  setOpen(false);
                }}
                style=${listItemStyle}
              >
                ${translate("<none>")}
                ${selectedName === "" &&
                html`<span style="float:right;"
                  ><i
                    class="ri-check-fill"
                    style="font-size:20px;color:var(--success-main);"
                  ></i
                ></span>`}
              </div>

              ${options.slice(1).map(
                (opt) => html`
                  <div
                    role="button"
                    tabindex=${0}
                    onClick=${() => {
                      setValue(opt.value);
                      setOpen(false);
                    }}
                    style=${listItemStyle}
                  >
                    ${opt.label}
                    ${selectedName === opt.value &&
                    html`<span style="float:right;"
                      ><i
                        class="ri-check-fill"
                        style="font-size:20px;color:var(--success-main);"
                      ></i
                    ></span>`}
                  </div>
                `
              )}
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
                  <p style=${rowsPerPageLabelStyle}>
                    ${translate("Page size")}
                  </p>
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
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  width: "100%",
  minHeight: "36px",
  border: "1px solid var(--divider)",
  padding: "4px 8px",
  borderRadius: "8px",
} as const;

const nameTextStyle = {
  display: "block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "var(--text-primary)",
  fontSize: "12px",
} as const;

const selectBtnStyle = {
  whiteSpace: "nowrap",
} as const;

const overlayStyle = {
  position: "fixed",
  inset: "0",
  background: "rgba(0,0,0,0.6)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const modalStyle = {
  background: "var(--background-default)",
  color: "inherit",
  minWidth: "420px",
  maxWidth: "640px",
  maxHeight: "70vh",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
} as const;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px 0px 12px",
} as const;

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

const headerTitleStyle = { flex: 1 } as const;

const searchWrapStyle = {
  padding: "12px",
} as const;

const searchInputStyle = { width: "100%" } as const;

const listWrapStyle = {
  overflow: "auto",
  border: "1px solid var(--divider)",
  margin: "0 12px",
  borderRadius: "8px",
} as const;

const listItemStyle = {
  padding: "10px 14px",
  cursor: "pointer",
} as const;

const footerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  padding: "8px 12px",
};

const pagerRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "8px",
  flex: 1,
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

type FormConfig = { name: string };
