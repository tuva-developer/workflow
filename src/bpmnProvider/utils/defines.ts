import Ids from "ids";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { without } from "min-dash";
import { getReadonlyMode } from "@/global/appState";
import { createTemplate } from "@/services/templates";
import ElementFactory from "diagram-js/lib/core/ElementFactory";
import type ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import BpmnModeler from "bpmn-js/lib/Modeler";
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type { Moddle } from "bpmn-js/lib/model/Types";
import type { Element as BpmnElement } from "bpmn-js/lib/model/Types";

export type ScriptTaskOrGatewayTemplate = {
  element: {
    type: "bpmn:ScriptTask" | "bpmn:ExclusiveGateway";
    width?: number;
    height?: number;
  };
  businessObject?: ScriptTaskBO | ExclusiveGatewayBO;
};

export type BpmnTypeConnection =
  | "bpmn:SequenceFlow"
  | "bpmn:Association"
  | "bpmn:MessageFlow";

export type BpmnTypeNode =
  | "bpmn:ScriptTask"
  | "bpmn:ExclusiveGateway"
  | "bpmn:SubProcess";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WaypointInput {
  x?: number;
  y?: number;
  original?: { x: number; y: number };
}

export interface Waypoint {
  x: number;
  y: number;
}

export interface LayoutDI {
  $type?: string;
  id?: string;
  bounds?: Bounds;
  waypoint?: WaypointInput[];
  isExpanded?: boolean;
}

export interface LayoutNode {
  id: string;
  type: BpmnTypeNode | BpmnTypeConnection | string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  di?: LayoutDI;
}

export interface BaseBO {
  $type: string;
  id: string;
  name?: string;
  extensionElements?: unknown;
  di?: { waypoint?: WaypointInput[] };
}

export interface EventBO extends BaseBO {
  $type: "bpmn:StartEvent" | "bpmn:EndEvent";
  eventDefinitions?: unknown[];
}

export interface ScriptTaskBO extends BaseBO {
  $type: "bpmn:ScriptTask";
}

export interface ExclusiveGatewayBO extends BaseBO {
  $type: "bpmn:ExclusiveGateway";
}

export interface RefObject {
  $type: string;
  id: string;
  name?: string;
  extensionElements?: unknown;
}

export interface FormalExpressionBO {
  $type: "bpmn:FormalExpression";
  body?: string;
}

export interface SequenceFlowBO extends BaseBO {
  $type: "bpmn:SequenceFlow";
  sourceRef?: RefObject;
  targetRef?: RefObject;
  conditionExpression?: FormalExpressionBO;
}

export type ChildFlowElementBO =
  | EventBO
  | ScriptTaskBO
  | ExclusiveGatewayBO
  | SequenceFlowBO
  | BaseBO;

export interface LayoutSequenceFlow extends LayoutNode {
  type: "bpmn:SequenceFlow";
  waypoints?: WaypointInput[];

  sourceRef?: string;
  targetRef?: string;
}

export interface SubProcessLayout extends LayoutNode {
  type: "bpmn:SubProcess";
  children: LayoutNode[];
  sequenceFlows: LayoutSequenceFlow[];
  di?: LayoutDI & { bounds?: Bounds; isExpanded?: boolean };
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface SubProcessBO extends BaseBO {
  $type: "bpmn:SubProcess";
  name?: string;
  triggeredByEvent?: boolean;
  loopCharacteristics?: unknown;
  flowElements?: ChildFlowElementBO[];
}

export interface SubProcessTemplate {
  element: SubProcessLayout;
  businessObject: SubProcessBO;
  sequenceFlows: SequenceFlowBO[];
}

export interface TemplateSequenceFlow {
  id: string;
  type: "bpmn:SequenceFlow";
  sourceRef: string;
  targetRef: string;
  waypoints?: WaypointInput[];
}

export function getExtension(businessObject, type) {
  if (!businessObject.extensionElements) {
    return null;
  }

  return businessObject.extensionElements.values.filter(function (e) {
    return e.$type === type;
  })[0];
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix + "_");
}

