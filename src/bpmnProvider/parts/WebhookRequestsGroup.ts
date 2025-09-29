import {
  removeElementEvent,
  addElementEvent,
  getExtensionValues,
} from '@/bpmnProvider/utils/defines';
import { getReadonlyMode } from '@/global/appState';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

import {
  TextFieldEntry,
  TextAreaEntry,
  SelectEntry,
  CheckboxEntry
} from '@bpmn-io/properties-panel';

export function WebhookRequestsGroup({ element, injector, translate }) {

  const webhookRequests = getExtensionValues(element, 'customExtension:WebhookRequests') || [];
  const IsReadOnlyMode = getReadonlyMode();

  const bpmnFactory = injector.get('bpmnFactory');
  const commandStack = injector.get('commandStack');
  const debounce =
    injector.get('debounceInput', false) ||
    injector.get('debounce', false) ||
    ((fn) => fn);

  const extensionType = 'customExtension:WebhookRequests';
  const extensionChild = {
    type: 'customExtension:WebhookRequest',
    label: translate('Webhook'),
    properties: {
      method: 'POST'
    }
  };

  const items = webhookRequests.map((request, index) => {
    const id = element.id + '-webhook-' + index;

    return {
      id,
      label: request.get('name'),
      entries: WebhookRequestEntries({
        idPrefix: id,
        element,
        request,
        injector,
        commandStack,
        bpmnFactory,
        debounce,
        translate
      }),
      autoFocusEntry: id + '-url',
      remove: !IsReadOnlyMode
        ? removeElementEvent({ commandStack, element, extensionType, childElement: request })
        : undefined
    };
  });

  return {
    items,
    add: !IsReadOnlyMode
      ? addElementEvent({
        element,
        bpmnFactory,
        commandStack,
        extensionType,
        extensionChild,
        injector
      })
      : undefined
  };
}

function WebhookRequestEntries(props) {
  const {
    idPrefix,
    element,
    request,
    commandStack,
    bpmnFactory,
    debounce,
    translate
  } = props;

  const updateReq = (props) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: request,
      properties: props
    });
  };

  const updateModdle = (target, props) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: target,
      properties: props
    });
  };

  const entries = [
    {
      id: idPrefix + '-enabled',
      component: CheckboxEntry,
      element,
      label: translate('Enabled'),
      getValue: () => !!request.get('enabled'),
      setValue: (val) => updateReq({ enabled: !!val })
    },
    {
      id: idPrefix + '-url',
      component: TextFieldEntry,
      element,
      label: translate('URL'),
      debounce,
      getValue: () => request.get('url') || '',
      setValue: (val) => updateReq({ url: val }),
    },
    {
      id: idPrefix + '-method',
      component: SelectEntry,
      element,
      label: translate('Method'),
      getValue: () => request.get('method') || 'POST',
      setValue: (val) => updateReq({ method: val }),
      getOptions: () => ([
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' }
      ])
    },
    {
      id: idPrefix + '-headers',
      component: TextAreaEntry,
      element,
      label: translate('Headers (JSON object)'),
      monospace: true,
      debounce,
      getValue: () => {
        const headers = request.get('headers') || [];
        const obj = {};
        headers.forEach(h => {
          const name = h.get('name');
          const value = h.get('value');
          if (name) obj[name] = value ?? '';
        });
        try {
          return Object.keys(obj).length ? JSON.stringify(obj, null, 2) : '';
        } catch {
          return '';
        }
      },
      setValue: (val) => {
        if (!val || !val.trim()) {
          updateReq({ headers: [] });
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(val);
        } catch (err) {
          console.error("Error:", err);
        }

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

        const newHeaders = Object.keys(parsed).map((key) =>
          bpmnFactory.create('customExtension:WebhookHeader', {
            name: key,
            value: typeof parsed[key] === 'string' ? parsed[key] : String(parsed[key])
          })
        );

        updateReq({ headers: newHeaders });
      },
      validate: (val) => {
        if (!val || !val.trim()) return;
        try {
          const obj = JSON.parse(val);
          const isObj = obj && typeof obj === 'object' && !Array.isArray(obj);
          if (!isObj) return translate('Must be a JSON object (key-value).');

          for (const k of Object.keys(obj)) {
            if (typeof k !== 'string' || !k.trim()) {
              return translate('Header name must be a non-empty string.');
            }
          }
          return;
        } catch {
          return translate('Invalid JSON.');
        }
      }
    },
    {
      id: idPrefix + '-timeout',
      component: TextFieldEntry,
      element,
      label: translate('Timeout (ISO 8601 duration)'),
      description: translate('e.g. PT5S, PT30S, PT1M'),
      debounce,
      getValue: () => request.get('timeout') || '',
      setValue: (val) => updateReq({ timeout: val })
    },
    {
      id: idPrefix + '-body',
      component: TextAreaEntry,
      element,
      label: translate('Body (JSON / text)'),
      monospace: true,
      debounce,
      getValue: () => request.get('body')?.get('value') || '',
      setValue: (val) => {
        let bodyEl = request.get('body');
        if (!bodyEl) {
          bodyEl = bpmnFactory.create('customExtension:WebhookBody', { value: val });
          updateReq({ body: bodyEl });
        } else {
          updateModdle(bodyEl, { value: val });
        }
      }
    }
  ];

  return setEntriesReadonly(entries);
}