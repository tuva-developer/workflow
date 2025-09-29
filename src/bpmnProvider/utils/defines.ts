import Ids from 'ids';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { without } from 'min-dash';
import { getReadonlyMode } from '@/global/appState';
import { createTemplate } from '@/services/templates';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import type ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import BpmnModeler from "bpmn-js/lib/Modeler";
import type Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type { Moddle } from "bpmn-js/lib/model/Types";
import type {
  Element as BpmnElement,
  Shape as BpmnShape,
  Connection as BpmnConnection,
  Parent as BpmnParent
} from 'bpmn-js/lib/model/Types';

export function getExtension(businessObject, type) {
  if (!businessObject.extensionElements) {
    return null;
  }

  return businessObject.extensionElements.values.filter(function (e) {
    return e.$instanceOf(type);
  })[0];
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix + '_');
}

export function setEntriesReadonly(entries) {
  const isReadOnlyMode = getReadonlyMode();
  return entries.map(entry => ({
    ...entry,
    disabled: isReadOnlyMode
  }));
}

export function getExtensionProperties_Extension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'customExtension:Properties');
}

export function getExtensionProperties(element) {
  const extensions = getExtensionProperties_Extension(element);
  return extensions && extensions.get('values');
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function createParameters(properties, parent, bpmnFactory) {
  return createElement('customExtension:Properties', properties, parent, bpmnFactory);
}

export function removeExtensionProperty({ commandStack, element, extensionProperty }) {
  return function (event) {
    event.stopPropagation();

    const extension = getExtensionProperties_Extension(element);

    if (!extension) {
      return;
    }

    const parameters = without(extension.get('values'), extensionProperty);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extension,
      properties: {
        values: parameters
      }
    });
  };
}

export function addExtensionProperty({ element, bpmnFactory, commandStack }) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    const commands: unknown[] = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    let extension = getExtensionProperties_Extension(element);

    if (!extension) {
      extension = createParameters(
        { values: [] },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get('values'), extension]
          }
        }
      });
    }

    const newParameter = createElement(
      'customExtension:Property',
      {
        name: nextId('Property_'),
        value: ''
      },
      extension,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extension,
        properties: {
          values: [...extension.get('values'), newParameter]
        }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

export function getExtensionElement(element, extensionType) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, extensionType);
}

export function getExtensionValues(element, extensionType, valuesKey = 'values') {
  const extension = getExtensionElement(element, extensionType);
  return extension && extension.get(valuesKey);
}

export function removeElement({ commandStack, element, extensionType, childElement }) {
  const extension = getExtensionElement(element, extensionType);

  if (!extension) {
    return;
  }

  const parameters = without(extension.get('values'), childElement);

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: extension,
    properties: {
      values: parameters
    }
  });
}

export function removeElementEvent({ commandStack, element, extensionType, childElement }) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    removeElement({ commandStack, element, extensionType, childElement })
  };
}

export function addElement({ element, bpmnFactory, commandStack, extensionType, extensionChild }) {
  const commands: unknown[] = [];

  const businessObject = getBusinessObject(element);

  let extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    extensionElements = createElement(
      'bpmn:ExtensionElements',
      { values: [] },
      businessObject,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: { extensionElements }
      }
    });
  }

  let extension = getExtensionElement(element, extensionType);

  if (!extension) {
    extension = createElement(
      extensionType,
      { values: [] },
      extensionElements,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [...extensionElements.get('values'), extension]
        }
      }
    });
  }

  const newElement = createElement(
    extensionChild.type,
    {
      name: nextId(extensionChild.label),
      ...(extensionChild.properties || {})
    },
    extension,
    bpmnFactory
  );

  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extension,
      properties: {
        values: [...extension.get('values'), newElement]
      }
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}


export function addElementEvent({ element, bpmnFactory, commandStack, extensionType, extensionChild, injector }) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    addElement({ element, bpmnFactory, commandStack, extensionType, extensionChild });

    if (extensionType === 'customExtension:UserAssignment' || extensionType === 'customExtension:GroupAssignment') {
      const eventBus = injector.get('eventBus');
      eventBus.fire('propertiesPanel.updated', { id: element.id });
    }
  };
}

export function canRemoveAssignment(userAssignment, groupAssignment) {
  return userAssignment.length + groupAssignment.length > 1;
}

export function isAssignmentEmpty(userAssignment, groupAssignment) {
  return userAssignment.length + groupAssignment.length === 0;
}

