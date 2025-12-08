import { html } from "htm/preact";
import { useState } from "@bpmn-io/properties-panel/preact/hooks";
import { getReadonlyMode } from "@/global/appState";
import { AssignModal } from "@/bpmnProvider/components/AssignModal";
import { useService } from "bpmn-js-properties-panel";

export function AssignButton(props) {
  const { element, injector, extensionType } = props;
  const translate = useService("translate");

  const [open, setOpen] = useState(false);
  const IsReadOnly = getReadonlyMode();

  return html`
    <div style=${rowStyle} class="bio-properties-panel-entry">
      <button
        class="bio-properties-panel-button"
        disabled=${IsReadOnly}
        onClick=${() => setOpen(true)}
      >
        ${translate("Assign to")}
      </button>
      ${open &&
      html`
        <${AssignModal}
          element=${element}
          injector=${injector}
          extensionType=${extensionType}
          onClose=${() => setOpen(false)}
        />
      `}
    </div>
  `;
}

const rowStyle = {
  alignItems: "center",
  gap: "8px",
  margin: "8px 0",
};
