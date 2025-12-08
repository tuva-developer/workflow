import { html } from "htm/preact";
import {
  useEffect,
  useState,
  useRef,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";
import { showError } from "@/utils/toastConfig";
import { getTheme } from "@/global/appState";

export function MetadataEditor(props) {
  const { element, id, disabled } = props;
  const theme = getTheme();

  const modeling = useService("modeling");
  const translate = useService("translate");
  const bpmnFactory = useService("bpmnFactory");

  const editorRef = useRef(null);
  const jsonEditorInstance = useRef<JSONEditor | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const setValue = (value: string) => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create(
        "bpmn:ExtensionElements",
        {
          values: [],
        }
      );
    }

    let metadataElement = businessObject.extensionElements.values.find(
      (v) => v.$type === "customExtension:Metadata"
    );

    if (!metadataElement) {
      metadataElement = bpmnFactory.create("customExtension:Metadata", {
        value,
      });
      businessObject.extensionElements.values.push(metadataElement);
    } else {
      metadataElement.value = value;
    }

    modeling.updateProperties(element, {
      extensionElements: businessObject.extensionElements,
    });
  };

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  useEffect(() => {
    if (showPopup && editorRef.current) {
      const getValue = () => {
        const businessObject = getBusinessObject(element);
        const metadataElement = businessObject.extensionElements?.values.find(
          (v) => v.$type === "customExtension:Metadata"
        );
        return metadataElement ? metadataElement.value : "{}";
      };

      jsonEditorInstance.current = new JSONEditor(editorRef.current, {
        mode: "code",
        onEditable: () => !disabled,
      });

      jsonEditorInstance.current.aceEditor.setTheme(
        theme === "light" ? "ace/theme/one_dark" : "ace/theme/monokai"
      );

      try {
        jsonEditorInstance.current.set(JSON.parse(getValue()));
      } catch {
        jsonEditorInstance.current.set({});
      }
    }

    return () => {
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
        jsonEditorInstance.current = null;
      }
    };
  }, [showPopup, disabled, element, theme]);

  const handleSave = () => {
    if (!jsonEditorInstance.current) return;
    try {
      const json = jsonEditorInstance.current.get();
      setShowPopup(false);
      setValue(JSON.stringify(json));
    } catch (error) {
      showError(translate("Invalid JSON format"));
    }
  };

  return html`
    <div class="action-btn">
      <button
        class="bio-properties-panel-button"
        title=${translate("Set metadata")}
        onClick=${handleOpenPopup}
      >
        <i class="ri-settings-4-line" style="font-size:16px;"></i>
      </button>
    </div>
    <div>
      ${showPopup &&
      html`
        <div class="popup-overlay">
          <div class="popup-content">
            <div class="popup-title">
              <h3>${translate("Edit metadata")}</h3>
              <button onClick=${() => setShowPopup(false)}>
                <i class="ri-close-large-line"></i>
              </button>
            </div>
            <div id=${id} ref=${editorRef}></div>
            <div class="popup-actions">
              <button class="button-blue" onClick=${handleSave}>
                ${translate("Ok")}
              </button>
              <button class="button-red" onClick=${() => setShowPopup(false)}>
                ${translate("Cancel")}
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}