export async function loadTemplate(templateSelected: Template, currentModeler: BpmnModeler | null) {
  const createdElements: Array<BpmnElement | BpmnConnection> = [];

  try {
    const elementData = JSON.parse(templateSelected!.config);
    const _element = elementData.element;
    const _businessObject = elementData.businessObject;

    const moddle = currentModeler?.get<Moddle>("moddle");
    const elementFactory = currentModeler?.get<ElementFactory>("elementFactory");
    const modeling = currentModeler?.get<Modeling>("modeling");
    const canvas = currentModeler?.get<CanvasWithAuto>("canvas");
    const elementRegistry = currentModeler?.get<ElementRegistry>("elementRegistry");

    const checkDuplicateId = (id: string) => {
      if (elementRegistry?.get(id)) {
        throw new Error(`Duplicate ID found: ${id}`);
      }
    };

    const findEmptyPositionFromCenter = (canvas, newElement) => {
      const viewbox = canvas.viewbox();
      const allElements = parent?.children || [];
      const padding = 10;

      const x = viewbox.x + viewbox.width / 2;

      const overlappingElements = allElements.filter((el) => {
        const elLeft = el.x - el.width / 2;
        const elRight = el.x + el.width / 2;
        const newLeft = x - newElement.width / 2;
        const newRight = x + newElement.width / 2;

        const isOverlapping = !(newRight < elLeft || newLeft > elRight);
        const isNewInsideEl = newLeft >= elLeft && newRight <= elRight;
        const isElInsideNew = elLeft >= newLeft && elRight <= newRight;

        return isOverlapping || isNewInsideEl || isElInsideNew;
      });

      let y;
      if (overlappingElements.length > 0) {
        y =
          Math.min(
            ...overlappingElements.map(
              (el) => el.type !== "bpmn:SequenceFlow" && el.y - padding
            )
          ) -
          newElement.height / 2;
      } else {
        y = viewbox.y + viewbox.height / 2;
      }

      return { x, y };
    };

    const root = canvas.getRootElement() as BpmnElement | null;
    if (!root) return;

    let parent: BpmnParent;

    if (root.type === 'bpmn:Collaboration') {
      const participant = (root.children ?? []).find(
        (child): child is BpmnElement => child.type === 'bpmn:Participant'
      ) as BpmnParent | undefined;

      if (!participant) return;
      parent = participant;
    } else {
      parent = root as BpmnParent;
    }

    if (
      _element.type === "bpmn:ScriptTask" ||
      _element.type === "bpmn:ExclusiveGateway"
    ) {
      checkDuplicateId(_element.id);

      const extensionElements = moddle.create("bpmn:ExtensionElements", {
        values: _businessObject.extensionElements.values.map((ext) =>
          moddle.create(ext.$type, { value: ext.value })
        ),
      });

      const businessObject = moddle.create(
        elementData.businessObject.$type,
        {
          id: _element.id,
          name: _businessObject.name || "",
          extensionElements: extensionElements,
        }
      );

      if (!elementFactory || !modeling || !canvas) return;

      const scriptTask = elementFactory.createShape({
        id: _element.id,
        type: _element.type,
        width: _element.width,
        height: _element.height,
        businessObject,
      }) as BpmnShape;

      const position = findEmptyPositionFromCenter(canvas, scriptTask);

      modeling.createShape(scriptTask, position, parent);
      createdElements.push(scriptTask);

      canvas.scrollToElement(scriptTask);
    } else if (_element.type === "bpmn:SubProcess") {
      const _sequenceFlows = elementData.sequenceFlows;

      checkDuplicateId(_element.id);

      const subProcessBusinessObject = moddle.create("bpmn:SubProcess", {
        id: _element.id,
        ...(_businessObject.loopCharacteristics && {
          loopCharacteristics: moddle.create(
            _businessObject.loopCharacteristics.$type,
            _businessObject.loopCharacteristics.properties || {
              collection: _businessObject.loopCharacteristics.collection,
            } ||
            {}
          ),
        }),
      });

      const subProcess = elementFactory?.create("shape", {
        type: "bpmn:SubProcess",
        width: _element.width,
        height: _element.height,
        isExpanded: true,
        businessObject: subProcessBusinessObject,
      }) as BpmnShape;

      const position = findEmptyPositionFromCenter(canvas, subProcess);
      const differenX = _element.x - position.x + _element.width / 2;
      const differenY = _element.y - position.y + _element.height / 2;

      modeling?.createShape(subProcess, position, parent);
      createdElements.push(subProcess);
      canvas.scrollToElement(subProcess);

      const elementMap = new Map();

      for (const elementChild of _element.children) {
        const child = {
          ..._businessObject.flowElements.find(
            (flowElement: BpmnElement) => flowElement.id === elementChild.id
          ),
          ...elementChild,
        };

        if (child.type !== "bpmn:SequenceFlow" && child.type !== "label") {
          checkDuplicateId(elementChild.id);

          const childExtensionElements =
            child.extensionElements?.values || [];

          const extensionElements = moddle.create(
            "bpmn:ExtensionElements",
            {
              values: childExtensionElements.map((ext) =>
                moddle.create(ext.$type, { value: ext.value })
              ),
            }
          );

          const businessObject = moddle.create(child.type, {
            id: elementChild.id,
            ...(child.name && { name: child.name }),
            extensionElements,
          });

          const childX = child.x - differenX;
          const childY = child.y - differenY;

          const element = elementFactory?.create("shape", {
            type: child.type,
            x: childX + child.width / 2,
            y: childY + child.height / 2,
            width: child.width,
            height: child.height,
            businessObject,
          }) as BpmnShape;

          modeling?.createShape(
            element,
            { x: childX + child.width / 2, y: childY + child.height / 2 },
            subProcess
          );
          createdElements.push(element);
          elementMap.set(elementChild.id, element);
        }
      }

      if (_sequenceFlows.length > 0) {
        _sequenceFlows.forEach((flow) => {
          const {
            sourceRef,
            targetRef,
            waypoints,
            type,
            name,
            extensionElements,
            id,
          } = flow;

          checkDuplicateId(id);

          const sourceElement = elementMap.get(sourceRef);
          const targetElement = elementMap.get(targetRef);

          if (sourceElement && targetElement) {
            const flowExtensionElements =
              extensionElements?.values?.map((ext) =>
                moddle.create(ext.$type, { value: ext.value })
              ) || [];

            const flowBusinessObject = moddle.create(type, {
              id,
              ...(name && { name }),
              sourceRef: sourceElement.businessObject,
              targetRef: targetElement.businessObject,
              ...(flowExtensionElements.length > 0 && {
                extensionElements: moddle.create("bpmn:ExtensionElements", {
                  values: flowExtensionElements,
                }),
                conditionExpression: moddle.create(
                  "bpmn:FormalExpression",
                  { body: "" }
                ),
              }),
            });

            const waypointsTranslate =
              waypoints?.map((point) => ({
                x: point.x - differenX,
                y: point.y - differenY,
                ...(point.original && {
                  original: {
                    x: point.original.x - differenX,
                    y: point.original.y - differenY,
                  },
                }),
              })) || [];

            const connection = modeling?.createConnection(
              sourceElement,
              targetElement,
              {
                type,
                businessObject: flowBusinessObject,
                ...(waypointsTranslate.length > 0 && {
                  waypoints: waypointsTranslate,
                }),
              },
              subProcess
            ) as BpmnConnection;

            createdElements.push(connection);
          } else {
            console.warn(
              `Cannot connect ${sourceRef} to ${targetRef}: One or both elements not found.`
            );
          }
        });
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const modeling = currentModeler?.get<Modeling>("modeling");

    if (createdElements.length > 0) {
      modeling?.removeElements(createdElements as BpmnElement[]);
    }

    let errorMessage: string;
    if (err instanceof Error) {
      errorMessage = err.message;
    } else {
      errorMessage = String(err);
    }

    return { success: false, error: errorMessage };
  }
}

export async function saveTemplate(element: BpmnElement, templateName: string, currentModeler: BpmnModeler | null) {
  try {
    const elementRegistry = currentModeler?.get<ElementRegistry>("elementRegistry");
    const _element = elementRegistry?.get(element.id);
    
    if (!_element) throw new Error(`Element "${element.id}" not found.`);

    const businessObject = _element.businessObject;
    const sequenceFlows = (businessObject.flowElements || [])
      .filter(el => el.$type === 'bpmn:SequenceFlow')
      .map(flow => {
        const child = _element.children?.find(c => c.id === flow.id);
        return {
          id: flow.id,
          type: flow.$type,
          ...(flow.name && { name: flow.name }),
          sourceRef: flow.sourceRef?.id,
          targetRef: flow.targetRef?.id,
          ...(child?.waypoints && { waypoints: child.waypoints }),
          ...(flow.extensionElements && { extensionElements: flow.extensionElements }),
          ...(flow.conditionExpression && { condition: flow.conditionExpression.body })
        };
      });

    const elementData = { element, businessObject, sequenceFlows };

    try {
      const config = JSON.stringify(elementData);
      const result = await createTemplate({ name: templateName, config: config });
      const newTemplate = {
        name: templateName,
        type: element.type,
        config,
        _id: result._id,
        description: ''
      };

      return { success: true, newTemplate };
    } catch {
      return { success: false };

    }
  } catch (error) {
    return { success: false };
  }
}