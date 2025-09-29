import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

export function GeneralGroup(element) {
  const entries = [
    {
      id: 'name',
      element,
      component: NameEntry,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'id',
      element,
      component: IdEntry,
      isEdited: isTextFieldEntryEdited
    }
  ];

  return setEntriesReadonly(entries);
}

function NameEntry(props) {
  const { element, id, disabled } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = element.businessObject;

  const getValue = () => businessObject.name || '';

  const setValue = (value) => {
    commandStack.execute('element.updateProperties', {
      element,
      properties: { name: value }
    });
  };

  return TextFieldEntry({
    id,
    element,
    label: translate('Name'),
    getValue,
    setValue,
    debounce,
    disabled
  });
}

function IdEntry(props) {
  const { element, id, disabled } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = element.businessObject;

  const getValue = () => businessObject.id || '';

  const setValue = (value) => {
    const sanitizedValue = value.replace(/[^\w-]/g, '');

    commandStack.execute('element.updateProperties', {
      element,
      properties: { id: sanitizedValue }
    });
  };


  return TextFieldEntry({
    id,
    element,
    label: translate('Id'),
    description: translate('ID must not contain spaces or unicode characters. Use only letters, numbers, "_" or "-"'),
    getValue,
    setValue,
    debounce,
    disabled
  });
}