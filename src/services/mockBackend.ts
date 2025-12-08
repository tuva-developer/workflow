import { v4 as uuidv4 } from "uuid";
import {
  AddFormInput,
  AddGroupInput,
  AddModelCategoryInput,
  AddModelTypeInput,
  AddScheduleInput,
  AddTemplateInput,
  AIChatInput,
  ChangePassWordInput,
  CreateModelInput,
  CreateUserInput,
  DebugModelInput,
  DeleteGroupInput,
  DeleteModelCategoryInput,
  DeleteModelInput,
  DeleteModelTypeInput,
  DeleteScheduleInput,
  DeleteTemplateInput,
  DeleteUserInput,
  FormQuery,
  GroupQuery,
  InstanceQuery,
  InvokeItemInput,
  ModelCategoryQuery,
  ModelQuery,
  ModelTypeQuery,
  ModelsVariant,
  ModelPermission,
  PagedForms,
  PagedGroups,
  PagedInstances,
  PagedModelCategories,
  PagedModelTypes,
  PagedModels,
  PagedRemoteFunctions,
  PagedSchedules,
  PagedTasks,
  PagedTemplates,
  PagedUsers,
  RemoteFunction,
  RunModelInput,
  ScheduleQuery,
  SetReadOnlyInput,
  TaskQuery,
  TemplateQuery,
  UpdateFormInput,
  UpdateGroupInput,
  UpdateModelCategoryInput,
  UpdateModelInput,
  UpdateModelTypeInput,
  UpdateScheduleInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  UserQuery,
} from "./types";
type CreateModelResponse = { id: string };
type LoginInput = { username: string; password: string };

const defaultModelConfig = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:customExtension="http://example.com/form" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:collaboration id="Collaboration_12sx3d4">
    <bpmn2:participant id="Participant_0ucrr7j" processRef="Process_1" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="Event_03j5bwg">
      <bpmn2:outgoing>Flow_0n0nl9r</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="Event_1jkrjpn">
      <bpmn2:incoming>Flow_0k23ogn</bpmn2:incoming>
      <bpmn2:incoming>Flow_05xwxsu</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:scriptTask id="Activity_0o4ln7i">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0n0nl9r</bpmn2:incoming>
      <bpmn2:outgoing>Flow_08h987e</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0f67no2</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:sequenceFlow id="Flow_0n0nl9r" sourceRef="Event_03j5bwg" targetRef="Activity_0o4ln7i" />
    <bpmn2:scriptTask id="Activity_1d7r24y">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0f67no2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_05xwxsu</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:scriptTask id="Activity_158tglz">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_08h987e</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0k23ogn</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:sequenceFlow id="Flow_08h987e" sourceRef="Activity_0o4ln7i" targetRef="Activity_158tglz" />
    <bpmn2:sequenceFlow id="Flow_0k23ogn" sourceRef="Activity_158tglz" targetRef="Event_1jkrjpn" />
    <bpmn2:sequenceFlow id="Flow_0f67no2" sourceRef="Activity_0o4ln7i" targetRef="Activity_1d7r24y">
      <bpmn2:extensionElements>
        <customExtension:conditionType>Script</customExtension:conditionType>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>activity.setOutput(false);</customExtension:script>
      </bpmn2:extensionElements>
    </bpmn2:sequenceFlow>
    <bpmn2:sequenceFlow id="Flow_05xwxsu" sourceRef="Activity_1d7r24y" targetRef="Event_1jkrjpn">
      <bpmn2:extensionElements>
        <customExtension:conditionType>Script</customExtension:conditionType>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>activity.setOutput(true);</customExtension:script>
      </bpmn2:extensionElements>
    </bpmn2:sequenceFlow>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_12sx3d4">
      <bpmndi:BPMNShape id="Participant_0ucrr7j_di" bpmnElement="Participant_0ucrr7j" isHorizontal="true">
        <dc:Bounds x="-330" y="-220" width="1030" height="250" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_03j5bwg_di" bpmnElement="Event_03j5bwg">
        <dc:Bounds x="-248" y="-128" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1jkrjpn_di" bpmnElement="Event_1jkrjpn">
        <dc:Bounds x="502" y="-128" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0o4ln7i_di" bpmnElement="Activity_0o4ln7i">
        <dc:Bounds x="-80" y="-150" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1d7r24y_di" bpmnElement="Activity_1d7r24y">
        <dc:Bounds x="160" y="-200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_158tglz_di" bpmnElement="Activity_158tglz">
        <dc:Bounds x="160" y="-80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_0n0nl9r_di" bpmnElement="Flow_0n0nl9r">
        <di:waypoint x="-212" y="-110" />
        <di:waypoint x="-80" y="-110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_08h987e_di" bpmnElement="Flow_08h987e">
        <di:waypoint x="20" y="-110" />
        <di:waypoint x="90" y="-110" />
        <di:waypoint x="90" y="-40" />
        <di:waypoint x="160" y="-40" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0k23ogn_di" bpmnElement="Flow_0k23ogn">
        <di:waypoint x="260" y="-40" />
        <di:waypoint x="381" y="-40" />
        <di:waypoint x="381" y="-110" />
        <di:waypoint x="502" y="-110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0f67no2_di" bpmnElement="Flow_0f67no2">
        <di:waypoint x="20" y="-110" />
        <di:waypoint x="90" y="-110" />
        <di:waypoint x="90" y="-160" />
        <di:waypoint x="160" y="-160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_05xwxsu_di" bpmnElement="Flow_05xwxsu">
        <di:waypoint x="260" y="-160" />
        <di:waypoint x="381" y="-160" />
        <di:waypoint x="381" y="-110" />
        <di:waypoint x="502" y="-110" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;

