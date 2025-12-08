import { html } from 'htm/preact';
import { useEffect, useState, useRef } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Form } from '@bpmn-io/form-js-viewer';
import { showWarn } from '@/utils/toastConfig';
import { loadFormByName } from '@/services/forms';
import type {
  Element as BpmnElement,
} from 'bpmn-js/lib/model/Types';

type Props = {
    element: BpmnElement;
    disabled?: boolean;
};

function safeParseJSON<T = unknown>(v: unknown): T | undefined {
    if (v == null) return undefined;
    if (typeof v === 'object') return v as T;
    if (typeof v !== 'string') return undefined;
    try { return JSON.parse(v) as T; } catch { return undefined; }
}

export function FormData(props: Props) {
    const { element, disabled } = props;

    const modeling = useService('modeling');
    const bpmnFactory = useService('bpmnFactory');
    const translate = useService('translate');

    const formViewerRef = useRef<Form | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [formSchema, setFormSchema] = useState('');

    useEffect(() => {
        formViewerRef.current = new Form({ container: containerRef.current || undefined });

        return () => {
            formViewerRef.current?.destroy();
            formViewerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!formName) {
            setFormSchema('');
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const form = await loadFormByName(formName);
                if (cancelled) return;

                const schema = form?.config ?? '';
                setFormSchema(schema);
            } catch {
                if (!cancelled) setFormSchema('');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [formName]);


    useEffect(() => {
        if (!isOpen || !formSchema) return;

        const schema = safeParseJSON<unknown>(formSchema) ?? formSchema ?? undefined;

        const bo = getBusinessObject(element);

        let savedData: unknown | undefined;
        const ext = bo?.extensionElements;
        const values = Array.isArray(ext?.values) ? ext.values : [];

        const formDataEl = values.find((v: BpmnElement) => v?.$type === 'customExtension:FormData');
        if (formDataEl?.value) {
            savedData = safeParseJSON<unknown>(formDataEl.value);
        }

        try {
            if (savedData) {
                formViewerRef.current?.importSchema(schema, savedData);
            } else {
                formViewerRef.current?.importSchema(schema);
            }
        } catch {
            setIsOpen(false);
            return;
        }

        const handleSubmit = (event) => {
            const data = event?.data ?? {};

            const businessObject = getBusinessObject(element);

            if (!businessObject.extensionElements) {
                businessObject.extensionElements = bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
            }
            if (!Array.isArray(businessObject.extensionElements.values)) {
                businessObject.extensionElements.values = [];
            }

            let formDataElement = businessObject.extensionElements.values.find(
                (v: BpmnElement) => v?.$type === 'customExtension:FormData'
            );

            if (!formDataElement) {
                formDataElement = bpmnFactory.create('customExtension:FormData', {
                    value: JSON.stringify(data),
                });
                businessObject.extensionElements.values.push(formDataElement);
            } else {
                formDataElement.value = JSON.stringify(data);
            }

            modeling.updateProperties(element, {
                extensionElements: businessObject.extensionElements,
            });

            setIsOpen(false);
        };

        const handleKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        formViewerRef.current?.on('submit', handleSubmit);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            formViewerRef.current?.off('submit', handleSubmit);
        };
    }, [isOpen, formSchema, formName, element, modeling, bpmnFactory]);

    const handleSetInput = () => {
        const bo = getBusinessObject(element);
        const ext = bo?.extensionElements;
        const values = Array.isArray(ext?.values) ? ext.values : [];

        const formNameEl = values.find((v: BpmnElement) => v?.$type === 'customExtension:FormName');

        const name: string | undefined = formNameEl?.value;
        if (!name) {
            showWarn(translate('Please select a form before setting form data'));
            return;
        }

        setFormName(name);
        setIsOpen(true);
    };

    return html`
    <div class="action-btn">
      <button
        class="bio-properties-panel-button"
        onClick=${handleSetInput}
        title=${translate("Set data input")}
        disabled=${disabled}
      >
        <i class="ri-settings-4-line" style="font-size:16px;"></i>
      </button>
    </div>

    <div class="form-preview-container" style=${{ display: isOpen ? 'flex' : 'none' }}>
      <div class="form-preview">
        <div class="form-preview-header">
          <h2>${formName}</h2>
          <a onClick=${() => setIsOpen(false)}><i class="ri-close-line"></i></a>
        </div>
        <div class="form-preview-content">
          <div ref=${containerRef}></div>
        </div>
      </div>
    </div>
  `;
}