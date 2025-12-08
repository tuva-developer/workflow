import { getUserId } from '@/global/appState';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

const EXT_NS_USER_ASSIGNMENT = 'customExtension:UserAssignment';
const EXT_NS_GROUP_ASSIGNMENT = 'customExtension:GroupAssignment';
const EXT_NS_ASSIGNEE = 'customExtension:Assignee';
const BPMN_EXTENSION_ELEMENTS = 'bpmn:ExtensionElements';

export default function AutoAssignWhenEmpty(eventBus, injector) {
  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');

  let guard = false;

  const ensureExt = (element) => {
    const bo = getBusinessObject(element);
    if (!bo) return null;

    let ext = bo.extensionElements;
    if (!ext) {
      ext = bpmnFactory.create(BPMN_EXTENSION_ELEMENTS, { values: [] });
      commandStack.execute('element.updateModdleProperties', {
        element, moddleElement: bo, properties: { extensionElements: ext }
      });
    }
    if (!Array.isArray(ext.values)) {
      commandStack.execute('element.updateModdleProperties', {
        element, moddleElement: ext, properties: { values: [] }
      });
    }
    return ext;
  };

  const getNode = (ext, type) => (ext?.values || []).find(v => v?.$type === type) || null;

  const ensureUA = (element, ext) => {
    let ua = getNode(ext, EXT_NS_USER_ASSIGNMENT);
    const vals = ext.values || [];
    if (!ua) {
      ua = bpmnFactory.create(EXT_NS_USER_ASSIGNMENT, { values: [] });
      commandStack.execute('element.updateModdleProperties', {
        element, moddleElement: ext, properties: { values: [...vals, ua] }
      });
    }
    if (!Array.isArray(ua.values)) {
      commandStack.execute('element.updateModdleProperties', {
        element, moddleElement: ua, properties: { values: [] }
      });
    }
    return ua;
  };

  const ensureDefaultIfEmpty = (element) => {
    if (guard) return;
    if (!is(element, 'bpmn:UserTask')) return;

    const currentUserId = getUserId?.();
    if (!currentUserId) return;

    const ext = ensureExt(element);
    if (!ext) return;

    const ua = getNode(ext, EXT_NS_USER_ASSIGNMENT);
    const ga = getNode(ext, EXT_NS_GROUP_ASSIGNMENT);

    const uaCount = (ua?.values || []).length;
    const gaCount = (ga?.values || []).length;

    if (uaCount === 0 && gaCount === 0) {
      guard = true;
      try {
        const targetUA = ensureUA(element, ext);
        const newAssignee = bpmnFactory.create(EXT_NS_ASSIGNEE, { name: 'Assignee', value: currentUserId });
        const next = Array.isArray(targetUA.values) ? [...targetUA.values, newAssignee] : [newAssignee];

        commandStack.execute('element.updateModdleProperties', {
          element, moddleElement: targetUA, properties: { values: next }
        });
      } finally {
        setTimeout(() => { guard = false; }, 0);
      }
    }
  };

  eventBus.on('commandStack.element.updateModdleProperties.postExecute', (e) => {
    const el = e?.context?.element;
    if (el) ensureDefaultIfEmpty(el);
  });

  eventBus.on('commandStack.shape.replace.postExecute', (e) => {
    const el = e?.context?.newShape;
    if (el) ensureDefaultIfEmpty(el);
  });
}

AutoAssignWhenEmpty.$inject = ['eventBus', 'injector'];
