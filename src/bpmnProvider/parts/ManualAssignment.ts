
import { html } from 'htm/preact';
import { isTextAreaEntryEdited } from '@bpmn-io/properties-panel';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import { useService } from 'bpmn-js-properties-panel';
import { getExtensionElement, } from '@/bpmnProvider/utils/defines';
import { TextAreaEntry } from '@bpmn-io/properties-panel';
import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

export function ManualAssignment(element) {
    const entries = [
        {
            id: 'manual-assignment',
            element,
            component: ManualAssignmentEdit,
            isEdited: isTextAreaEntryEdited
        }
    ];

    return setEntriesReadonly(entries);
}


function ManualAssignmentEdit(props) {
    const { element, id, disabled } = props;

    const commandStack = useService('commandStack');
    const debounce = useService('debounceInput');
    const bpmnFactory = useService('bpmnFactory');
    const translate = useService('translate');

    const getValue = () => {
        const manualAssignment = getExtensionElement(element, 'customExtension:ManualAssignment');
        return manualAssignment?.get('value') || '';
    };

    const setValue = (value) => {
        const bo = getBusinessObject(element);

        let extensionElements = bo.get('extensionElements');
        const commands = [] as unknown[];

        if (!extensionElements) {
            extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
                values: []
            });

            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: bo,
                    properties: {
                        extensionElements
                    }
                }
            });
        }

        const manualAssignment = extensionElements.get('values')?.find(
            (el) => el.$type === 'customExtension:ManualAssignment'
        );

        if (!manualAssignment) {
            const newManualAssignment = bpmnFactory.create('customExtension:ManualAssignment', {
                value: value || ''
            });

            const updatedValues = [...extensionElements.get('values'), newManualAssignment];

            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: extensionElements,
                    properties: {
                        values: updatedValues
                    }
                }
            });
        } else {
            commands.push({
                cmd: 'element.updateModdleProperties',
                context: {
                    element,
                    moddleElement: manualAssignment,
                    properties: {
                        value: value || ''
                    }
                }
            });
        }

        if (commands.length > 0) {
            commandStack.execute('properties-panel.multi-command-executor', commands);
        }
    };


    return html`
    <${TextAreaEntry}
        id=${id}
        label=${translate('Enter comma-separated user IDs')}
        element=${element}
        getValue=${getValue}
        setValue=${setValue}
        debounce=${debounce}
        disabled=${disabled}
    />
  `;
}