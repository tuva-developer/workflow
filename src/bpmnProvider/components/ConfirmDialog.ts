import { html } from "htm/preact";
import type { FunctionComponent } from "preact";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  onOk: () => void;
  onCancel: () => void;
};

export const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({
  open,
  title,
  message,
  okLabel,
  cancelLabel,
  onOk,
  onCancel,
}) => {
  if (!open) return null;

  const stop = (e: Event) => e.stopPropagation();

  return html`
    <div style=${overlayStyle} onClick=${onCancel}>
      <div style=${cardStyle} onClick=${stop}>
        <div style=${iconWrapStyle}>
          <i class="ri-error-warning-line" style=${iconStyle}></i>
        </div>
        <div style=${titleStyle}>${title}</div>
        <div style=${messageStyle}>${message}</div>
        <div style=${actionsStyle}>
          <button type="button" style=${primaryBtnStyle} onClick=${onOk}>
            ${okLabel}
          </button>
          <button type="button" style=${dangerBtnStyle} onClick=${onCancel}>
            ${cancelLabel}
          </button>
        </div>
      </div>
    </div>
  `;
};

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.5)",
};

const cardStyle = {
  background: "var(--background-default)",
  backgroundImage:
    "linear-gradient(rgba(255, 255, 255, 0.165), rgba(255, 255, 255, 0.165))",
  borderRadius: "16px",
  padding: "16px 20px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  textAlign: "center" as const,
};

const iconWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "rgba(248, 113, 113, 0.2)",
  marginBottom: "8px",
};

const iconStyle = {
  fontSize: "32px",
  color: "var(--error-main)",
};

const titleStyle = {
  fontWeight: 600,
  fontSize: "1.25rem",
  marginBottom: "4px",
  color: "var(--error-main)",
};

const messageStyle = {
  fontSize: "0.875rem",
  color: "var(--text-secondary)",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  marginTop: "20px",
};

const btnBaseStyle = {
  borderRadius: "8px",
  padding: "6px 24px",
  fontSize: "13px",
  border: "none",
  cursor: "pointer",
  textTransform: "none" as const,
  boxShadow:
    "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
};

const primaryBtnStyle = {
  ...btnBaseStyle,
  background: "var(--background-default)",
  backgroundImage:
    "linear-gradient(rgba(255, 255, 255, 0.165), rgba(255, 255, 255, 0.165))",
  color: "var(--text-primary)",
};

const dangerBtnStyle = {
  ...btnBaseStyle,
  background: "var(--error-main)",
  color: "#fff",
};
