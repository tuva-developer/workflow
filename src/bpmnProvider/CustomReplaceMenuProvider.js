import { is } from 'bpmn-js/lib/util/ModelUtil';

const DEFAULT_REPLACE_ENTRIES = {
    'bpmn:Task': ['bpmn:UserTask', 'bpmn:ScriptTask'],
    'bpmn:UserTask': ['bpmn:Task', 'bpmn:ScriptTask'],
    'bpmn:ScriptTask': ['bpmn:Task', 'bpmn:UserTask'],
    'bpmn:StartEvent': ['bpmn:EndEvent'],
    'bpmn:EndEvent': ['bpmn:StartEvent'],
};

export default function CustomReplaceMenuProvider(popupMenu, replace, translate, modeling, bpmnFactory) {
    this._popupMenu = popupMenu;
    this._replace = replace;
    this._translate = translate;
    this._modeling = modeling;
    this._bpmnFactory = bpmnFactory;

    popupMenu.registerProvider('bpmn-replace', this);
}

CustomReplaceMenuProvider.$inject = [
    'popupMenu',
    'replace',
    'translate',
    'modeling',
    'bpmnFactory'
];

CustomReplaceMenuProvider.prototype.getEntries = function (element) {
    const {
        _replace,
        _translate,
        _modeling,
        _bpmnFactory
    } = this;

    const entries = [];

    const replaceTargets = DEFAULT_REPLACE_ENTRIES[element.type];

    if (replaceTargets) {
        replaceTargets.forEach((targetType) => {
            const typeName = targetType.split(':')[1];

            entries.push({
                id: `replace-with-${typeName.toLowerCase()}`,
                label: _translate(typeName.replace(/([A-Z])/g, ' $1').trim()),
                className: `custom-icon-${typeName.toLowerCase()}`,
                target: { type: targetType },
                action: {
                    click: () => {
                        const oldBo = element.businessObject;

                        const preservedProperties = {
                            name: oldBo.name || ''
                        };

                        const newElement = _replace.replaceElement(element, {
                            type: targetType
                        });

                        _modeling.updateProperties(newElement, preservedProperties);
                    }
                }
            });
        });
    }

    if (is(element, 'bpmn:SequenceFlow')) {
        const source = element.source;
        const sourceBo = source && source.businessObject;

        const isEligible =
            sourceBo &&
            !is(sourceBo, 'bpmn:StartEvent') &&
            !is(sourceBo, 'bpmn:EndEvent') &&
            !is(sourceBo, 'bpmn:ExclusiveGateway');

        const hasCondition = !!element.businessObject.conditionExpression;

        if (isEligible && !hasCondition) {
            entries.push({
                id: 'make-conditional-flow',
                label: _translate('Make conditional'),
                className: 'bpmn-icon-conditional-flow',
                action: {
                    click: () => {
                        const condition = _bpmnFactory.create('bpmn:FormalExpression', {
                            body: '${ someCondition }',
                            language: 'javascript'
                        });

                        _modeling.updateProperties(element, {
                            conditionExpression: condition
                        });
                    }
                }
            });
        }

        if (hasCondition) {
            entries.push({
                id: 'remove-conditional-flow',
                label: _translate('Remove condition'),
                className: 'bpmn-icon-connection-multi',
                action: {
                    click: () => {
                        _modeling.updateProperties(element, {
                            conditionExpression: undefined
                        });

                        if (is(element, 'bpmn:SequenceFlow')) {
                            const bo = element.businessObject;
                            const extensionElements = bo.extensionElements;

                            if (extensionElements && extensionElements.values) {
                                extensionElements.values = extensionElements.values.filter(ext =>
                                    !(
                                        ext.$type === 'customExtension:ConditionType' ||
                                        ext.$type === 'customExtension:ScriptFormat' ||
                                        ext.$type === 'customExtension:Script'
                                    )
                                );

                                if (extensionElements.values.length === 0) {
                                    _modeling.updateProperties(element, {
                                        extensionElements: undefined
                                    });
                                } else {
                                    _modeling.updateProperties(element, {
                                        extensionElements: extensionElements
                                    });
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    if (is(element, 'bpmn:SubProcess') || is(element, 'bpmn:UserTask') || is(element, 'bpmn:ScriptTask')) {
        const loopCharacteristics = element.businessObject.loopCharacteristics;
        const isLoop = !!loopCharacteristics;
        const isSequential = isLoop && loopCharacteristics.isSequential;

        if (!isLoop || isSequential) {
            entries.push({
                id: 'set-parallel-multiinstance',
                label: _translate('Set Parallel Multi-Instance'),
                className: 'bpmn-icon-parallel-mi-marker',
                action: {
                    click: () => {
                        const loop = _bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', {
                            isSequential: false
                        });

                        _modeling.updateProperties(element, {
                            loopCharacteristics: loop
                        });
                    }
                }
            });
        }

        if (!isLoop || !isSequential) {
            entries.push({
                id: 'set-sequential-multiinstance',
                label: _translate('Set Sequential Multi-Instance'),
                className: 'bpmn-icon-sequential-mi-marker',
                action: {
                    click: () => {
                        const loop = _bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', {
                            isSequential: true
                        });

                        _modeling.updateProperties(element, {
                            loopCharacteristics: loop
                        });
                    }
                }
            });
        }

        if (isLoop) {
            entries.push({
                id: 'remove-multiinstance',
                label: _translate('Remove Multi-Instance'),
                className: 'custom-icon-remove-multi-instance',
                action: {
                    click: () => {
                        _modeling.updateProperties(element, {
                            loopCharacteristics: undefined
                        });
                    }
                }
            });
        }
    }

    return entries;
};

CustomReplaceMenuProvider.prototype.getHeaderEntries = function () {
    return [];
};