const copy = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const delay = <T>(value: T, ms = 80): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(copy(value)), ms));

const paginate = <T extends Record<string, unknown>>(
  items: T[],
  page = 1,
  limit = items.length
) => {
  const safePage = page < 1 ? 1 : page;
  const safeLimit = limit < 1 ? items.length || 1 : limit;
  const start = (safePage - 1) * safeLimit;
  const sliced = items.slice(start, start + safeLimit);
  const totalPages = Math.max(1, Math.ceil(items.length / safeLimit));

  return {
    items: sliced,
    total: items.length,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
};

const matchesSearch = (text: string | undefined, search?: string) => {
  if (!search) return true;
  return (text ?? "").toLowerCase().includes(search.toLowerCase());
};

const nowIso = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}-${uuidv4().slice(0, 8)}`;

const sampleUsers: User[] = [
  {
    userId: "u-admin",
    fullname: "Alex Admin",
    email: "alex.admin@example.com",
    phone: "555-1001",
    address: "123 Demo Avenue",
    created_at: "2024-02-12T08:00:00.000Z",
    updated_at: "2024-11-05T10:00:00.000Z",
    roles: ["Admin", "Editor", "Executor"],
    permissions: ["*"],
    tenantId: "tenant-demo",
  },
  {
    userId: "u-designer",
    fullname: "Daisy Designer",
    email: "daisy.designer@example.com",
    phone: "555-1002",
    address: "78 Workflow Rd",
    created_at: "2024-03-01T09:15:00.000Z",
    updated_at: "2024-10-10T12:45:00.000Z",
    roles: ["Editor", "Invoker"],
    permissions: ["models:edit", "models:run"],
    tenantId: "tenant-demo",
  },
  {
    userId: "u-viewer",
    fullname: "Casey Viewer",
    email: "casey.viewer@example.com",
    phone: "555-1003",
    address: "9 Sandbox Blvd",
    created_at: "2024-05-20T14:00:00.000Z",
    updated_at: "2024-11-20T15:00:00.000Z",
    roles: ["User"],
    permissions: ["models:view"],
    tenantId: "tenant-demo",
  },
];

const sampleGroups: Group[] = [
  {
    _id: "g-ops",
    name: "Operations",
    description: "Handles daily operations",
    members: ["u-admin", "u-designer"],
    created_at: "2024-04-01T08:00:00.000Z",
    updated_at: "2024-09-01T08:00:00.000Z",
  },
  {
    _id: "g-auditors",
    name: "Auditors",
    description: "Review process outputs",
    members: ["u-viewer"],
    created_at: "2024-06-15T08:00:00.000Z",
    updated_at: "2024-08-15T08:00:00.000Z",
  },
];

const sampleModelTypes: ModelType[] = [
  {
    _id: "mt-bpmn",
    name: "BPMN Workflow",
    description: "Standard BPMN 2.0 process",
    created_at: "2024-01-10T08:00:00.000Z",
    updated_at: "2024-09-10T08:00:00.000Z",
  },
  {
    _id: "mt-integration",
    name: "Integration",
    description: "External system orchestration",
    created_at: "2024-02-10T08:00:00.000Z",
    updated_at: "2024-10-02T08:00:00.000Z",
  },
];

const sampleModelCategories: ModelCategory[] = [
  {
    _id: "mc-hr",
    name: "HR",
    description: "Human resources processes",
    created_at: "2024-02-15T08:00:00.000Z",
    updated_at: "2024-09-15T08:00:00.000Z",
  },
  {
    _id: "mc-ops",
    name: "Operations",
    description: "Operational workflows",
    created_at: "2024-03-05T08:00:00.000Z",
    updated_at: "2024-09-20T08:00:00.000Z",
  },
];

const sampleModels: Model[] = [
  {
    _id: "m-onboard",
    _id_version: "m-onboard-v1",
    name: "Employee Onboarding",
    description: "Collect documents, approvals and provisioning tasks.",
    status: "active",
    config: defaultModelConfig,
    read_only: false,
    categoryId: "mc-hr",
    typeId: "mt-bpmn",
    owner: "u-admin",
    created_at: "2024-04-02T08:00:00.000Z",
    updated_at: "2024-11-02T08:00:00.000Z",
  },
  {
    _id: "m-incident",
    _id_version: "m-incident-v2",
    name: "Incident Response",
    description: "Triage, contain and resolve incidents.",
    status: "active",
    config: defaultModelConfig,
    read_only: true,
    categoryId: "mc-ops",
    typeId: "mt-bpmn",
    owner: "u-designer",
    created_at: "2024-05-12T08:00:00.000Z",
    updated_at: "2024-11-12T08:00:00.000Z",
  },
  {
    _id: "m-survey",
    _id_version: "m-survey-v1",
    name: "Customer Survey",
    description: "Send and aggregate survey results.",
    status: "draft",
    config: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:customExtension="http://example.com/form" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:collaboration id="Collaboration_12sx3d4">
    <bpmn2:participant id="Participant_0ucrr7j" processRef="Process_1" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:endEvent id="Event_1jkrjpn">
      <bpmn2:incoming>Flow_0k23ogn</bpmn2:incoming>
      <bpmn2:incoming>Flow_05xwxsu</bpmn2:incoming>
      <bpmn2:incoming>Flow_0tyj3ai</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_0n0nl9r" sourceRef="Event_03j5bwg" targetRef="Activity_0o4ln7i" />
    <bpmn2:scriptTask id="Activity_1d7r24y">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0f67no2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_05xwxsu</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:scriptTask id="Activity_158tglz">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_08h987e</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0k23ogn</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:sequenceFlow id="Flow_08h987e" sourceRef="Activity_0o4ln7i" targetRef="Activity_158tglz" />
    <bpmn2:sequenceFlow id="Flow_0k23ogn" sourceRef="Activity_158tglz" targetRef="Event_1jkrjpn" />
    <bpmn2:sequenceFlow id="Flow_0f67no2" sourceRef="Activity_0o4ln7i" targetRef="Activity_1d7r24y">
      <bpmn2:extensionElements>
        <customExtension:conditionType>Script</customExtension:conditionType>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>activity.setOutput(false);</customExtension:script>
      </bpmn2:extensionElements>
    </bpmn2:sequenceFlow>
    <bpmn2:sequenceFlow id="Flow_05xwxsu" sourceRef="Activity_1d7r24y" targetRef="Event_1jkrjpn">
      <bpmn2:extensionElements>
        <customExtension:conditionType>Script</customExtension:conditionType>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>activity.setOutput(true);</customExtension:script>
      </bpmn2:extensionElements>
    </bpmn2:sequenceFlow>
    <bpmn2:scriptTask id="Activity_0o4ln7i">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0n0nl9r</bpmn2:incoming>
      <bpmn2:outgoing>Flow_08h987e</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0f67no2</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_0rb6pve</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:startEvent id="Event_03j5bwg">
      <bpmn2:outgoing>Flow_0n0nl9r</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="Flow_0rb6pve" sourceRef="Activity_0o4ln7i" targetRef="Activity_07mamby" />
    <bpmn2:sequenceFlow id="Flow_1qcama4" sourceRef="Activity_07mamby" targetRef="Activity_06aef4z" />
    <bpmn2:scriptTask id="Activity_06aef4z" name="">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_1qcama4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0tyj3ai</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:userTask id="Activity_07mamby" name="">
      <bpmn2:extensionElements>
        <customExtension:userAssignment>
          <customExtension:assignee value="u-admin" name="Assignee" />
        </customExtension:userAssignment>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0rb6pve</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1qcama4</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0tyj3ai" sourceRef="Activity_06aef4z" targetRef="Event_1jkrjpn" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_12sx3d4">
      <bpmndi:BPMNShape id="Participant_0ucrr7j_di" bpmnElement="Participant_0ucrr7j" isHorizontal="true">
        <dc:Bounds x="-330" y="-220" width="1030" height="460" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1jkrjpn_di" bpmnElement="Event_1jkrjpn">
        <dc:Bounds x="502" y="-128" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1d7r24y_di" bpmnElement="Activity_1d7r24y">
        <dc:Bounds x="160" y="-200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_158tglz_di" bpmnElement="Activity_158tglz">
        <dc:Bounds x="160" y="-80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0o4ln7i_di" bpmnElement="Activity_0o4ln7i">
        <dc:Bounds x="-100" y="-70" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_03j5bwg_di" bpmnElement="Event_03j5bwg">
        <dc:Bounds x="-268" y="-48" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_10alata_di" bpmnElement="Activity_06aef4z">
        <dc:Bounds x="420" y="40" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_020rhx6_di" bpmnElement="Activity_07mamby">
        <dc:Bounds x="160" y="40" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_0n0nl9r_di" bpmnElement="Flow_0n0nl9r">
        <di:waypoint x="-232" y="-30" />
        <di:waypoint x="-100" y="-30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_08h987e_di" bpmnElement="Flow_08h987e">
        <di:waypoint x="0" y="-30" />
        <di:waypoint x="90" y="-30" />
        <di:waypoint x="90" y="-40" />
        <di:waypoint x="160" y="-40" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0k23ogn_di" bpmnElement="Flow_0k23ogn">
        <di:waypoint x="260" y="-40" />
        <di:waypoint x="381" y="-40" />
        <di:waypoint x="381" y="-110" />
        <di:waypoint x="502" y="-110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0f67no2_di" bpmnElement="Flow_0f67no2">
        <di:waypoint x="0" y="-30" />
        <di:waypoint x="90" y="-30" />
        <di:waypoint x="90" y="-160" />
        <di:waypoint x="160" y="-160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_05xwxsu_di" bpmnElement="Flow_05xwxsu">
        <di:waypoint x="260" y="-160" />
        <di:waypoint x="381" y="-160" />
        <di:waypoint x="381" y="-110" />
        <di:waypoint x="502" y="-110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0rb6pve_di" bpmnElement="Flow_0rb6pve">
        <di:waypoint x="0" y="-30" />
        <di:waypoint x="80" y="-30" />
        <di:waypoint x="80" y="80" />
        <di:waypoint x="160" y="80" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1qcama4_di" bpmnElement="Flow_1qcama4">
        <di:waypoint x="260" y="80" />
        <di:waypoint x="420" y="80" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0tyj3ai_di" bpmnElement="Flow_0tyj3ai">
        <di:waypoint x="470" y="40" />
        <di:waypoint x="470" y="-26" />
        <di:waypoint x="520" y="-26" />
        <di:waypoint x="520" y="-92" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`,
    read_only: false,
    categoryId: "mc-ops",
    typeId: "mt-integration",
    owner: "u-designer",
    created_at: "2024-07-01T08:00:00.000Z",
    updated_at: "2024-11-01T08:00:00.000Z",
  },
];

