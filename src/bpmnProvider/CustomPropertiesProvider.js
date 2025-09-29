import { is } from 'bpmn-js/lib/util/ModelUtil';
import { ListGroup } from '@bpmn-io/properties-panel';
import { ScriptTaskGroup } from '@/bpmnProvider/parts/ScriptTaskGroup';
import { FormGroup } from '@/bpmnProvider/parts/FormGroup';
import { ConditionGroup } from '@/bpmnProvider/parts/ConditionGroup';
import { MultiInstanceGroup } from '@/bpmnProvider/parts/MultiInstanceGroup';
import { UserAssignment } from '@/bpmnProvider/parts/UserAssignment';
import { GroupAssignment } from '@/bpmnProvider/parts/GroupAssignment';
import { ExtentionPropertiesGroup } from '@/bpmnProvider/parts/ExtentionPropertiesGroup';
import { ManualAssignment } from '@/bpmnProvider/parts/ManualAssignment';
import { GeneralGroup } from '@/bpmnProvider/parts/GeneralGroup';
import { WebhookRequestsGroup } from '@/bpmnProvider/parts/WebhookRequestsGroup';

const LOW_PRIORITY = 500;

export default function CustomPropertiesProvider(propertiesPanel, translate, injector) {
  this.getGroups = function (element) {
    return function () {
      const groups = [];
      groups.push(createGeneralGroup(element, translate));

       if (is(element, 'bpmn:Collaboration')) {
        groups.push(createWebhookRequestsGroup(element, translate, injector));
      }

      if (is(element, 'bpmn:Task')) {
        groups.push(createExtensionPropertiesGroup(element, translate, injector));

        if (is(element, 'bpmn:UserTask') || is(element, 'bpmn:ScriptTask')) {
          const businessObject = element.businessObject;
          const loopCharacteristics = businessObject.loopCharacteristics;

          if (loopCharacteristics) {
            groups.push(createMultiInstanceGroup(element, translate));
          }
        }

        if (is(element, 'bpmn:ScriptTask')) {
          groups.push(createScriptTaskGroup(element, translate))
          groups.push(createFormGroup(element, translate));
        }

        if (is(element, 'bpmn:UserTask')) {
          groups.push(createUserAssignment(element, translate, injector));
          groups.push(createGroupAssignment(element, translate, injector));
          groups.push(createManualAssignment(element, translate));
          groups.push(createScriptTaskGroup(element, translate))
          groups.push(createFormGroup(element, translate));
        }
      }

      if (is(element, 'bpmn:SequenceFlow')) {
        const businessObject = element.businessObject;

        if (businessObject && businessObject.conditionExpression) {
          groups.push(createConditionGroup(element, translate));
        }
      }

      if (is(element, 'bpmn:SubProcess')) {
        const businessObject = element.businessObject;
        const loopCharacteristics = businessObject.loopCharacteristics;

        if (loopCharacteristics) {
          const isSequential = loopCharacteristics.isSequential;

          if (isSequential !== undefined) {
            groups.push(createMultiInstanceGroup(element, translate));
          }
        }
      }

      if (is(element, 'bpmn:ExclusiveGateway')) {
        groups.push(createScriptTaskGroup(element, translate));
      }

      return groups;
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'translate', 'injector'];

function createGeneralGroup(element, translate) {
  const generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: GeneralGroup(element)
  };

  return generalGroup;
}

function createScriptTaskGroup(element, translate) {
  const scriptTaskGroup = {
    id: 'CustomExtension_Script',
    label: translate('Script'),
    entries: ScriptTaskGroup(element),
  };

  return scriptTaskGroup;
}

function createFormGroup(element, translate) {
  const formGroup = {
    id: 'CustomExtension_Form',
    label: translate('Forms'),
    entries: FormGroup(element),
  };

  return formGroup;
}

function createConditionGroup(element, translate) {
  const conditionGroup = {
    id: 'CustomExtension_Condition',
    label: translate('Condition'),
    entries: ConditionGroup(element),
  }

  return conditionGroup;
}

function createExtensionPropertiesGroup(element, translate, injector) {
  const parametersGroup = {
    id: 'CustomExtension_ExtentionProperties',
    label: translate('Extension properties'),
    component: ListGroup,
    ...ExtentionPropertiesGroup({ element, injector })
  };

  return parametersGroup;
}

function createMultiInstanceGroup(element, translate) {
  return {
    id: 'CustomExtension_MultiInstance',
    label: translate('Multi-instance'),
    entries: MultiInstanceGroup(element)
  };
}

function createUserAssignment(element, translate, injector) {
  return {
    id: 'CustomExtension_UserAssignment',
    label: translate('User assignment'),
    component: ListGroup,
    ...UserAssignment({ element, translate, injector })
  };
}

function createGroupAssignment(element, translate, injector) {
  return {
    id: 'CustomExtension_GroupAssignment',
    label: translate('Group assignment'),
    component: ListGroup,
    ...GroupAssignment({ element, translate, injector })
  };
}

function createManualAssignment(element, translate) {
  return {
    id: 'CustomExtension_ManualAssignment',
    label: translate('Manual Assignment'),
    entries: ManualAssignment(element)
  };
}

function createWebhookRequestsGroup(element, translate, injector) {
  return {
    id: 'CustomExtension_WebhookRequests',
    label: translate('Webhooks'),
    component: ListGroup,
    ...WebhookRequestsGroup({ element, translate, injector })
  };
}