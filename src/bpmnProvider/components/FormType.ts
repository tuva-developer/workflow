import { html } from "htm/preact";
import { useService } from "bpmn-js-properties-panel";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { SelectEntry } from "@bpmn-io/properties-panel";

export function FormType(props) {
  const { element, id, disabled } = props;

  const modeling = useService("modeling");
  const translate = useService("translate");
  const bpmnFactory = useService("bpmnFactory");

  const getValue = () => {
    const businessObject = getBusinessObject(element);

    const formTypeElement = businessObject.extensionElements?.values.find(
      (value) => value.$type === "customExtension:FormType"
    );

    return formTypeElement ? formTypeElement.value : "";
  };

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create(
        "bpmn:ExtensionElements",
        {
          values: [],
        }
      );
    }

    let formTypeElement = businessObject.extensionElements.values.find(
      (value) => value.$type === "customExtension:FormType"
    );

    if (!formTypeElement) {
      formTypeElement = bpmnFactory.create("customExtension:FormType", {
        value: value,
      });
      businessObject.extensionElements.values.push(formTypeElement);
    } else {
      formTypeElement.value = value;
    }

    modeling.updateProperties(element, {
      extensionElements: businessObject.extensionElements,
    });
  };

  const getOptions = () => {
    return [
      { label: translate("<none>"), value: "" },
      { label: translate("Form builder"), value: "Form builder" },
      { label: translate("Form custom"), value: "Form custom" },
    ];
  };

  return html`
    <${SelectEntry}
      id=${id}
      element=${element}
      label=${translate("Form type")}
      description=${translate(
        "Select the form type (e.g., Form builder, Form custom,...)"
      )}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${getOptions}
      disabled=${disabled}
    />
  `;
}