export function setEntriesReadonly(entries) {
  const isReadOnlyMode = getReadonlyMode();
  return entries.map((entry) => ({
    ...entry,
    disabled: isReadOnlyMode,
  }));
}

export function getExtensionProperties_Extension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, "customExtension:Properties");
}

export function getExtensionProperties(element) {
  const extensions = getExtensionProperties_Extension(element);
  return extensions && extensions.get("values");
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function removeExtensionProperty({
  commandStack,
  element,
  extensionProperty,
}) {
  return function (event) {
    event.stopPropagation();

    const extension = getExtensionProperties_Extension(element);

    if (!extension) {
      return;
    }

    const parameters = without(extension.get("values"), extensionProperty);

    commandStack.execute("element.updateModdleProperties", {
      element,
      moddleElement: extension,
      properties: {
        values: parameters,
      },
    });
  };
}

export function addExtensionProperty({ element, bpmnFactory, commandStack }) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    const commands: unknown[] = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get("extensionElements");

    if (!extensionElements) {
      extensionElements = createElement(
        "bpmn:ExtensionElements",
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: "element.updateModdleProperties",
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements },
        },
      });
    }

    let extension = getExtensionProperties_Extension(element);

    if (!extension) {
      extension = createElement(
        "customExtension:Properties",
        { values: [] },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: "element.updateModdleProperties",
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [...extensionElements.get("values"), extension],
          },
        },
      });
    }

    const newParameter = createElement(
      "customExtension:Property",
      {
        name: nextId("Property_"),
        value: "",
      },
      extension,
      bpmnFactory
    );

    commands.push({
      cmd: "element.updateModdleProperties",
      context: {
        element,
        moddleElement: extension,
        properties: {
          values: [...extension.get("values"), newParameter],
        },
      },
    });

    commandStack.execute("properties-panel.multi-command-executor", commands);
  };
}

export function getExtensionElement(element, extensionType) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, extensionType);
}

export function getExtensionValues(
  element,
  extensionType,
  valuesKey = "values"
) {
  const extension = getExtensionElement(element, extensionType);
  return extension && extension.get(valuesKey);
}

export function removeElement({
  commandStack,
  element,
  extensionType,
  childElement,
}) {
  const extension = getExtensionElement(element, extensionType);

  if (!extension) {
    return;
  }

  const parameters = without(extension.get("values"), childElement);

  commandStack.execute("element.updateModdleProperties", {
    element,
    moddleElement: extension,
    properties: {
      values: parameters,
    },
  });
}

export function removeElementEvent({
  commandStack,
  element,
  extensionType,
  childElement,
}) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    removeElement({ commandStack, element, extensionType, childElement });
  };
}

export function addElement({
  element,
  bpmnFactory,
  commandStack,
  extensionType,
  extensionChild,
}) {
  const commands: unknown[] = [];

  const businessObject = getBusinessObject(element);

  let extensionElements = businessObject.get("extensionElements");

  if (!extensionElements) {
    extensionElements = createElement(
      "bpmn:ExtensionElements",
      { values: [] },
      businessObject,
      bpmnFactory
    );

    commands.push({
      cmd: "element.updateModdleProperties",
      context: {
        element,
        moddleElement: businessObject,
        properties: { extensionElements },
      },
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
      cmd: "element.updateModdleProperties",
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [...extensionElements.get("values"), extension],
        },
      },
    });
  }

  const newElement = createElement(
    extensionChild.type,
    {
      name: nextId(extensionChild.label),
      ...(extensionChild.properties || {}),
    },
    extension,
    bpmnFactory
  );

  commands.push({
    cmd: "element.updateModdleProperties",
    context: {
      element,
      moddleElement: extension,
      properties: {
        values: [...extension.get("values"), newElement],
      },
    },
  });

  commandStack.execute("properties-panel.multi-command-executor", commands);
}

