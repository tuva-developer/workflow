import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { ConditionType } from '@/bpmnProvider/components/ConditionType';
import { Expression } from '@/bpmnProvider/components/Expression';
import { ScriptFormat } from '@/bpmnProvider/components/ScriptFormat';
import { Script } from '@/bpmnProvider/components/Script';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

export function ConditionGroup(element) {
  const entries = [
    {
      id: 'conditionType',
      element,
      component: ConditionType,
      isEdited: isSelectEntryEdited
    }
  ];

  const businessObject = getBusinessObject(element);

  const conditionTypeElement = businessObject.extensionElements?.values.find(
    (value) => value.$type === 'customExtension:ConditionType'
  );

  const conditionType = conditionTypeElement ? conditionTypeElement.value : '';

  if (businessObject.extensionElements) {
    if (conditionType === 'Script') {
      businessObject.extensionElements.values = businessObject.extensionElements.values.filter(
        (value) => value.$type !== 'customExtension:Expression'
      );
    } else if (conditionType === 'Expression') {
      businessObject.extensionElements.values = businessObject.extensionElements.values.filter(
        (value) => value.$type !== 'customExtension:ScriptFormat' && value.$type !== 'customExtension:Script'
      );
    }

    if (businessObject.extensionElements.values.length === 0) {
      businessObject.extensionElements = undefined;
    }
  }

  if (conditionType === 'Script') {
    entries.push({
      id: 'scriptFormat',
      element,
      component: ScriptFormat,
      isEdited: undefined
    });

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
  } else if (conditionType === 'Expression') {
    entries.push({
      id: 'expression',
      element,
      component: Expression,
      isEdited: undefined
    });
  }

  return setEntriesReadonly(entries);
}