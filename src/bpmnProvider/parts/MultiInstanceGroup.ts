
import { isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { Collection } from '@/bpmnProvider/components/Collection';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

export function MultiInstanceGroup(element) {
  const entries = [
    {
      id: 'collection',
      element,
      component: Collection,
      isEdited: isTextAreaEntryEdited
    }
  ];

  return setEntriesReadonly(entries);
}