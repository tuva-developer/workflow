import { html } from 'htm/preact';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
import { SelectEntry } from '@bpmn-io/properties-panel';
import { getUserId } from '@/global/appState';
import { loadUsers } from '@/services/users';

type Option = { value: string; label: string };

export function UserSelect(props) {
  const { idPrefix, element, assignee, disabled } = props;

  const commandStack = useService('commandStack');
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const paged = await loadUsers({});
        if (!mounted) return;
        const opts: Option[] = (paged?.items ?? []).map(u => ({
          value: u.userId,
          label: u.userId
        }));
        setUserOptions(opts);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    if (!assignee?.get?.('value')) {
      const defaultId = getUserId();
      if (defaultId) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: assignee,
          properties: { value: defaultId }
        });
      }
    }
    return () => { mounted = false; };
  }, [assignee, commandStack, element]);

  const getValue = () => assignee.get('value');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: assignee,
      properties: { value }
    });
  };

  const getOptions = () => userOptions;

  return html`
    <${SelectEntry}
      id=${idPrefix + '-value'}
      element=${element}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${getOptions}
      multiple
      disabled=${disabled || loading}
    />
  `;
}