export function addElementEvent({
  element,
  bpmnFactory,
  commandStack,
  extensionType,
  extensionChild,
  injector,
}) {
  return function (event: MouseEvent): void {
    event.stopPropagation();

    addElement({
      element,
      bpmnFactory,
      commandStack,
      extensionType,
      extensionChild,
    });

    if (
      extensionType === "customExtension:UserAssignment" ||
      extensionType === "customExtension:GroupAssignment"
    ) {
      const eventBus = injector.get("eventBus");
      eventBus.fire("propertiesPanel.updated", { id: element.id });
    }
  };
}

function nextUniqueId(elementRegistry, prefix = "ID_") {
  let id = `${prefix}${Date.now().toString(36)}`;
  while (elementRegistry?.get?.(id)) {
    id = `${prefix}${Date.now().toString(36)}`;
  }
  return id;
}

function rehydrateModdle(moddle, node) {
  if (node == null) return node;
  if (Array.isArray(node)) return node.map((n) => rehydrateModdle(moddle, n));

  if (typeof node !== "object") return node;

  if (!node.$type) {
    const obj = {};
    for (const k of Object.keys(node)) {
      if (k === "$parent") continue;
      obj[k] = rehydrateModdle(moddle, node[k]);
    }
    return obj;
  }

  const props = {};
  for (const k of Object.keys(node)) {
    if (k === "$type" || k === "$parent") continue;
    props[k] = rehydrateModdle(moddle, node[k]);
  }
  return moddle.create(node.$type, props);
}

function buildSafeExtensionElements(moddle, srcExt) {
  const values = srcExt?.values || [];
  if (!values.length) return null;

  const hydratedValues = values
    .map((v) => rehydrateModdle(moddle, v))
    .filter(Boolean);

  if (!hydratedValues.length) return null;

  return moddle.create("bpmn:ExtensionElements", { values: hydratedValues });
}

function findEmptyPositionFromCenter(
  canvas,
  elementRegistry,
  size: { w: number; h: number }
) {
  const viewbox = canvas.viewbox();
  const center = {
    x: viewbox.x + viewbox.width / 2,
    y: viewbox.y + viewbox.height / 2,
  };
  const elements = elementRegistry.filter(
    (e) => e.waypoints == null && !e.labelTarget
  );

  const overlaps = (x: number, y: number) => {
    const r = { x: x - size.w / 2, y: y - size.h / 2, w: size.w, h: size.h };
    return elements.some((e) => {
      const b = e.bounds || {
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
      };
      if (!b) return false;
      return !(
        r.x + r.w < b.x ||
        r.x > b.x + b.width ||
        r.y + r.h < b.y ||
        r.y > b.y + b.height
      );
    });
  };

  if (!overlaps(center.x, center.y)) return center;

  const step = 40;
  const dirs = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  for (let ring = 1; ring <= 24; ring++) {
    for (const [dx, dy] of dirs) {
      const x = center.x + dx * step * ring;
      const y = center.y + dy * step * ring;
      if (!overlaps(x, y)) return { x, y };
    }
  }
  return center;
}

function getInsertParent(canvas) {
  const root = canvas.getRootElement();
  if (!root) return null;
  if (root.type === "bpmn:Collaboration") {
    const participant = (root.children ?? []).find(
      (c) => c.type === "bpmn:Participant"
    );
    return participant || null;
  }
  return root;
}

function isConnectionType(t: string): t is BpmnTypeConnection {
  return (
    t === "bpmn:SequenceFlow" ||
    t === "bpmn:Association" ||
    t === "bpmn:MessageFlow"
  );
}

function isSequenceFlowBO(fe: ChildFlowElementBO): fe is SequenceFlowBO {
  return fe.$type === "bpmn:SequenceFlow";
}

function isScriptTaskBO(bo: BaseBO | undefined): bo is ScriptTaskBO {
  return !!bo && bo.$type === "bpmn:ScriptTask";
}

