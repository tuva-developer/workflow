import CustomPropertiesProvider from '@/bpmnProvider/CustomPropertiesProvider';
import CustomContextPadProvider from '@/bpmnProvider/CustomContextPadProvider';
import CustomRendererProvider from '@/bpmnProvider/CustomRendererProvider';
import CustomPaletteProvider from '@/bpmnProvider/CustomPaletteProvider';
import CustomReplaceMenuProvider from '@/bpmnProvider/CustomReplaceMenuProvider';

export default {
  __init__: [
    'propertiesProvider',
    'contextPadProvider',
    'renderer',
    'paletteProvider',
    'replaceMenuProvider',
  ],
  propertiesProvider: ['type', CustomPropertiesProvider],
  contextPadProvider: ['type', CustomContextPadProvider],
  renderer: ['type', CustomRendererProvider],
  paletteProvider: ['type', CustomPaletteProvider],
  replaceMenuProvider: ['type', CustomReplaceMenuProvider],
};