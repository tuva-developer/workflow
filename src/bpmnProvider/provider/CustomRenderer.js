import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { attr as svgAttr } from 'tiny-svg';
import { isAny } from 'bpmn-js/lib/util/ModelUtil';
import { getTheme } from '@/global/appState';

const HIGH_PRIORITY = 1500;
const FILL_OPACITY = 0.2;

const ICON_PATHS = {
  'bpmn:Task': 'M12.56,87.39c6.93,0,12.56,5.62,12.56,12.56c0,6.93-5.62,12.56-12.56,12.56C5.62,112.5,0,106.88,0,99.95 C0,93.01,5.62,87.39,12.56,87.39L12.56,87.39z M35.07,88.24h86.38c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43 H35.07c-0.79,0-1.43-0.64-1.43-1.43V89.67C33.64,88.88,34.29,88.24,35.07,88.24L35.07,88.24z M35.07,44.7h86.38 c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43H35.07c-0.79,0-1.43-0.64-1.43-1.43V46.13 C33.64,45.34,34.29,44.7,35.07,44.7L35.07,44.7z M35.07,1.16h86.38c0.79,0,1.43,0.64,1.43,1.43v19.93c0,0.79-0.64,1.43-1.43,1.43 H35.07c-0.79,0-1.43-0.64-1.43-1.43V2.59C33.64,1.8,34.29,1.16,35.07,1.16L35.07,1.16z M12.56,43.69c6.93,0,12.56,5.62,12.56,12.56 c0,6.93-5.62,12.56-12.56,12.56C5.62,68.81,0,63.19,0,56.25C0,49.32,5.62,43.69,12.56,43.69L12.56,43.69z M12.56,0 c6.93,0,12.56,5.62,12.56,12.56c0,6.93-5.62,12.56-12.56,12.56C5.62,25.11,0,19.49,0,12.56C0,5.62,5.62,0,12.56,0L12.56,0z',
  'bpmn:ScriptTask': 'M0,69.1V53.79c4.65-0.04,8.13-1.42,10.49-4.12C12.82,46.96,14,40.87,14,31.41c0-7.22,0.26-12.56,0.81-16.03 c0.52-3.47,1.81-6.39,3.86-8.73c2.05-2.35,4.69-4.03,7.92-5.08C29.81,0.52,34.4,0,40.33,0h3.38v15.31c-6.2,0-9.9,0.63-11.12,1.92 c-1.22,1.27-1.88,3.77-1.96,7.48c-0.26,10.21-0.59,16.86-0.98,19.93c-0.41,3.05-1.35,5.98-2.81,8.77 c-1.46,2.79-4.19,5.47-8.18,8.03c3.8,2.31,6.54,5.06,8.24,8.24c1.72,3.21,2.75,7.81,3.03,13.83l0.96,18.63 c0.39,1.79,1.31,3.14,2.77,4.06c1.46,0.92,4.82,1.37,10.06,1.37v15.31h-3.34c-6.83,0-12.08-0.78-15.81-2.33 c-3.71-1.55-6.39-4.1-8.07-7.63c-1.66-3.55-2.49-9.27-2.49-17.14c0-8.7-0.31-14.26-0.89-16.71c-0.59-2.42-1.74-4.65-3.45-6.67 C7.94,70.36,4.73,69.27,0,69.1L0,69.1z M115.16,69.1c-4.65,0.04-8.14,1.42-10.49,4.17c-2.33,2.73-3.51,8.77-3.51,18.15 c0,7.26-0.26,12.61-0.76,16.1c-0.52,3.47-1.79,6.39-3.84,8.72c-2.05,2.36-4.71,4.03-7.94,5.08c-3.25,1.05-7.83,1.57-13.76,1.57 h-3.4v-15.31c5.95,0,9.6-0.61,10.93-1.85c1.35-1.24,2.07-3.75,2.16-7.55c0.26-10.93,0.65-17.93,1.18-21.03 c0.55-3.1,1.59-5.98,3.21-8.66c1.59-2.7,4.12-5.04,7.57-7.05c-3.64-2.38-6.19-4.73-7.63-7.02c-1.44-2.31-2.42-4.8-2.92-7.5 c-0.5-2.7-0.89-7.74-1.16-15.09c-0.24-7.35-0.55-11.56-0.9-12.61c-0.33-1.07-1.16-1.98-2.46-2.75c-1.31-0.76-4.62-1.16-9.97-1.16V0 h3.38c6.83,0,12.08,0.79,15.79,2.33c3.71,1.55,6.39,4.1,8.05,7.63c1.66,3.56,2.49,9.27,2.49,17.14c0,9.05,0.33,14.74,0.98,17.08 c0.68,2.36,1.83,4.49,3.53,6.43c1.68,1.94,4.84,2.99,9.49,3.16V69.1L115.16,69.1z',
  'bpmn:UserTask': 'M147.532 262.835c-9.491-15.114-27.284-35.632-27.284-53.334 0-10.001 7.88-23.041 19.17-25.943-.898-14.966-1.485-30.172-1.485-45.209 0-8.905.168-17.894.504-26.715 3.507-39.979 32.149-68.182 68.492-81.43C221.504 24.89 214.44.343 230.431.02c37.366-.968 98.79 33.225 122.753 59.168 15.251 16.864 23.961 38.69 24.469 61.43l-1.52 65.434c6.645 1.621 14.069 6.807 15.712 13.451 5.109 20.652-16.32 46.356-26.28 62.779-9.196 15.164-44.304 64.211-44.337 64.551-.167 1.771.741 4.024 3.155 7.637C378.895 409.396 512 362.119 512 511.142H0c0-149.115 133.15-101.744 187.617-176.67 2.691-3.957 3.92-6.089 3.89-7.826-.016-.93-40.362-58.059-43.975-63.811z',
  'bpmn:StartEvent': 'M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z',
  'bpmn:EndEvent': 'M10 50a40 40 0 1 0 80 0a40 40 0 1 0 -80 0'
};