function getBoundsFromLayout(
  lay: LayoutNode | null | undefined
): Bounds | null {
  if (!lay) return null;
  const b = lay.di?.bounds as Bounds | undefined;
  if (b && typeof b.x === "number" && typeof b.y === "number") {
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  }
  if (
    typeof lay.x === "number" &&
    typeof lay.y === "number" &&
    typeof lay.width === "number" &&
    typeof lay.height === "number"
  ) {
    return { x: lay.x, y: lay.y, width: lay.width, height: lay.height };
  }
  return null;
}

function normWaypoint(p: WaypointInput): Waypoint {
  if (typeof p.x === "number" && typeof p.y === "number")
    return { x: p.x, y: p.y };
  if (
    p.original &&
    typeof p.original.x === "number" &&
    typeof p.original.y === "number"
  ) {
    return { x: p.original.x, y: p.original.y };
  }
  return { x: 0, y: 0 };
}

function defaultW(t: string): number {
  if (t.endsWith("Gateway")) return 50;
  if (t.endsWith("Event")) return 36;
  return 100;
}
function defaultH(t: string): number {
  if (t.endsWith("Gateway")) return 50;
  if (t.endsWith("Event")) return 36;
  return 80;
}

function buildScriptTaskProps(moddle, srcBO) {
  const props: { name: string; scriptFormat: string; script: unknown } = {
    name: "",
    scriptFormat: "JavaScript",
    script: null,
  };

  if (srcBO?.name != null) props.name = srcBO.name;

  if (srcBO?.scriptFormat) props.scriptFormat = srcBO.scriptFormat;

  if (srcBO?.script != null) {
    if (typeof srcBO.script === "string") {
      props.script = srcBO.script;
    } else if (srcBO.script.$type === "bpmn:Script") {
      const body = srcBO.script.body ?? "";
      props.script = moddle.create("bpmn:Script", { body });
    }
  }

  const ignore = new Set([
    "$type",
    "$parent",
    "id",
    "name",
    "script",
    "scriptFormat",
    "extensionElements",
  ]);
  for (const k of Object.keys(srcBO || {})) {
    if (ignore.has(k)) continue;
    props[k] = rehydrateModdle(moddle, srcBO[k]);
  }

  return props;
}

export async function loadScriptTaskOrGateway(
  templateConfig: ScriptTaskOrGatewayTemplate,
  currentModeler: BpmnModeler | null
): Promise<
  { success: true; created: BpmnElement } | { success: false; error: unknown }
> {
  const createdElements: BpmnElement[] = [];

  try {
    const { element, businessObject } = templateConfig;

    const moddle = currentModeler?.get<Moddle>("moddle");
    const elementFactory =
      currentModeler?.get<ElementFactory>("elementFactory");
    const modeling = currentModeler?.get<Modeling>("modeling");
    const canvas = currentModeler?.get<CanvasWithAuto>("canvas");
    const elementRegistry =
      currentModeler?.get<ElementRegistry>("elementRegistry");

    if (
      !moddle ||
      !elementFactory ||
      !modeling ||
      !canvas ||
      !elementRegistry
    ) {
      throw new Error("Modeler services are not ready.");
    }

    const parent = getInsertParent(canvas);
    if (!parent) throw new Error("No suitable parent element.");

    const draft = elementFactory.createShape({
      type: element.type,
      width: element.width,
      height: element.height,
      id: nextUniqueId(elementRegistry, "Node_"),
    });

    const pos = findEmptyPositionFromCenter(canvas, elementRegistry, {
      w: draft.width ?? 100,
      h: draft.height ?? 80,
    });

    const created = modeling.createShape(draft, pos, parent);
    createdElements.push(created);

    let updateProps: Record<string, unknown> = {};

    if (isScriptTaskBO(businessObject)) {
      updateProps = buildScriptTaskProps(moddle, businessObject);
    } else if (
      businessObject &&
      businessObject.$type === "bpmn:ExclusiveGateway"
    ) {
      const ignore = new Set(["$type", "$parent", "id", "extensionElements"]);
      (Object.keys(businessObject) as Array<keyof ExclusiveGatewayBO>).forEach(
        (k) => {
          if (ignore.has(k as string)) return;
          updateProps[k as string] = rehydrateModdle(moddle, businessObject[k]);
        }
      );
    }

    const ext = buildSafeExtensionElements(
      moddle,
      businessObject?.extensionElements
    );
    if (ext) updateProps.extensionElements = ext;

    updateProps.id = nextUniqueId(elementRegistry, "Activity_");
    modeling.updateProperties(created, updateProps);

    if (businessObject?.name) {
      modeling.updateLabel(created, businessObject.name);
    }

    canvas.scrollToElement(created);
    return { success: true, created };
  } catch (err: unknown) {
    try {
      const modeling = currentModeler?.get<Modeling>("modeling");
      if (createdElements.length) modeling?.removeElements(createdElements);
    } catch {
      console.error("Failed to rollback created elements after error.");
    }
    return { success: false, error: err };
  }
}

