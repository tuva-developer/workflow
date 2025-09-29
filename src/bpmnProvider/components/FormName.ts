import { html } from 'htm/preact';
import { useEffect, useMemo, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { SelectEntry } from '@bpmn-io/properties-panel';
import { loadForms } from '@/services/forms';
import type {
  Element as BpmnElement,
} from 'bpmn-js/lib/model/Types';

type Props = {
  element: BpmnElement;
  id: string;
  disabled?: boolean;
};

export function FormName(props: Props) {
  const { element, id, disabled } = props;

  const modeling = useService('modeling');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const [searchTerm, setSearchTerm] = useState('');
  const [formList, setFormList] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const paged = await loadForms({});
        if (!mounted) return;
        const items = (paged?.items ?? []).slice().sort((a, b) =>
          String(a?.name || '').localeCompare(String(b?.name || ''))
        );
        setFormList(items);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getValue = () => {
    const bo = getBusinessObject(element);
    const ext = bo?.extensionElements;
    const values = Array.isArray(ext?.values) ? ext.values : [];
    const formNameEl = values.find((v: BpmnElement) => v?.$type === 'customExtension:FormName');
    return formNameEl?.value ?? '';
  };

  const setValue = (value: string) => {
    const bo = getBusinessObject(element);

    if (!bo.extensionElements) {
      bo.extensionElements = bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
    }

    const ext = bo.extensionElements;
    const currValues: BpmnElement[] = Array.isArray(ext.values) ? [...ext.values] : [];

    const currentName = (() => {
      const f = currValues.find((v: BpmnElement) => v?.$type === 'customExtension:FormName');
      return f?.value ?? '';
    })();

    if ((value ?? '') === (currentName ?? '')) return;

    let nextValues = currValues;

    if (!value) {
      nextValues = currValues.filter(
        (v) => v?.$type !== 'customExtension:FormName' && v?.$type !== 'customExtension:FormData'
      );
    } else {
      const formNameEl = currValues.find((v) => v?.$type === 'customExtension:FormName');
      if (formNameEl) {
        formNameEl.value = value;
      } else {
        const newFormName = bpmnFactory.create('customExtension:FormName', { value });
        nextValues = [...currValues, newFormName];
      }
    }

    const newExtensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
      values: nextValues
    });

    modeling.updateProperties(element, { extensionElements: newExtensionElements });
  };

  const options = useMemo(
    () => [
      { label: '<none>', value: '' },
      ...formList
        .filter((item) =>
          String(item?.name || '')
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        )
        .map((item) => ({ label: item.name, value: item.name }))
    ],
    [formList, searchTerm]
  );

  const handleClickReloadForm = async () => {
    try {
      setLoading(true);
      const paged = await loadForms({});
      const items = (paged?.items ?? []).slice().sort((a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || ''))
      );
      setFormList(items);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div class="bio-properties-panel-entry">
      <div style="display: flex; align-items: center; gap: 4px;">
        <input
          class="bio-properties-panel-input"
          type="text"
          placeholder=${translate('Search forms')}
          value=${searchTerm}
          onInput=${(e) => setSearchTerm(e?.target?.value ?? '')}
          disabled=${disabled}
          style="flex: 1;"
        />
        <button
          onClick=${handleClickReloadForm}
          title=${translate('Refresh form list')}
          class="bio-properties-panel-button"
          disabled=${disabled || loading}
        >
          <i class=${loading ? 'ri-loader-2-line remix-rotate' : 'ri-refresh-line'}></i>
        </button>
      </div>
    </div>

    <${SelectEntry}
      id=${id}
      element=${element}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${() => options}
      disabled=${disabled}
    />
  `;
}