import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import { getReadonlyMode } from '@/global/appState';

export default class CustomPalette extends PaletteProvider {
    constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate, eventBus) {
        super(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate);

        ['updatePalete', 'changeLanguage'].forEach(event => {
            eventBus.on(event, () => {
                palette._update();
            });
        });

        this.palette = palette;
    }

    getPaletteEntries(element) {
        const originalEntries = super.getPaletteEntries(element);

        if (getReadonlyMode()) {
            const allowedKeys = ['hand-tool', 'lasso-tool', 'space-tool'];

            return Object.fromEntries(
                Object.entries(originalEntries).filter(([key]) =>
                    allowedKeys.includes(key)
                )
            );
        }

        const blacklistedKeys = [
            'create.group',
            'create.data-store',
            'create.data-object',
            'create.intermediate-event'
        ];

        const filteredEntries = Object.fromEntries(
            Object.entries(originalEntries).filter(([key]) => !blacklistedKeys.includes(key))
        );

        if (filteredEntries['create.task']) {
            filteredEntries['create.task'].action = {
                dragstart: (event) => {
                    const shape = this._elementFactory.createShape({ type: 'bpmn:ScriptTask' });
                    this._create.start(event, shape);
                },
                click: (event) => {
                    const shape = this._elementFactory.createShape({ type: 'bpmn:ScriptTask' });
                    this._create.start(event, shape);
                }
            };
        }
        return filteredEntries;
    }
}

CustomPalette.$inject = [
    'palette',
    'create',
    'elementFactory',
    'spaceTool',
    'lassoTool',
    'handTool',
    'globalConnect',
    'translate',
    'eventBus'
];