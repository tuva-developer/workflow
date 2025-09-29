import {
  removeExtensionProperty,
  addExtensionProperty,
  getExtensionProperties,
} from '@/bpmnProvider/utils/defines';
import { Name } from '@/bpmnProvider/components/Name';
import { Value } from '@/bpmnProvider/components/Value';
import { getReadonlyMode } from '@/global/appState';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';

export function ExtentionPropertiesGroup({ element, injector }) {

  const extensionProperties = getExtensionProperties(element) || [];
  const IsReadOnlyMode = getReadonlyMode();

  const bpmnFactory = injector.get('bpmnFactory'),
    commandStack = injector.get('commandStack');

  const items = extensionProperties.map((extensionProperty, index) => {
    const id = element.id + '-extension-property-' + index;

    return {
      id,
      label: extensionProperty.get('name') || '',
      entries: ExtentionProperty({
        idPrefix: id,
        element,
        extensionProperty,
      }),
      autoFocusEntry: id + '-name',
      remove: !IsReadOnlyMode ? removeExtensionProperty({ commandStack, element, extensionProperty }) : undefined
    };
  });

  return {
    items,
    add: !IsReadOnlyMode ? addExtensionProperty({ element, bpmnFactory, commandStack }) : undefined
  };
}

function ExtentionProperty(props) {
  const {
    idPrefix,
    extensionProperty,
  } = props;

  const entries = [
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      extensionProperty
    },
    {
      id: idPrefix + '-value',
      component: Value,
      idPrefix,
      extensionProperty
    }
  ];

  return setEntriesReadonly(entries);
}