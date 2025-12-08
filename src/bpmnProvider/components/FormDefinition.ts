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

export function FormDefinition(props) {
  const { element, id, disabled } = props;
  const theme = getTheme();

  const modeling = useService("modeling");
  const translate = useService("translate");
  const bpmnFactory = useService("bpmnFactory");

  const editorRef = useRef(null);
  const jsonEditorInstance = useRef<JSONEditor | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create(
        "bpmn:ExtensionElements",
        { values: [] }
      );
    }

    let formElement = businessObject.extensionElements.values.find(
      (value) => value.$type === "customExtension:FormDefinition"
    );

    if (!formElement) {
      formElement = bpmnFactory.create("customExtension:FormDefinition", {
        value,
      });
      businessObject.extensionElements.values.push(formElement);
    } else {
      formElement.value = value;
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
        const formElement = businessObject.extensionElements?.values.find(
          (value) => value.$type === "customExtension:FormDefinition"
        );
        return formElement ? formElement.value : "{}";
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
      } catch (error) {
        jsonEditorInstance.current.set({});
      }
    }

    return () => {
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
        jsonEditorInstance.current = null;
      }
    };
  }, [showPopup, disabled, element]);

  const handleSave = () => {
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
        title=${translate("Set form definition")}
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
              <h3>${translate("Edit form definition")}</h3>
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