const ICON_VIEWBOXS = {
  'bpmn:Task': '0 0 122.88 112.5',
  'bpmn:ScriptTask': '0 0 115.16 122.88',
  'bpmn:UserTask': '0 0 512 511.142',
  'bpmn:StartEvent': '0 0 448 512',
  'bpmn:EndEvent': '0 0 100 100',
}

const ICON_FILLS = {
  'bpmn:Task': '#347928',
  'bpmn:ScriptTask': '#E67514',
  'bpmn:UserTask': '#5459AC',
  'bpmn:StartEvent': '#1CA8DD',
  'bpmn:EndEvent': '#D93737',
}

const STROKE_COLORS = {
  'light': '#7E8186',
  'dark': '#C3C9D5',
}

const FILL_COLORS = {
  'light': '#FFFFFF',
  'dark': '#414244',
}

const TEXT_COLORS = {
  'light': '#414244',
  'dark': '#F1F3F9',
}

const CAN_RENDER_DEFAULT = [
  'bpmn:Task',
  'bpmn:UserTask',
  'bpmn:ScriptTask',
  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:SubProcess',
  'bpmn:Participant',
  'bpmn:Lane',
  'bpmn:SequenceFlow',
  'bpmn:ExclusiveGateway'
];

export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    return isAny(element, CAN_RENDER_DEFAULT) && !element.labelTarget;
  }

  drawShape(parentNode, element) {
    if (element.type === 'bpmn:Task' || element.type === 'bpmn:ScriptTask' || element.type === 'bpmn:UserTask') {
      return this._drawCustomTask(parentNode, element);
    }

    if (element.type === 'bpmn:StartEvent' || element.type === 'bpmn:EndEvent') {
      return this._drawCustomEvent(parentNode, element);
    }

    const shape = this.bpmnRenderer.drawShape(parentNode, element);
    const [stroke, fill] = this._getColors(element);
    this._applyStyles(parentNode, stroke, fill);
    return shape;
  }

  drawConnection(parentNode, element) {
    const theme = getTheme();
    const connection = this.bpmnRenderer.drawConnection(parentNode, element);
    const stroke = STROKE_COLORS[theme];
    const fill = STROKE_COLORS[theme];

    svgAttr(connection, { stroke });

    const markers = parentNode.querySelectorAll('marker');
    markers.forEach((marker) => {
      const path = marker.querySelector('path');
      if (path) {
        svgAttr(path, { stroke, fill });
      }
      svgAttr(marker, { stroke, fill });
    });

    const isSequenceFlow = element.type === 'bpmn:SequenceFlow';
    const isConditional = isSequenceFlow && !!element.businessObject.conditionExpression;

    const start = element.waypoints?.[0];
    const radius = 4;
    if (start && !isConditional) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      svgAttr(circle, {
        cx: start.x,
        cy: start.y,
        r: radius,
        fill: fill,
        stroke: stroke,
        strokeWidth: 1,
      });
      parentNode.appendChild(circle);
    }

    return connection;
  }

  _drawCustomTask(parentNode, element) {
    const theme = getTheme();
    const { width, height } = element;
    const stroke = STROKE_COLORS[theme];
    const fill = FILL_COLORS[theme];
    const textColor = TEXT_COLORS[theme];

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    svgAttr(rect, {
      x: 0,
      y: 0,
      width,
      height,
      rx: 10,
      ry: 10,
      fill,
      stroke,
      strokeWidth: 2,
    });
    parentNode.appendChild(rect);

    const icon = this._getIcon(element, 40, 40);
    parentNode.appendChild(icon);

    if (element.businessObject.name) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svgAttr(textEl, {
        x: width / 2,
        y: height + 20,
        'text-anchor': 'middle',
        'font-size': '12px',
        'font-weight': '500',
        'letter-spacing': 1.1,
        fill: textColor,
      });

      const lines = this._wrapText(element.businessObject.name, width + 16, 12);
      lines.forEach((line, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        svgAttr(tspan, {
          x: width / 2,
          dy: index === 0 ? 0 : 14,
        });
        tspan.textContent = line;
        textEl.appendChild(tspan);
      });

      parentNode.appendChild(textEl);
    }

    const loopCharacteristics = element.businessObject.loopCharacteristics;
    if (loopCharacteristics) {
      const isSequential = loopCharacteristics.isSequential;
      const markerPath = isSequential
        ? 'M2 5 L14 5 M2 8 L14 8 M2 11 L14 11'
        : 'M5 2 L5 14 M8 2 L8 14 M11 2 L11 14';

      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svgAttr(marker, {
        d: markerPath,
        stroke: ICON_FILLS[element.type],
        'stroke-width': 1.5,
        fill: 'none',
      });

      const markerWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgAttr(markerWrapper, {
        x: width / 2 - 8,
        y: height - 18,
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
      });

      markerWrapper.appendChild(marker);
      parentNode.appendChild(markerWrapper);
    }

    return rect;
  }

  _drawCustomEvent(parentNode, element) {
    const theme = getTheme();
    const { width } = element;
    const stroke = STROKE_COLORS[theme];
    const fill = FILL_COLORS[theme];

    const size = width;
    const center = size / 2;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    svgAttr(circle, {
      cx: center,
      cy: center,
      r: center,
      stroke,
      fill,
      strokeWidth: element.type === 'bpmn:StartEvent' ? 2 : 4,
    });
    parentNode.appendChild(circle);

    const icon = this._getIcon(element, 24, 24);
    parentNode.appendChild(icon);

    return circle;
  }

  _applyStyles(parentNode, stroke, fill) {
    const setAttrs = (elements) => {
      elements.forEach((el) => {
        svgAttr(el, {
          fill,
          stroke,
          'fill-opacity': FILL_OPACITY
        });
      });
    };

    setAttrs(parentNode.querySelectorAll('rect'));
    setAttrs(parentNode.querySelectorAll('circle'));
    setAttrs(parentNode.querySelectorAll('path'));
    setAttrs(parentNode.querySelectorAll('polygon'));
  }

  _getColors(element) {
    const theme = getTheme();
    const di = element.di || {};
    let defaultStroke, defaultFill;

    if (CAN_RENDER_DEFAULT.includes(element.type)) {
      switch (element.type) {
        case 'bpmn:SubProcess':
          defaultStroke = '#9FC87E';
          defaultFill = '#D0F3E3';
          break;
        case 'bpmn:Participant':
          defaultStroke = '#578FCA';
          defaultFill = '#D8E9F6';
          break;
        case 'bpmn:Lane':
          defaultStroke = '#D8E9F6';
          defaultFill = '#D8E9F6';
          break;
        case 'bpmn:ExclusiveGateway':
          defaultStroke = '#FFB84C';
          defaultFill = '#FFB84C';
          break;
      }
    } else {
      [defaultStroke, defaultFill] = [STROKE_COLORS[theme], FILL_COLORS[theme]];
    }

    const stroke = di.stroke || defaultStroke;
    const fill = di.fill || defaultFill;
    return [stroke, fill];
  }

  _getIcon(element, iconWidth, iconHeight) {
    const { width, height } = element;
    const x = element.type === 'bpmn:StartEvent' ? width / 2 - iconWidth / 2 + 2 : width / 2 - iconWidth / 2;
    const y = height / 2 - iconHeight / 2;

    const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgAttr(iconGroup, {
      viewBox: ICON_VIEWBOXS[element.type],
      width: iconWidth,
      height: iconHeight,
      x,
      y,
    });

    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgAttr(iconPath, {
      d: ICON_PATHS[element.type],
      fill: ICON_FILLS[element.type],
    });
    iconGroup.appendChild(iconPath);

    return iconGroup;
  }

  _wrapText(text, maxWidth, fontSize) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';

    const measureText = (txt) => {
      return txt.length * fontSize * 0.6;
    };

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      const lineWidth = measureText(testLine);
      if (lineWidth > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) lines.push(line);
    return lines;
  }

  _getSmoothPath(waypoints) {
    if (waypoints.length < 2) return '';

    let path = `M${waypoints[0].x},${waypoints[0].y}`;
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      const curveRadius = 10;

      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      const offset1 = Math.min(curveRadius, len1 / 2);
      const offset2 = Math.min(curveRadius, len2 / 2);

      const x1 = curr.x - (dx1 / len1) * offset1;
      const y1 = curr.y - (dy1 / len1) * offset1;
      const x2 = curr.x + (dx2 / len2) * offset2;
      const y2 = curr.y + (dy2 / len2) * offset2;

      path += ` L${x1},${y1} Q${curr.x},${curr.y} ${x2},${y2}`;
    }

    const last = waypoints[waypoints.length - 1];
    path += ` L${last.x},${last.y}`;
    return path;
  }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'config'];