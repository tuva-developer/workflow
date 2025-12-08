import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { AssignList } from '@/bpmnProvider/components/AssignList';
import { AssignButton } from '@/bpmnProvider/components/AssignButton';

export function UserAssignmentGroup(element, injector) {
  const entries = [
    {
      id: 'AssignList',
      element,
      extensionType: 'customExtension:UserAssignment',
      component: AssignList,
      isEdited: undefined
    },
    {
      id: 'AssignButton',
      element,
      injector,
      extensionType: 'customExtension:UserAssignment',
      component: AssignButton,
      isEdited: undefined
    }
  ];

  return setEntriesReadonly(entries);
}