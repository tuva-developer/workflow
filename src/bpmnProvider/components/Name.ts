import { useService } from 'bpmn-js-properties-panel';
import { TextFieldEntry } from '@bpmn-io/properties-panel';

export function Name(props) {
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
        name: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.name;
  };

  return TextFieldEntry({
    element: extensionProperty,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce,
    disabled: disabled
  });
}