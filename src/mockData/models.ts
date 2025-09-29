// Initial mock data for models
export const mockModels: Model[] = [
  {
    _id: 'model-demo-1',
    _id_version: 'v1',
    name: 'Customer Onboarding',
    description: 'Onboarding flow with KYC verification',
    status: 'active',
    config: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:customExtension="http://example.com/form" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:collaboration id="Collaboration_0y6i934">
    <bpmn2:participant id="Participant_1ae9h5j" processRef="Process_1" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="Event_1u3u5k7">
      <bpmn2:outgoing>Flow_038jqsj</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="Event_0lmcdj5">
      <bpmn2:incoming>Flow_11ixdt4</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:scriptTask id="Activity_14m4x0w">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_038jqsj</bpmn2:incoming>
      <bpmn2:outgoing>Flow_11ixdt4</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:sequenceFlow id="Flow_038jqsj" sourceRef="Event_1u3u5k7" targetRef="Activity_14m4x0w" />
    <bpmn2:sequenceFlow id="Flow_11ixdt4" sourceRef="Activity_14m4x0w" targetRef="Event_0lmcdj5" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_0y6i934">
      <bpmndi:BPMNShape id="Participant_1ae9h5j_di" bpmnElement="Participant_1ae9h5j" isHorizontal="true">
        <dc:Bounds x="-570" y="-220" width="600" height="250" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1u3u5k7_di" bpmnElement="Event_1u3u5k7">
        <dc:Bounds x="-468" y="-118" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0lmcdj5_di" bpmnElement="Event_0lmcdj5">
        <dc:Bounds x="-128" y="-118" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_14m4x0w_di" bpmnElement="Activity_14m4x0w">
        <dc:Bounds x="-330" y="-140" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_038jqsj_di" bpmnElement="Flow_038jqsj">
        <di:waypoint x="-432" y="-100" />
        <di:waypoint x="-330" y="-100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11ixdt4_di" bpmnElement="Flow_11ixdt4">
        <di:waypoint x="-230" y="-100" />
        <di:waypoint x="-128" y="-100" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`,
    read_only: false,
    categoryId: 'cat-kyc',
    typeId: 'type-process',
    owner: 'admin',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-20T15:30:00.000Z',
  },
  {
    _id: 'model-demo-2',
    _id_version: 'v3',
    name: 'Order Processing',
    description: 'E-commerce order processing and fulfillment',
    status: 'active',
    config: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:customExtension="http://example.com/form" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:collaboration id="Collaboration_1vj4ftu">
    <bpmn2:participant id="Participant_0n85ovz" processRef="Process_1" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="Event_1ne57by">
      <bpmn2:outgoing>Flow_06h2jfz</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:scriptTask id="Activity_1qs8j96">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_06h2jfz</bpmn2:incoming>
      <bpmn2:outgoing>Flow_118qij7</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:scriptTask id="Activity_0ktecdn">
      <bpmn2:extensionElements>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>let input = activity.getInput();</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_118qij7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1r2gccy</bpmn2:outgoing>
    </bpmn2:scriptTask>
    <bpmn2:endEvent id="Event_0zsgm7l">
      <bpmn2:incoming>Flow_1r2gccy</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_06h2jfz" sourceRef="Event_1ne57by" targetRef="Activity_1qs8j96" />
    <bpmn2:sequenceFlow id="Flow_118qij7" sourceRef="Activity_1qs8j96" targetRef="Activity_0ktecdn">
      <bpmn2:extensionElements>
        <customExtension:conditionType>Script</customExtension:conditionType>
        <customExtension:scriptFormat>JavaScript</customExtension:scriptFormat>
        <customExtension:script>activity.setOutput(true);</customExtension:script>
      </bpmn2:extensionElements>
      <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression" language="javascript"> true </bpmn2:conditionExpression>
    </bpmn2:sequenceFlow>
    <bpmn2:sequenceFlow id="Flow_1r2gccy" sourceRef="Activity_0ktecdn" targetRef="Event_0zsgm7l" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1vj4ftu">
      <bpmndi:BPMNShape id="Participant_0n85ovz_di" bpmnElement="Participant_0n85ovz" isHorizontal="true">
        <dc:Bounds x="-590" y="-250" width="600" height="250" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1ne57by_di" bpmnElement="Event_1ne57by">
        <dc:Bounds x="-508" y="-158" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1qs8j96_di" bpmnElement="Activity_1qs8j96">
        <dc:Bounds x="-410" y="-180" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0ktecdn_di" bpmnElement="Activity_0ktecdn">
        <dc:Bounds x="-240" y="-180" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0zsgm7l_di" bpmnElement="Event_0zsgm7l">
        <dc:Bounds x="-78" y="-158" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_06h2jfz_di" bpmnElement="Flow_06h2jfz">
        <di:waypoint x="-472" y="-140" />
        <di:waypoint x="-410" y="-140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_118qij7_di" bpmnElement="Flow_118qij7">
        <di:waypoint x="-310" y="-140" />
        <di:waypoint x="-240" y="-140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1r2gccy_di" bpmnElement="Flow_1r2gccy">
        <di:waypoint x="-140" y="-140" />
        <di:waypoint x="-78" y="-140" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`,
    read_only: false,
    categoryId: 'cat-commerce',
    typeId: 'type-process',
    owner: 'admin',
    created_at: '2024-02-01T08:00:00.000Z',
    updated_at: '2024-02-03T09:45:00.000Z',
  },
];


