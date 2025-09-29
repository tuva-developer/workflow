import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { SelectEntry } from '@bpmn-io/properties-panel';

export function ScriptFormat(props) {
  const { element, id, disabled } = props;

  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    const businessObject = getBusinessObject(element);

    const scriptFormatElement = businessObject.extensionElements?.values.find(
      (value) => value.$type === 'customExtension:ScriptFormat'
    );

    return scriptFormatElement ? scriptFormatElement.value : '';
  };

  const setValue = value => {
    const businessObject = getBusinessObject(element);

    if (!businessObject.extensionElements) {
      businessObject.extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });
    }

    let scriptFormatElement = businessObject.extensionElements.values.find(
      (value) => value.$type === 'customExtension:ScriptFormat'
    );

    if (!scriptFormatElement) {
      scriptFormatElement = bpmnFactory.create('customExtension:ScriptFormat', {
        value: value
      });
      businessObject.extensionElements.values.push(scriptFormatElement);
    } else {
      scriptFormatElement.value = value;
    }

    return modeling.updateProperties(element, {
      extensionElements: businessObject.extensionElements
    });
  };

  const getOptions = () => {
    return [
      { label: '<none>', value: '' },
      { label: 'JavaScript', value: 'JavaScript' },
      // { label: 'PHP', value: 'PHP' },
      // { label: 'C++', value: 'C++' },
    ];
  };

  return html`
    <${SelectEntry}
      id=${id}
      element=${element}
      label=${translate('Script Format')}
      description=${translate('Select the script format (e.g., JavaScript, PHP, C++).')}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${getOptions}
      disabled=${disabled}
    />
  `;
}