export async function loadSubProcessWithFlow(
  templateConfig: SubProcessTemplate,
  currentModeler: BpmnModeler | null
): Promise<
  { success: true; created: BpmnElement } | { success: false; error: unknown }
> {
  const createdElements: BpmnElement[] = [];

  try {
    const spLayout = templateConfig.element;
    const spBO = templateConfig.businessObject;

    if (!spLayout || spLayout.type !== "bpmn:SubProcess") {
      throw new Error("Template is not a SubProcess.");
    }

    const moddle = currentModeler?.get<Moddle>("moddle");
    const elementFactory =
      currentModeler?.get<ElementFactory>("elementFactory");
    const modeling = currentModeler?.get<Modeling>("modeling");
    const canvas = currentModeler?.get<CanvasWithAuto>("canvas");
    const elementRegistry =
      currentModeler?.get<ElementRegistry>("elementRegistry");

    if (
      !moddle ||
      !elementFactory ||
      !modeling ||
      !canvas ||
      !elementRegistry
    ) {
      throw new Error("Modeler services are not ready.");
    }

    const parent = getInsertParent(canvas);
    if (!parent) throw new Error("No suitable parent element.");

    const spDraft = elementFactory.createShape({
      type: "bpmn:SubProcess",
      width: spLayout.width,
      height: spLayout.height,
      isExpanded: spLayout?.di?.isExpanded !== false,
      id: nextUniqueId(elementRegistry, "Node_"),
    });

    const spPos = findEmptyPositionFromCenter(canvas, elementRegistry, {
      w: spDraft.width ?? 800,
      h: spDraft.height ?? 400,
    });

    const sp = modeling.createShape(spDraft, spPos, parent);
    createdElements.push(sp);

    const spProps: Record<string, unknown> = {};
    const ignoreSP: ReadonlySet<string> = new Set([
      "$type",
      "$parent",
      "id",
      "di",
      "extensionElements",
      "flowElements",
      "artifacts",
      "lanes",
      "laneSets",
    ]);

    (Object.keys(spBO) as Array<keyof SubProcessBO>).forEach((k) => {
      if (ignoreSP.has(k as string)) return;
      if (k === "loopCharacteristics" && spBO.loopCharacteristics) {
        spProps.loopCharacteristics = rehydrateModdle(
          moddle,
          spBO.loopCharacteristics
        );
      } else {
        spProps[k as string] = rehydrateModdle(moddle, spBO[k]);
      }
    });

    const spExt = buildSafeExtensionElements(moddle, spBO.extensionElements);
    if (spExt) spProps.extensionElements = spExt;

    spProps.id = nextUniqueId(elementRegistry, "Activity_");
    if (Object.keys(spProps).length) modeling.updateProperties(sp, spProps);
    if (spBO.name) modeling.updateLabel(sp, spBO.name);

    const childLayoutById: Record<string, LayoutNode> = {};
    (spLayout.children || []).forEach((c) => (childLayoutById[c.id] = c));
    const semanticById: Record<string, ChildFlowElementBO> = {};
    (spBO.flowElements || []).forEach((fe) => (semanticById[fe.id] = fe));

    const idToChildEl: Record<string, BpmnElement> = {};

    const spBounds = getBoundsFromLayout(spLayout);
    const baseX = spBounds?.x ?? spLayout.x;
    const baseY = spBounds?.y ?? spLayout.y;

    const toRelativeFromAbs = (abs: {
      x: number;
      y: number;
    }): { x: number; y: number } => ({
      x: sp.x + (abs.x - baseX),
      y: sp.y + (abs.y - baseY),
    });

    const toRelativeMidFromBounds = (b: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): { x: number; y: number } => {
      const mid = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      return toRelativeFromAbs(mid);
    };

    for (const fe of spBO.flowElements || []) {
      if (isSequenceFlowBO(fe) || isConnectionType(fe.$type)) continue;

      const lay = childLayoutById[fe.id];
      const lb = getBoundsFromLayout(lay);

      const w = lb?.width ?? defaultW(fe.$type);
      const h = lb?.height ?? defaultH(fe.$type);

      const draft = elementFactory.createShape({
        type: fe.$type,
        width: w,
        height: h,
        id: nextUniqueId(elementRegistry, "Node_"),
      });

      const pos = lb
        ? toRelativeMidFromBounds({ x: lb.x, y: lb.y, width: w, height: h })
        : toRelativeFromAbs({
            x: (baseX ?? 0) + 24 + w / 2,
            y: (baseY ?? 0) + 24 + h / 2,
          });

      const child = modeling.createShape(draft, pos, sp);
      createdElements.push(child);
      idToChildEl[fe.id] = child;

      const ignoreChild: ReadonlySet<string> = new Set([
        "$type",
        "$parent",
        "id",
        "extensionElements",
      ]);
      const props: Record<string, unknown> = {};
      (Object.keys(fe) as Array<keyof ChildFlowElementBO>).forEach((k) => {
        if (ignoreChild.has(k as string)) return;
        props[k as string] = rehydrateModdle(moddle, fe[k]);
      });

      const ext = buildSafeExtensionElements(moddle, fe.extensionElements);
      if (ext) props.extensionElements = ext;

      props.id = nextUniqueId(elementRegistry, "Activity_");
      if (Object.keys(props).length) modeling.updateProperties(child, props);
      if (fe.name) modeling.updateLabel(child, fe.name);
    }

    const semanticFlowById: Record<string, SequenceFlowBO> = {};
    (spBO.flowElements || []).forEach((fe) => {
      if (fe.$type === "bpmn:SequenceFlow") {
        semanticFlowById[fe.id] = fe as SequenceFlowBO;
      }
    });

    type TemplateSequenceFlow = {
      id: string;
      type: "bpmn:SequenceFlow";
      sourceRef: string;
      targetRef: string;
      waypoints?: WaypointInput[];
    };

    const templateFlows: TemplateSequenceFlow[] =
      (templateConfig as unknown as { sequenceFlows?: TemplateSequenceFlow[] })
        .sequenceFlows ?? [];

    for (const sf of templateFlows) {
      const source = idToChildEl[sf.sourceRef];
      const target = idToChildEl[sf.targetRef];
      if (!source || !target) continue;

      const waypoints: Waypoint[] = (sf.waypoints ?? []).map((p) => {
        const n = normWaypoint(p);
        return toRelativeFromAbs(n);
      });

      const connDraft = elementFactory.createConnection({
        type: "bpmn:SequenceFlow",
        source,
        target,
        id: nextUniqueId(elementRegistry, "Flow_"),
        waypoints: waypoints.length ? waypoints : undefined,
      });

      const conn = modeling.createConnection(source, target, connDraft, sp);
      createdElements.push(conn);

      const sem = semanticFlowById[sf.id];
      if (sem) {
        const ignoreFlow: ReadonlySet<string> = new Set([
          "$type",
          "$parent",
          "id",
          "extensionElements",
          "sourceRef",
          "targetRef",
          "di",
        ]);

        const flowProps: Record<string, unknown> = {};
        (Object.keys(sem) as Array<keyof SequenceFlowBO>).forEach((k) => {
          if (ignoreFlow.has(k as string)) return;
          flowProps[k as string] = rehydrateModdle(moddle, sem[k]);
        });

        const fExt = buildSafeExtensionElements(moddle, sem.extensionElements);
        if (fExt) flowProps.extensionElements = fExt;

        if (Object.keys(flowProps).length)
          modeling.updateProperties(conn, flowProps);
        if ((sem as BaseBO).name)
          modeling.updateLabel(conn, (sem as BaseBO).name as string);
      }
    }

    canvas.scrollToElement(sp);
    return { success: true, created: sp };
  } catch (err: unknown) {
    try {
      const modeling = currentModeler?.get<Modeling>("modeling");
      if (createdElements.length) modeling?.removeElements(createdElements);
    } catch {
      console.error("Failed to rollback created elements after error.");
    }
    return { success: false, error: err };
  }
}

