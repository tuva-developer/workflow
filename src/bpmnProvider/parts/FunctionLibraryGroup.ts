// @/bpmnProvider/parts/FunctionLibraryGroup.ts
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { FunctionList } from '@/bpmnProvider/components/FunctionList';
import { FunctionButton } from '@/bpmnProvider/components/FunctionButton';

export function FunctionLibraryGroup(element, injector) {
  const entries = [
    {
      id: 'FunctionList',
      element,
      injector,
      component: FunctionList,
      isEdited: undefined
    },
    {
      id: 'FunctionButton',
      element,
      injector,
      component: FunctionButton,
      isEdited: undefined
    }
  ];

  return setEntriesReadonly(entries);
}