const sampleModelPermissions: Record<string, ModelPermission> = {
  "m-onboard": {
    edit: { users: ["u-admin", "u-designer"], groups: ["g-ops"] },
    execute: { users: ["u-admin", "u-viewer"], groups: ["g-ops"] },
  },
  "m-incident": {
    edit: { users: ["u-designer"], groups: [] },
    execute: { users: ["u-admin", "u-viewer"], groups: ["g-ops"] },
  },
  "m-survey": {
    edit: { users: ["u-admin"], groups: [] },
    execute: { users: ["u-admin", "u-designer"], groups: ["g-auditors"] },
  },
};

const sampleForms: FormConfig[] = [
  {
    _id: "form-identity",
    name: "Identity Verification",
    description: "Upload ID and contact details",
    config: JSON.stringify({
      title: "Identity Verification",
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text" },
      ],
    }),
  },
  {
    _id: "form-survey",
    name: "Survey Response",
    description: "Simple NPS form",
    config: JSON.stringify({
      title: "Survey Response",
      fields: [
        { key: "score", label: "Score (0-10)", type: "number" },
        { key: "comment", label: "Comment", type: "text" },
      ],
    }),
  },
];

const sampleTemplates: Template[] = [
  {
    _id: "tpl-incident",
    name: "Incident Template",
    description: "Pre-configured incident response steps",
    config: "<bpmn>incident template</bpmn>",
  },
  {
    _id: "tpl-hiring",
    name: "Hiring Template",
    description: "Onboarding starter pack",
    config: "<bpmn>hiring template</bpmn>",
  },
];

