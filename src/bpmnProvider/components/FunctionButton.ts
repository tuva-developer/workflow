// @/bpmnProvider/components/FunctionButton.tsx
import { html } from "htm/preact";
import { useState } from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getReadonlyMode } from "@/global/appState";
import { FunctionModal } from "@/bpmnProvider/components/FunctionModal";

export function FunctionButton(props) {
  const { element, injector } = props;
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
        ${translate("Manage functions")}
      </button>
      ${open &&
      html`
        <${FunctionModal}
          element=${element}
          injector=${injector}
          onClose=${() => setOpen(false)}
        />
      `}
    </div>
  `;
}

const rowStyle = { alignItems: "center", gap: "8px", margin: "8px 0" } as const;
