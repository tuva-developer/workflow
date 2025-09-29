import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { SelectEntry } from '@bpmn-io/properties-panel';

export function ConditionType(props) {
  const { element, id, disabled } = props;

  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    const businessObject = getBusinessObject(element);

    const conditionTypeElement = businessObject.extensionElements?.values.find(
      (value) => value.$type === 'customExtension:ConditionType'
    );

    return conditionTypeElement ? conditionTypeElement.value : '';
  };

  const setValue = value => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });
    }

    let conditionTypeElement = businessObject.extensionElements.values.find(
      (value) => value.$type === 'customExtension:ConditionType'
    );

    if (!conditionTypeElement) {
      conditionTypeElement = bpmnFactory.create('customExtension:ConditionType', {
        value: value
      });
      businessObject.extensionElements.values.push(conditionTypeElement);
    } else {
      conditionTypeElement.value = value
    }

    modeling.updateProperties(element, {
      extensionElements: businessObject.extensionElements
    });
  };

  const getOptions = () => {
    return [
      { label: '<none>', value: '' },
      { label: 'Script', value: 'Script' },
      { label: 'Expression', value: 'Expression' }
    ];
  };

  return html`
    <${SelectEntry}
      id=${id}
      element=${element}
      label=${translate('Condition Type')}
      description=${translate('Select the condition type')}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${getOptions}
      disabled=${disabled}
    />
  `;
}