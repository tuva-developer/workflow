import { html } from 'htm/preact';
import { useEffect, useMemo, useState, useCallback } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';

export function AssignList(props) {
  const { element, id, extensionType } = props;
  const translate = useService('translate');
  const eventBus = useService('eventBus');
  const collapsedCount = 3;

  const [items, setItems] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const total = items.length;

  const readAssigned = useCallback(() => {
    const bo = element?.businessObject;
    const ua = bo?.extensionElements?.values?.find(v => v && v.$type === extensionType);
    return (ua?.values || [])
      .map(a => (a?.get ? a.get('value') : a?.value))
      .filter(Boolean);
  }, [element, extensionType]);


  const refresh = useCallback(() => {
    const newList = readAssigned();
    setItems(prev => {
      if (newList.join('|') !== prev.join('|')) return newList;
      return prev;
    });
  }, [readAssigned]);

  useEffect(() => {
    refresh();
  }, [element?.id, refresh]);

  useEffect(() => {
    const onElementChanged = (e) => {
      if (!e) return;
      const changed = (e.element ? [e.element] : e.elements) || [];
      const changedIds = new Set(changed.map(el => el?.id));
      if (changedIds.has(element?.id)) refresh();
    };

    eventBus.on('element.changed', onElementChanged);
    eventBus.on('elements.changed', onElementChanged);
    eventBus.on('commandStack.changed', refresh);

    return () => {
      eventBus.off('element.changed', onElementChanged);
      eventBus.off('elements.changed', onElementChanged);
      eventBus.off('commandStack.changed', refresh);
    };
  }, [eventBus, element?.id, refresh]);

  const visible = useMemo(() => {
    if (expanded) return items;
    return items.slice(0, collapsedCount);
  }, [items, expanded, collapsedCount]);

  const hiddenCount = Math.max(0, total - visible.length);

  return html`
    <div data-entry-id=${id} class="bio-properties-panel-entry">
      <div style=${boxStyle} title=${items.join(', ')}>
        ${visible.length
      ? visible.map(uid => html`<span style=${chipStyle}>${uid}</span>`)
      : html`<span style=${emptyStyle}>${translate("Null")}</span>`
    }

        ${hiddenCount > 0 && !expanded && html`
          <button
            style=${moreBtnStyle}
            onClick=${() => setExpanded(true)}
          >+${hiddenCount} ${translate('more')}</button>
        `}
        ${hiddenCount === 0 && expanded && visible.length > collapsedCount && html`
          <button
            style=${moreBtnStyle}
            onClick=${() => setExpanded(false)}
          >${translate('collapse')}</button>
        `}
      </div>
    </div>
  `;
}

const boxStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  padding: '8px',
  border: '1px solid var(--divider)',
  borderRadius: '6px',
  minHeight: '36px',
  width: '100%',
} as const;

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '3px 8px',
  fontSize: '12px',
  borderRadius: '999px',
  border: '1px solid var(--divider)',
  lineHeight: 1.6,
  userSelect: 'text',
  wordBreak: 'break-word',
  background: 'var(--background-paper)',
} as const;

const moreBtnStyle = {
  padding: '2px 8px',
  fontSize: '11px',
  borderRadius: '999px',
  border: '1px dashed var(--divider)',
  color: 'var(--text-primary)',
  background: 'none',
  cursor: 'pointer'
} as const;

const emptyStyle = { color: '#6B7280', fontSize: '12px', fontStyle: 'italic' } as const;