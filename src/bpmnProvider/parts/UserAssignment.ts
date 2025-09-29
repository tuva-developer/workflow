import {
  removeElementEvent,
  addElementEvent,
  addElement,
  getExtensionValues,
  isAssignmentEmpty,
  canRemoveAssignment,
} from '@/bpmnProvider/utils/defines';
import { getReadonlyMode } from '@/global/appState';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { UserSelect } from '@/bpmnProvider/components/UserSelect';

export function UserAssignment({ element, injector }) {

  let userAssignment = getExtensionValues(element, 'customExtension:UserAssignment') || [];
  const groupAssignment = getExtensionValues(element, 'customExtension:GroupAssignment') || [];
  const IsReadOnlyMode = getReadonlyMode();

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');
  const extensionType = 'customExtension:UserAssignment';
  const extensionChild = {
    type: 'customExtension:Assignee',
    label: 'Assignee'
  };

  if (isAssignmentEmpty(userAssignment, groupAssignment)) {
    addElement({ element, bpmnFactory, commandStack, extensionType, extensionChild });
    userAssignment = getExtensionValues(element, extensionType) || [];
  }

  const items = userAssignment.map((assignee, index) => {
    const id = element.id + '-extension-assignee-' + index;

    return {
      id,
      label: assignee.get('name') || '',
      entries: Assignee({
        idPrefix: id,
        element,
        assignee,
      }),
      autoFocusEntry: id + '-name',
      remove: !IsReadOnlyMode && canRemoveAssignment(userAssignment, groupAssignment)
        ? removeElementEvent({ commandStack, element, extensionType, childElement: assignee })
        : undefined
    };
  });

  return {
    items,
    add: !IsReadOnlyMode ? addElementEvent({ element, bpmnFactory, commandStack, extensionType, extensionChild, injector }) : undefined
  };
}

function Assignee(props) {
  const {
    idPrefix,
    assignee,
  } = props;

  const entries = [
    {
      id: idPrefix + '-value',
      component: UserSelect,
      idPrefix,
      assignee
    }
  ];

  return setEntriesReadonly(entries);
}