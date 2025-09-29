import inherits from 'inherits-browser';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { bind } from 'min-dash';
import { getReadonlyMode } from '@/global/appState';
import { saveTemplate } from "@/bpmnProvider/utils/defines";
import { showSuccess, showError, showWarn } from '@/utils/toastConfig';

export default function CustomContextPadProvider(injector, translate, eventBus) {
    injector.invoke(ContextPadProvider, this);

    let currentModeler = null;

    eventBus.on('updateModeler', ({ modeler }) => {
        currentModeler = modeler;
    });

    const originalGetEntries = bind(this.getContextPadEntries, this);

    this.getContextPadEntries = function (element) {
        if (getReadonlyMode()) return [];

        const actions = originalGetEntries(element);
        delete actions['append.intermediate-event'];

        if (['bpmn:ScriptTask', 'bpmn:SubProcess', 'bpmn:ExclusiveGateway'].some(type => is(element, type))) {
            actions['custom-save-template'] = {
                id: 'custom-save-template',
                group: 'model',
                className: 'ri-save-2-line',
                title: translate('Save to template'),
                action: {
                    click: () => saveTemplatePopup(element)
                }
            };
        }

        return actions;
    };

    function saveTemplatePopup(element) {
        const modal = document.getElementById('templateModal');
        const input = document.getElementById('templateNameInput');
        const confirmBtn = document.getElementById('confirmSave');
        const cancelBtn = document.getElementById('cancelModal');
        const closeBtn = document.getElementById('closeModal');

        input.value = '';
        input.placeholder = translate('Enter template name...');
        modal.style.display = 'flex';

        document.querySelector('.mui-dialog-title-text').innerText = translate('Save template');
        confirmBtn.innerText = translate('Create');
        cancelBtn.innerText = translate('Cancel');

        const closeModal = () => {
            modal.style.display = 'none';
            confirmBtn.removeEventListener('click', onConfirm);
            closeBtn.removeEventListener('click', closeModal);
            cancelBtn.removeEventListener('click', closeModal);
        };

        const onConfirm = async () => {
            const name = input.value.trim();
            if (!name) {
                showWarn(translate('Please enter template name'));
                return;
            }

            closeModal();
            const result = await saveTemplate(element, name, currentModeler);
            if (result.success) {
                eventBus.fire('template.created', result.template);
                showSuccess(translate('Create template success'));
            } else {
                showError(translate('Create template failed'));
            }
        };

        confirmBtn.addEventListener('click', onConfirm);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
    }
}

inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
    'injector',
    'translate',
    'eventBus'
];