const sampleFunctions: RemoteFunction[] = [
  {
    _id: "fn-greet",
    name: "greetUser",
    description: "Return a greeting message",
    script: "module.exports = (input) => `Hello ${input.name}`;",
    created_at: "2024-05-10T08:00:00.000Z",
    updated_at: "2024-10-10T08:00:00.000Z",
  },
  {
    _id: "fn-sum",
    name: "sum",
    description: "Sum two numbers",
    script: "module.exports = (a,b) => a + b;",
    created_at: "2024-06-01T08:00:00.000Z",
    updated_at: "2024-09-01T08:00:00.000Z",
  },
];

const sampleInstances: Instance[] = [
  {
    _id: "ins-001",
    _id_version: "m-onboard-v1",
    _id_model: "m-onboard",
    executor: "u-admin",
    model: "Employee Onboarding",
    status: "running",
    workflow: "employee_onboarding",
    input: { candidate: "Jane Smith" },
    data: {
      duration: 3200,
      activity: [],
      flow: [],
      wait: [
        {
          assigneeId: "u-designer",
          assigneeType: "user",
          formName: "Identity Verification",
          id: "task-submit-id",
          index: 0,
          processId: "process-onboard",
          taskId: "task-01",
        },
      ],
      globalData: { department: "Engineering" },
      executed: [],
    },
    logs: [
      { activityId: "start", date: nowIso(), level: "info", log: "Instance created" },
    ],
    end_time: 0,
    created_at: "2024-11-01T08:00:00.000Z",
    updated_at: nowIso(),
  },
  {
    _id: "ins-002",
    _id_version: "m-incident-v2",
    _id_model: "m-incident",
    executor: "u-designer",
    model: "Incident Response",
    status: "completed",
    workflow: "incident_response",
    input: { incident: "#1042" },
    data: {
      duration: 1800,
      activity: [],
      flow: [],
      wait: [],
      globalData: { severity: "medium" },
      executed: [],
    },
    logs: [
      { activityId: "resolve", date: nowIso(), level: "info", log: "Incident closed" },
    ],
    end_time: 1800,
    created_at: "2024-09-10T08:00:00.000Z",
    updated_at: "2024-10-10T08:00:00.000Z",
  },
];

