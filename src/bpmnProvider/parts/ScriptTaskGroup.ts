import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { ScriptFormat } from '@/bpmnProvider/components/ScriptFormat';
import { Script } from '@/bpmnProvider/components/Script';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

export function ScriptTaskGroup(element) {
  const entries = [
    {
      id: 'scriptFormat',
      element,
      component: ScriptFormat,
      isEdited: isSelectEntryEdited
    }
  ];

  const businessObject = getBusinessObject(element);

  const scriptFormatElement = businessObject.extensionElements?.values.find(
    (value) => value.$type === 'customExtension:ScriptFormat'
  );

  const scriptFormat = scriptFormatElement ? scriptFormatElement.value : '';

  if (scriptFormat && scriptFormat.trim() !== '') {
    entries.push({
      id: 'script',
      element,
      component: Script,
      isEdited: undefined
    });
  }

  return setEntriesReadonly(entries);
}