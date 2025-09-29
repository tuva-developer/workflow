import {
  removeElementEvent,
  addElementEvent,
  getExtensionValues,
} from '@/bpmnProvider/utils/defines';
import { getReadonlyMode } from '@/global/appState';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { GroupSelect } from '@/bpmnProvider/components/GroupSelect';

export function GroupAssignment({ element, injector }) {

  const groupAssignment = getExtensionValues(element, 'customExtension:GroupAssignment') || [];
  const IsReadOnlyMode = getReadonlyMode();

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');
  const extensionType = 'customExtension:GroupAssignment';
  const extensionChild = {
    type: 'customExtension:Group',
    label: 'Group'
  };

  const items = groupAssignment.map((group, index) => {
    const id = element.id + '-extension-group-' + index;

    return {
      id,
      label: group.get('name') || '',
      entries: Group({
        idPrefix: id,
        element,
        group,
      }),
      autoFocusEntry: id + '-name',
      remove: !IsReadOnlyMode
        ? removeElementEvent({ commandStack, element, extensionType, childElement: group })
        : undefined
    };
  });

  return {
    items,
    add: !IsReadOnlyMode ? addElementEvent({ element, bpmnFactory, commandStack, extensionType, extensionChild, injector }) : undefined
  };
}

function Group(props) {
  const {
    idPrefix,
    group,
  } = props;

  const entries = [
    {
      id: idPrefix + '-value',
      component: GroupSelect,
      idPrefix,
      group
    }
  ];

  return setEntriesReadonly(entries);
}