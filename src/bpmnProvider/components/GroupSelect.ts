import { html } from 'htm/preact';
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
import { SelectEntry } from '@bpmn-io/properties-panel';
import { loadGroups } from '@/services/groups';
import { PagedGroups } from '@/services/types';

type Option = { value: string; label: string };

export function GroupSelect(props) {
  const { idPrefix, element, group, disabled } = props;

  const commandStack = useService('commandStack');
  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const res: PagedGroups = await loadGroups();
        const raw = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
            ? res
            : [];

        const opts: Option[] = raw.map((g: Group) => ({
          value: String(g._id ?? ''),
          label: String(g.name ?? ''),
        })).filter(o => o.value);

        if (!mounted) return;

        setGroupOptions(opts);

        const current = group?.get?.('value');
        if (!current && opts.length > 0) {
          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: group,
            properties: { value: opts[0].value },
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [commandStack, element, group]);

  const getValue = () => group.get('value') || '';

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: group,
      properties: { value },
    });
  };

  const getOptions = () => groupOptions;

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