export async function loadTemplate(
  templateSelected: Template,
  currentModeler: BpmnModeler | null
) {
  try {
    const templateConfig = JSON.parse(templateSelected!.config);
    if (templateConfig.element.type === "bpmn:SubProcess") {
      return await loadSubProcessWithFlow(templateConfig, currentModeler);
    } else {
      return await loadScriptTaskOrGateway(templateConfig, currentModeler);
    }
  } catch {
    return { success: false };
  }
}

export async function saveTemplate(
  element: BpmnElement,
  currentModeler: BpmnModeler | null,
  templateName: string,
  templateDescription?: string
) {
  try {
    const elementRegistry =
      currentModeler?.get<ElementRegistry>("elementRegistry");
    const _element = elementRegistry?.get(element.id);

    if (!_element) throw new Error(`Element "${element.id}" not found.`);

    const businessObject = _element.businessObject;
    const sequenceFlows = (businessObject.flowElements || [])
      .filter((el) => el.$type === "bpmn:SequenceFlow")
      .map((flow) => {
        const child = _element.children?.find((c) => c.id === flow.id);
        return {
          id: flow.id,
          type: flow.$type,
          ...(flow.name && { name: flow.name }),
          sourceRef: flow.sourceRef?.id,
          targetRef: flow.targetRef?.id,
          ...(child?.waypoints && { waypoints: child.waypoints }),
          ...(flow.extensionElements && {
            extensionElements: flow.extensionElements,
          }),
          ...(flow.conditionExpression && {
            condition: flow.conditionExpression.body,
          }),
        };
      });

    const elementData = { element, businessObject, sequenceFlows };

    try {
      const config = JSON.stringify(elementData);
      const result = await createTemplate({
        name: templateName,
        description: templateDescription,
        config: config,
      });
      const newTemplate = {
        name: templateName,
        type: element.type,
        config,
        _id: result._id,
        description: templateDescription || "",
      };

      return { success: true, newTemplate };
    } catch {
      return { success: false };
    }
  } catch (error) {
    return { success: false };
  }
}

export function readFunctionsFromCollaboration(element) {
  if (!element) return [];

  let root = element;
  while (root?.parent) {
    root = root.parent;
  }

  const bo = root?.businessObject;

  if (!bo || bo.$type !== "bpmn:Collaboration") {
    console.warn("FunctionLibrary is only stored inside bpmn:Collaboration");
    return [];
  }

  const exts = bo.extensionElements?.values || [];
  const lib = exts.find((v) => v?.$type === "customExtension:FunctionLibrary");

  if (!lib?.functions) return [];

  return lib.functions
    .map((fn) => ({
      id: fn.id,
      caption: fn.caption || fn.value || fn.id,
      value: fn.value || fn.caption || fn.id,
      code: fn.code || "",
    }))
    .filter((x) => !!x.value);
}
