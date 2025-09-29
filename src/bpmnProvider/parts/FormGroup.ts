
import { VNode } from 'preact';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';
import { isTextFieldEntryEdited, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { FormName } from '@/bpmnProvider/components/FormName';
import { FormData } from '@/bpmnProvider/components/FormData';
import { FormType } from '@/bpmnProvider/components/FormType';
import { FormDefinition } from '@/bpmnProvider/components/FormDefinition';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import type {
  Element as BpmnElement,
} from 'bpmn-js/lib/model/Types';

interface Props {
  id: string;
  element: BpmnElement;
}

interface FormGroupEntry {
  id: string;
  element: BpmnElement;
  component(props: Props): VNode;
  isEdited?: boolean;
}

export function FormGroup(element) {
  let entries: FormGroupEntry[] = [];

  if (is(element, 'bpmn:ScriptTask')) {
    entries = [
      {
        id: 'formName',
        element,
        component: FormName,
        isEdited: isSelectEntryEdited
      },
      {
        id: 'formData',
        element,
        component: FormData
      }
    ];
  }

  if (is(element, 'bpmn:UserTask')) {
    entries = [
      {
        id: 'formType',
        element,
        component: FormType,
        isEdited: isSelectEntryEdited
      },
    ];

    const businessObject = getBusinessObject(element);
    const formTypeElement = businessObject.extensionElements?.values.find(
      (value) => value.$type === 'customExtension:FormType'
    );

    if (formTypeElement) {
      if (formTypeElement.value === 'Form builder') {
        entries.push({
          id: 'formName',
          element,
          component: FormName,
          isEdited: isSelectEntryEdited
        });

        const formDefinitionElement = businessObject.extensionElements?.values.find(
          (value) => value.$type === 'customExtension:FormDefinition'
        );

        if (formDefinitionElement) delete formDefinitionElement.value;
      } else if (formTypeElement.value === 'Form custom') {
        entries.push({
          id: 'form-definition',
          element,
          component: FormDefinition,
          isEdited: isTextFieldEntryEdited
        });

        const formNameElement = businessObject.extensionElements?.values.find(
          (value) => value.$type === 'customExtension:FormName'
        );

        if (formNameElement) delete formNameElement.value;
      } else if (formTypeElement.value === '') {
        const formNameElement = businessObject.extensionElements?.values.find(
          (value) => value.$type === 'customExtension:FormName'
        );
        const formDefinitionElement = businessObject.extensionElements?.values.find(
          (value) => value.$type === 'customExtension:FormDefinition'
        );

        if (formNameElement) delete formNameElement.value;
        if (formDefinitionElement) delete formDefinitionElement.value;
      }
    }
  }

  if (is(element, 'bpmn:Task') && !is(element, 'bpmn:ScriptTask') && !is(element, 'bpmn:UserTask')) {
    entries = [
      {
        id: 'formName',
        element,
        component: FormName,
        isEdited: isSelectEntryEdited
      },
      {
        id: 'formData',
        element,
        component: FormData,
        isEdited: isSelectEntryEdited
      }
    ];
  }

  return setEntriesReadonly(entries);
}