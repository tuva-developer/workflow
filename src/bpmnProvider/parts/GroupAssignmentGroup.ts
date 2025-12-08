import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { AssignList } from '@/bpmnProvider/components/AssignList';
import { AssignButton } from '@/bpmnProvider/components/AssignButton';

export function GroupAssignmentGroup(element, injector) {
  const entries = [
    {
      id: 'AssignList',
      element,
      extensionType: 'customExtension:GroupAssignment',
      component: AssignList,
      isEdited: undefined
    },
    {
      id: 'AssignButton',
      element,
      injector,
      extensionType: 'customExtension:GroupAssignment',
      component: AssignButton,
      isEdited: undefined
    }
  ];

  return setEntriesReadonly(entries);
}