import { html } from 'htm/preact';
import { useService } from 'bpmn-js-properties-panel';
import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { TextAreaEntry } from '@bpmn-io/properties-panel';

export function Collection(props) {
  const { element, id, disabled } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const businessObject = getBusinessObject(element);
    const loopCharacteristics = businessObject.loopCharacteristics;

    if (loopCharacteristics && loopCharacteristics.$attrs) {
      return loopCharacteristics.$attrs['customExtension:collection'] || loopCharacteristics.get('customExtension:collection') || '';
    }

    return '';
  };

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);
    let loopCharacteristics = businessObject.loopCharacteristics;

    if (!loopCharacteristics) {
      loopCharacteristics = modeling.createModdleElement(
        'bpmn:MultiInstanceLoopCharacteristics',
        {},
        businessObject
      );

      modeling.updateProperties(element, { loopCharacteristics });
    }

    if (!loopCharacteristics.$attrs) {
      loopCharacteristics.$attrs = {};
    }

    loopCharacteristics.$attrs['customExtension:collection'] = value || '';

    modeling.updateProperties(element, { loopCharacteristics });
  };


  return html`
    <${TextAreaEntry}
      id=${id}
      element=${element}
      label=${translate('Collection')}
      getValue=${getValue}
      setValue=${setValue}
      debounce=${debounce}
      disabled=${disabled}
    />
  `;
}