const sampleTasks: Task[] = [
  {
    taskId: "task-01",
    activityId: "form-upload",
    name: "Upload ID",
    processId: "process-onboard",
    status: "waiting",
    form: "form-identity",
    formName: "Identity Verification",
    instanceId: "ins-001",
    modelId: "m-onboard",
    index: 0,
    created_at: "2024-11-01T08:30:00.000Z",
    updated_at: "2024-11-01T08:30:00.000Z",
    assignee: [{ user: "u-designer" }],
  },
  {
    taskId: "task-incident-review",
    activityId: "review",
    name: "Review incident",
    processId: "process-incident",
    status: "completed",
    form: "form-identity",
    formName: "Identity Verification",
    instanceId: "ins-002",
    modelId: "m-incident",
    index: 1,
    created_at: "2024-09-10T08:00:00.000Z",
    updated_at: "2024-09-10T09:00:00.000Z",
    assignee: [{ group: "g-ops" }],
  },
];

const sampleSchedules: Schedule[] = [
  {
    _id: "sch-weekly",
    modelId: "m-survey",
    name: "Weekly Survey",
    type: "cron",
    description: "Send NPS weekly",
    cron: "0 9 * * MON",
    once: false,
    creator: "u-admin",
    created_at: "2024-09-01T08:00:00.000Z",
    updated_at: "2024-10-01T08:00:00.000Z",
    input: { audience: "beta" },
    active: true,
  },
];

let users = [...sampleUsers];
let groups = [...sampleGroups];
let modelTypes = [...sampleModelTypes];
let modelCategories = [...sampleModelCategories];
let models = [...sampleModels];
let modelPermissions = { ...sampleModelPermissions };
let forms = [...sampleForms];
let templates = [...sampleTemplates];
let remoteFunctions = [...sampleFunctions];
let instances = [...sampleInstances];
let tasks = [...sampleTasks];
let schedules = [...sampleSchedules];

