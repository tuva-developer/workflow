import CustomPropertiesPanel from '@/bpmnProvider/provider/CustomPropertiesPanel';
import CustomContextPad from '@/bpmnProvider/provider/CustomContextPad';
import CustomRenderer from '@/bpmnProvider/provider/CustomRenderer';
import CustomPalette from '@/bpmnProvider/provider/CustomPalette';
import CustomReplaceMenu from '@/bpmnProvider/provider/CustomReplaceMenu';
import AutoAssignWhenEmpty from '@/bpmnProvider/provider/AutoAssignWhenEmpty';

export default {
  __init__: [
    'propertiesProvider',
    'contextPadProvider',
    'renderer',
    'paletteProvider',
    'replaceMenuProvider',
    'autoAssignWhenEmpty',
  ],
  propertiesProvider: ['type', CustomPropertiesPanel],
  contextPadProvider: ['type', CustomContextPad],
  renderer: ['type', CustomRenderer],
  paletteProvider: ['type', CustomPalette],
  replaceMenuProvider: ['type', CustomReplaceMenu],
  autoAssignWhenEmpty: ['type', AutoAssignWhenEmpty]
};