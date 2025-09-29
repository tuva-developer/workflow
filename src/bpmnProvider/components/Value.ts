import { useService } from 'bpmn-js-properties-panel';
import { TextFieldEntry } from '@bpmn-io/properties-panel';

export function Value(props) {
  const {
    idPrefix,
    element,
    extensionProperty,
    disabled
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionProperty,
      properties: {
        value: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.value;
  };

  return TextFieldEntry({
    element: extensionProperty,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
    disabled: disabled
  });
}