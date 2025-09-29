import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry } from '@bpmn-io/properties-panel';

export function Expression(props) {
  const { element, id, disabled } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    const businessObject = getBusinessObject(element);

    const formTypeElement = businessObject.extensionElements?.values.find(
      (value) => value.$type === 'customExtension:Expression'
    );

    return formTypeElement ? formTypeElement.value : '';
  };

  const setValue = value => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });
    }

    let formTypeElement = businessObject.extensionElements.values.find(
      (value) => value.$type === 'customExtension:Expression'
    );

    if (!formTypeElement) {
      formTypeElement = bpmnFactory.create('customExtension:Expression', {
        value: value
      });
      businessObject.extensionElements.values.push(formTypeElement);
    } else {
      formTypeElement.value = value
    }

    modeling.updateProperties(element, {
      extensionElements: businessObject.extensionElements
    });
  };

  return html`
    <${TextFieldEntry}
      id=${id}
      element=${element}
      label=${translate('Condition Expression')}
      getValue=${getValue}
      setValue=${setValue}
      debounce=${debounce}
      disabled=${disabled}
    />
  `;
}