const keepOrderSort = <T extends Record<string, unknown>>(
  list: T[],
  sortBy?: string,
  orderBy: string = "asc"
) => {
  if (!sortBy) return list;
  const sorted = [...list].sort((a, b) => {
    const av = (a[sortBy] as string | number | undefined) ?? "";
    const bv = (b[sortBy] as string | number | undefined) ?? "";
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
  return orderBy === "desc" ? sorted.reverse() : sorted;
};

export const mockAuth = {
  login: async (_input: LoginInput) => {
    const user = users.find((u) => u.userId === _input.username) ?? users[0];
    const token = `demo-token-${user.userId}`;
    return delay({ access_token: token, refresh_token: `${token}-refresh` });
  },
  refresh: async () => delay(`demo-token-refresh-${Date.now()}`),
  validateToken: async () => delay({ valid: true }),
  currentUser: async () => delay(users[0]),
};

const filterModels = (query?: ModelQuery, variant?: ModelsVariant) => {
  const { search, categoryId, typeId, owner, readOnly } = query ?? {};
  const filterReadOnly =
    typeof readOnly === "string"
      ? readOnly === "true"
      : typeof readOnly === "boolean"
        ? readOnly
        : undefined;

  return models.filter((m) => {
    if (search && !matchesSearch(m.name, search) && !matchesSearch(m.description, search)) return false;
    if (categoryId && m.categoryId !== categoryId) return false;
    if (typeId && m.typeId !== typeId) return false;
    if (owner && m.owner !== owner) return false;
    if (variant === "editable" && m.read_only) return false;
    if (variant === "execute" && m.status === "draft") return false;
    if (filterReadOnly !== undefined && m.read_only !== filterReadOnly) return false;
    return true;
  });
};

const filterInstances = (query?: InstanceQuery) => {
  const { search, status, executor, modelId } = query ?? {};
  return instances.filter((inst) => {
    if (search && !matchesSearch(inst.model, search) && !matchesSearch(String(inst.input?.toString?.() ?? ""), search)) {
      return false;
    }
    if (status && inst.status !== status) return false;
    if (executor && inst.executor !== executor) return false;
    if (modelId && inst._id_model !== modelId) return false;
    return true;
  });
};

const filterTasks = (query?: TaskQuery) => {
  const { search, status, userId } = query ?? {};
  return tasks.filter((t) => {
    if (search && !matchesSearch(t.name, search) && !matchesSearch(t.formName, search)) return false;
    if (status && t.status !== status) return false;
    if (userId) {
      const assigned = t.assignee ?? [];
      const hasUser = assigned.some((a) => "user" in a && a.user === userId);
      if (!hasUser) return false;
    }
    return true;
  });
};

const filterUsers = (query?: UserQuery) => {
  const { search, roles } = query ?? {};
  const roleList = roles ? roles.split(",").map((r) => r.trim()) : [];
  return users.filter((u) => {
    if (search && !matchesSearch(u.fullname, search) && !matchesSearch(u.email, search) && !matchesSearch(u.userId, search)) {
      return false;
    }
    if (roleList.length && !roleList.some((r) => u.roles.includes(r as UserRole))) return false;
    return true;
  });
};

const filterGroups = (query?: GroupQuery) => {
  const { search } = query ?? {};
  return groups.filter((g) => matchesSearch(g.name, search) || matchesSearch(g.description, search));
};

const filterSchedules = (query?: ScheduleQuery) => {
  const { search, modelId, owner } = query ?? {};
  return schedules.filter((s) => {
    if (search && !matchesSearch(s.name, search) && !matchesSearch(s.description, search)) return false;
    if (modelId && s.modelId !== modelId) return false;
    if (owner && s.creator !== owner) return false;
    return true;
  });
};

const filterForms = (query?: FormQuery) => {
  const { search } = query ?? {};
  return forms.filter((f) => matchesSearch(f.name, search) || matchesSearch(f.description, search));
};

const filterTemplates = (query?: TemplateQuery) => {
  const { search } = query ?? {};
  return templates.filter((t) => matchesSearch(t.name, search) || matchesSearch(t.description, search));
};

export const mockBackend = {
  // Models
  getModels: async (query?: ModelQuery, variant?: ModelsVariant): Promise<PagedModels> => {
    const filtered = keepOrderSort(filterModels(query, variant), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  getModel: async (id: string): Promise<Model> => {
    const found = models.find((m) => m._id === id);
    return delay(found ?? models[0]);
  },
  getModelXml: async (id: string): Promise<string> => {
    const found = models.find((m) => m._id === id);
    console.log("found", found);
    return delay(found?.config ?? defaultModelConfig);
  },
  createModel: async (input: CreateModelInput): Promise<CreateModelResponse> => {
    const id = nextId("model");
    const versionId = `${id}-v1`;
    const created: Model = {
      _id: id,
      _id_version: versionId,
      name: input.name,
      description: "Sample model created locally",
      status: "draft",
      config: input.xml,
      read_only: false,
      categoryId: input.categoryId,
      typeId: input.typeId,
      owner: "u-admin",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    models = [created, ...models];
    modelPermissions[id] = { edit: { users: ["u-admin"], groups: [] }, execute: { users: ["u-admin"], groups: [] } };
    return delay({ id });
  },
  updateModel: async (input: UpdateModelInput): Promise<Model> => {
    const idx = models.findIndex((m) => m._id === input.id);
    if (idx >= 0) {
      const existing = models[idx];
      models[idx] = {
        ...existing,
        ...input.params,
        config: input.xml ?? existing.config,
        updated_at: nowIso(),
      };
    }
    return delay(models.find((m) => m._id === input.id) ?? models[0]);
  },
  deleteModel: async ({ id }: DeleteModelInput): Promise<void> => {
    models = models.filter((m) => m._id !== id);
    delete modelPermissions[id];
    return delay(undefined);
  },
  setReadOnlyModel: async ({ id, readOnly }: SetReadOnlyInput): Promise<Model> => {
    models = models.map((m) => (m._id === id ? { ...m, read_only: readOnly, updated_at: nowIso() } : m));
    return delay(models.find((m) => m._id === id) ?? models[0]);
  },
  getModelPermission: async (modelId: string): Promise<ModelPermission> => {
    return delay(modelPermissions[modelId] ?? { edit: { users: [], groups: [] }, execute: { users: [], groups: [] } });
  },
  updateModelPermission: async (modelId: string, data: ModelPermission): Promise<ModelPermission> => {
    modelPermissions[modelId] = copy(data);
    return delay(modelPermissions[modelId]);
  },
  runModel: async (input: RunModelInput): Promise<unknown> => {
    const id = nextId("ins");
    const instance: Instance = {
      _id: id,
      _id_version: `${input.modelId}-v-run`,
      _id_model: input.modelId,
      executor: "u-admin",
      model: models.find((m) => m._id === input.modelId)?.name ?? "Demo Model",
      status: "running",
      workflow: "local_run",
      input: input.data ?? {},
      data: {
        duration: 0,
        activity: [],
        flow: [],
        wait: [],
        globalData: {},
        executed: [],
      },
      logs: [{ activityId: "start", date: nowIso(), level: "info", log: "Started locally" }],
      end_time: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    instances = [instance, ...instances];
    return delay({ instanceId: id, status: "started", data: instance });
  },
  debugModel: async (input: DebugModelInput): Promise<unknown> => {
    return delay({ ok: true, modelId: input.modelId, data: input.data ?? {} });
  },
  // Instances
  getInstances: async (query?: InstanceQuery): Promise<PagedInstances> => {
    const filtered = keepOrderSort(filterInstances(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  getInstance: async (id: string): Promise<Instance> => {
    const found = instances.find((i) => i._id === id);
    return delay(found ?? instances[0]);
  },
  deleteInstance: async (instanceId: string): Promise<void> => {
    instances = instances.filter((i) => i._id !== instanceId);
    tasks = tasks.filter((t) => t.instanceId !== instanceId);
    return delay(undefined);
  },
  invokeInstanceItem: async (_input: InvokeItemInput): Promise<unknown> => delay({ ok: true }),
  // Tasks
  getTasks: async (query?: TaskQuery): Promise<PagedTasks> => {
    const filtered = keepOrderSort(filterTasks(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  getTask: async (taskId: string): Promise<Task> => {
    const found = tasks.find((t) => t.taskId === taskId);
    return delay(found ?? tasks[0]);
  },
  executeTask: async (taskId: string): Promise<Task> => {
    tasks = tasks.map((t) =>
      t.taskId === taskId ? { ...t, status: "completed", updated_at: nowIso() } : t
    );
    return delay(tasks.find((t) => t.taskId === taskId) ?? tasks[0]);
  },
  // Users
  getUsers: async (query?: UserQuery): Promise<PagedUsers> => {
    const filtered = keepOrderSort(filterUsers(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  createUser: async (input: CreateUserInput): Promise<User> => {
    const created: User = {
      userId: input.username,
      fullname: input.fullname,
      email: input.email,
      phone: input.phone,
      address: input.address,
      created_at: nowIso(),
      updated_at: nowIso(),
      roles: ["User"],
      tenantId: "tenant-demo",
      permissions: [],
    };
    users = [created, ...users];
    return delay(created);
  },
  deleteUser: async (input: DeleteUserInput): Promise<void> => {
    users = users.filter((u) => u.userId !== input.userId);
    return delay(undefined);
  },
  updateUser: async (input: UpdateUserInput): Promise<User> => {
    users = users.map((u) =>
      u.userId === input.userId
        ? { ...u, ...input, updated_at: nowIso() }
        : u
    );
    return delay(users.find((u) => u.userId === input.userId) ?? users[0]);
  },
  updateUserRole: async (input: UpdateUserRoleInput): Promise<User> => {
    users = users.map((u) =>
      u.userId === input.userId ? { ...u, roles: input.roles, updated_at: nowIso() } : u
    );
    return delay(users.find((u) => u.userId === input.userId) ?? users[0]);
  },
  updateMyProfile: async (input: UpdateUserInput): Promise<User> => {
    users = users.map((u) =>
      u.userId === input.userId ? { ...u, ...input, updated_at: nowIso() } : u
    );
    return delay(users.find((u) => u.userId === input.userId) ?? users[0]);
  },
  changePassword: async (_input: ChangePassWordInput): Promise<void> => delay(undefined),
  // Groups
  getGroups: async (query?: GroupQuery): Promise<PagedGroups> => {
    const filtered = keepOrderSort(filterGroups(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  addGroup: async (input: AddGroupInput): Promise<Group> => {
    const group: Group = {
      _id: nextId("group"),
      name: input.name,
      description: input.description,
      members: [],
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    groups = [group, ...groups];
    return delay(group);
  },
  updateGroup: async (input: UpdateGroupInput): Promise<Group> => {
    groups = groups.map((g) =>
      g._id === input.id
        ? { ...g, name: input.name, description: input.description, members: input.members ?? g.members, updated_at: nowIso() }
        : g
    );
    return delay(groups.find((g) => g._id === input.id) ?? groups[0]);
  },
  deleteGroup: async (input: DeleteGroupInput): Promise<void> => {
    groups = groups.filter((g) => g._id !== input.groupId);
    return delay(undefined);
  },
  // Model types
  getModelTypes: async (query?: ModelTypeQuery): Promise<PagedModelTypes> => {
    const filtered = keepOrderSort(modelTypes, query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  addModelType: async (input: AddModelTypeInput): Promise<ModelType> => {
    const mt: ModelType = {
      _id: nextId("mt"),
      name: input.name,
      description: input.description,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    modelTypes = [mt, ...modelTypes];
    return delay(mt);
  },
  updateModelType: async (input: UpdateModelTypeInput): Promise<ModelType> => {
    modelTypes = modelTypes.map((t) =>
      t._id === input.modelTypeId ? { ...t, name: input.name, description: input.description, updated_at: nowIso() } : t
    );
    return delay(modelTypes.find((t) => t._id === input.modelTypeId) ?? modelTypes[0]);
  },
  deleteModelType: async (input: DeleteModelTypeInput): Promise<void> => {
    modelTypes = modelTypes.filter((t) => t._id !== input.modelTypeId);
    return delay(undefined);
  },
  // Model categories
  getModelCategories: async (query?: ModelCategoryQuery): Promise<PagedModelCategories> => {
    const filtered = keepOrderSort(modelCategories, query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  addModelCategory: async (input: AddModelCategoryInput): Promise<ModelCategory> => {
    const cat: ModelCategory = {
      _id: nextId("mc"),
      name: input.name,
      description: input.description,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    modelCategories = [cat, ...modelCategories];
    return delay(cat);
  },
  updateModelCategory: async (input: UpdateModelCategoryInput): Promise<ModelCategory> => {
    modelCategories = modelCategories.map((c) =>
      c._id === input.modelCategoryId ? { ...c, name: input.name, description: input.description, updated_at: nowIso() } : c
    );
    return delay(modelCategories.find((c) => c._id === input.modelCategoryId) ?? modelCategories[0]);
  },
  deleteModelCategory: async (input: DeleteModelCategoryInput): Promise<void> => {
    modelCategories = modelCategories.filter((c) => c._id !== input.modelCategoryId);
    return delay(undefined);
  },
  // Schedules
  getSchedules: async (query?: ScheduleQuery): Promise<PagedSchedules> => {
    const filtered = keepOrderSort(filterSchedules(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  addSchedule: async (input: AddScheduleInput): Promise<Schedule> => {
    const sched: Schedule = {
      _id: nextId("sch"),
      modelId: input.modelId,
      name: input.name,
      type: input.type,
      description: input.description,
      cron: input.cron,
      once: input.once,
      creator: "u-admin",
      created_at: nowIso(),
      updated_at: nowIso(),
      input: (input.data as Record<string, unknown>) ?? {},
      active: input.active,
    };
    schedules = [sched, ...schedules];
    return delay(sched);
  },
  updateSchedule: async (input: UpdateScheduleInput): Promise<Schedule> => {
    const { scheduleId, ...rest } = input;
    schedules = schedules.map((s) =>
      s._id === scheduleId
        ? { ...s, ...rest, updated_at: nowIso() }
        : s
    );
    return delay(schedules.find((s) => s._id === scheduleId) ?? schedules[0]);
  },
  deleteSchedule: async (input: DeleteScheduleInput): Promise<void> => {
    schedules = schedules.filter((s) => s._id !== input.scheduleId);
    return delay(undefined);
  },
  deleteAllSchedules: async (): Promise<void> => {
    schedules = [];
    return delay(undefined);
  },
  // Forms
  getForms: async (query?: FormQuery): Promise<PagedForms> => {
    const filtered = keepOrderSort(filterForms(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  getFormByName: async (formName: string): Promise<FormConfig> => {
    const found = forms.find((f) => f.name === formName || f._id === formName);
    return delay(found ?? forms[0]);
  },
  addForm: async (input: AddFormInput): Promise<{ id: string }> => {
    const form: FormConfig = {
      _id: nextId("form"),
      name: input.name,
      description: "Local sample form",
      config: JSON.stringify(input.formSchema),
    };
    forms = [form, ...forms];
    return delay({ id: form._id });
  },
  updateForm: async (input: UpdateFormInput): Promise<FormConfig> => {
    forms = forms.map((f) =>
      f._id === input.id ? { ...f, config: JSON.stringify(input.formSchema), updated_at: nowIso() as any } : f
    );
    return delay(forms.find((f) => f._id === input.id) ?? forms[0]);
  },
  deleteForm: async (id: string): Promise<void> => {
    forms = forms.filter((f) => f._id !== id && f.name !== id);
    return delay(undefined);
  },
  // Templates
  getTemplates: async (query?: TemplateQuery): Promise<PagedTemplates> => {
    const filtered = keepOrderSort(filterTemplates(query), query?.sortBy, query?.orderBy);
    return delay(paginate(filtered, query?.page, query?.limit));
  },
  addTemplate: async (input: AddTemplateInput): Promise<Template> => {
    const tpl: Template = {
      _id: nextId("tpl"),
      name: input.name,
      description: input.description ?? "Local template",
      config: JSON.stringify(input.config),
    };
    templates = [tpl, ...templates];
    return delay(tpl);
  },
  deleteTemplate: async (input: DeleteTemplateInput): Promise<void> => {
    templates = templates.filter((t) => t._id !== input.templateId);
    return delay(undefined);
  },
  // Functions
  getFunctions: async (): Promise<PagedRemoteFunctions> => {
    return delay({
      items: remoteFunctions,
      total: remoteFunctions.length,
      page: 1,
      limit: remoteFunctions.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  },
  addFunction: async (input: { name: string; description: string; script: string; public?: boolean }): Promise<RemoteFunction> => {
    const fn: RemoteFunction = {
      _id: nextId("fn"),
      name: input.name,
      description: input.description,
      script: input.script,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    remoteFunctions = [fn, ...remoteFunctions];
    return delay(fn);
  },
  deleteFunction: async (id: string): Promise<void> => {
    remoteFunctions = remoteFunctions.filter((f) => f._id !== id);
    return delay(undefined);
  },
  // AI Chat
  sendChat: async (input: AIChatInput): Promise<{ text: string }> => {
    return delay({
      text: `Demo reply for "${input.message}" using model ${input.modelName}`,
    });
  },
};

export const mockData = {
  users,
  groups,
  modelTypes,
  modelCategories,
  models,
  modelPermissions,
  forms,
  templates,
  remoteFunctions,
  instances,
  tasks,
  schedules,
};
