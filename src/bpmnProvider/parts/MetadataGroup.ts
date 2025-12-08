// MetadataGroup.ts
import { VNode } from 'preact';
import { MetadataEditor } from '@/bpmnProvider/components/MetadataEditor';
import { MetadataPreview } from '@/bpmnProvider/components/MetadataPreview';
import { setEntriesReadonly } from '@/bpmnProvider/utils/defines';
import type { Element as BpmnElement } from 'bpmn-js/lib/model/Types';

interface Props {
  id: string;
  element: BpmnElement;
}

interface MetadataEntry {
  id: string;
  element: BpmnElement;
  component(props: Props): VNode;
  isEdited?: boolean;
}

export function MetadataGroup(element: BpmnElement) {
  const entries: MetadataEntry[] = [
    {
      id: 'metadata-preview',
      element,
      component: MetadataPreview
    },
    {
      id: 'metadata',
      element,
      component: MetadataEditor,
    }
  ];

  return setEntriesReadonly(entries);
}