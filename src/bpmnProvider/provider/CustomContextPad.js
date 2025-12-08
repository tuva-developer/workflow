import inherits from 'inherits-browser';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { bind } from 'min-dash';
import { getReadonlyMode } from '@/global/appState';
import { saveTemplate } from "@/bpmnProvider/utils/defines";
import { showSuccess, showError, showWarn } from '@/utils/toastConfig';

export default function ContextPad(injector, translate, eventBus) {
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

        if (is(element, 'bpmn:ScriptTask')) {
            actions['custom-toggle-script-fullscreen'] = {
                id: 'custom-toggle-script-fullscreen',
                group: 'model',
                className: 'ri-fullscreen-line',
                title: translate('Open Script (fullscreen)'),
                action: {
                    click: () => toggleScriptFullscreen(element)
                }
            };
        }

        return actions;
    };

    function saveTemplatePopup(element) {
        const modal = document.getElementById('templateModal');
        const inputName = document.getElementById('templateNameInput');
        const inputDescription = document.getElementById('templateDescriptionInput');
        const confirmBtn = document.getElementById('confirmSave');
        const cancelBtn = document.getElementById('cancelModal');
        const closeBtn = document.getElementById('closeModal');

        inputName.value = '';
        inputName.placeholder = translate('Enter template name...');
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
            const name = inputName.value.trim();
            const description = inputDescription.value.trim();

            if (!name) {
                showWarn(translate('Please enter template name'));
                return;
            }

            closeModal();
            const result = await saveTemplate(element, currentModeler, name, description);
            
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

    function toggleGroupByClick(groupId, expand, tries = 10, gapMs = 16) {
        return new Promise(function (resolve) {
            function tryOnce(left) {
                var panel = document.querySelector('.bio-properties-panel');
                if (!panel) return left > 0 ? setTimeout(function () { tryOnce(left - 1); }, gapMs) : resolve();

                var group = panel.querySelector('[data-group-id="' + groupId + '"]');
                if (!group) return left > 0 ? setTimeout(function () { tryOnce(left - 1); }, gapMs) : resolve();

                var header = group.querySelector('.bio-properties-panel-group-header');
                var entries = group.querySelector('.bio-properties-panel-group-entries');
                var btn = group.querySelector('.bio-properties-panel-group-header-button.bio-properties-panel-arrow');

                if (!header || !entries || !btn) {
                    return left > 0 ? setTimeout(function () { tryOnce(left - 1); }, gapMs) : resolve();
                }

                var isOpen = header.classList.contains('open') || entries.classList.contains('open');

                if (typeof expand === 'boolean') {
                    var shouldOpen = expand;
                    if (shouldOpen !== isOpen) {
                        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    }
                    return resolve();
                }

                btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                resolve();
            }
            tryOnce(tries);
        });
    }

    function toggleScriptFullscreen(element) {
        var modeler = currentModeler;
        if (!modeler) return;

        var eventBus = modeler.get('eventBus');
        var selection = modeler.get('selection');

        var target = (element && (element.labelTarget || element)) || null;
        if (!target) return;

        async function fireToggle() {
            await toggleGroupByClick('group-CustomExtension_Script', true);
            eventBus.fire('scriptEditor.toggle', { elementId: target.id, force: true });
        }

        var selected = selection.get && selection.get()[0];
        if (selected && selected.id === target.id) {
            return fireToggle();
        }

        var onceSelectionChanged = function (ev) {
            var next = ev.newSelection && ev.newSelection[0];
            if (next && next.id === target.id) {
                eventBus.off('selection.changed', onceSelectionChanged);
                fireToggle();
            }
        };

        eventBus.on('selection.changed', onceSelectionChanged);
        selection.select && selection.select(target);
    }
}

inherits(ContextPad, ContextPadProvider);

ContextPad.$inject = [
    'injector',
    'translate',
    'eventBus'
];