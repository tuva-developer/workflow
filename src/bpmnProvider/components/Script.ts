import { html } from "htm/preact";
import {
  useEffect,
  useState,
  useRef,
} from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { getTheme } from "@/global/appState";

import ace from "ace-builds/src-noconflict/ace";
ace.config.set("basePath", "/node_modules/ace-builds/src-noconflict");
ace.config.setModuleUrl(
  "ace/mode/javascript_worker",
  `${import.meta.env.BASE_URL}ace/worker-javascript.js`
);

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/worker-javascript";
import "ace-builds/src-noconflict/ext-beautify";
import {
  addGlobalCompleter,
  setFunctionSuggestions,
} from "@/bpmnProvider/utils/suggestionHub";
import { readFunctionsFromCollaboration } from "@/bpmnProvider/utils/defines";

export function Script(props) {
  const { element, id, disabled } = props;
  const theme = getTheme();

  const bpmnFactory = useService("bpmnFactory");
  const eventBus = useService("eventBus");
  const translate = useService("translate");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const aceEditor = useRef<ReturnType<typeof ace.edit> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  function decodeHTMLEntities(str) {
    if (!str) return str;

    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
  }

  function getAceMode(scriptFormat) {
    switch (scriptFormat) {
      case "JavaScript":
        return "ace/mode/javascript";
      case "PHP":
        return "ace/mode/php";
      case "C++":
        return "ace/mode/c_cpp";
      default:
        return "ace/mode/text";
    }
  }

  useEffect(() => {
    if (!editorRef.current) return;

    const businessObject = getBusinessObject(element);

    addGlobalCompleter(ace);
    const editor = ace.edit(editorRef.current);
    aceEditor.current = editor;

    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      showPrintMargin: false,
    });

    const beautify = ace.require("ace/ext/beautify");

    editor.commands.addCommand({
      name: "beautify",
      bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
      exec: function (editor) {
        beautify.beautify(editor.session);
      },
    });

    const scriptElement = businessObject.extensionElements?.values.find(
      (v) => v.$type === "customExtension:Script"
    );
    const script = decodeHTMLEntities(scriptElement?.value || "");
    editor.setValue(script, -1);
    editor.setReadOnly(disabled);

    const scriptFormatElement = businessObject.extensionElements?.values.find(
      (v) => v.$type === "customExtension:ScriptFormat"
    );
    const scriptFormat = scriptFormatElement?.value || "";
    const mode = getAceMode(scriptFormat);

    editor.getSession().setMode(mode);
    editor.getSession().setUseWorker(scriptFormat === "JavaScript");

    editor.on("change", () => {
      const value = editor.getValue();
      const businessObject = getBusinessObject(element);

      if (!businessObject.extensionElements) {
        businessObject.extensionElements = bpmnFactory.create(
          "bpmn:ExtensionElements",
          {
            values: [],
          }
        );
      }

      let scriptElement = businessObject.extensionElements.values.find(
        (v) => v.$type === "customExtension:Script"
      );

      if (!scriptElement) {
        scriptElement = bpmnFactory.create("customExtension:Script", { value });
        businessObject.extensionElements.values.push(scriptElement);
      } else {
        scriptElement.value = value;
      }
    });

    try {
      const initList = readFunctionsFromCollaboration(element);
      setFunctionSuggestions(initList);
    } catch (e) {
      console.error("Error:", e);
    }

    return () => {
      editor.destroy();
    };
  }, [element, disabled, bpmnFactory]);

  useEffect(() => {
    if (!aceEditor.current) return;

    aceEditor.current.setTheme(
      theme === "light" ? "ace/theme/chrome" : "ace/theme/monokai"
    );
  }, [theme, element]);

  useEffect(() => {
    const businessObject = getBusinessObject(element);
    const scriptFormatElement = businessObject.extensionElements?.values.find(
      (v) => v.$type === "customExtension:ScriptFormat"
    );
    const scriptFormat = scriptFormatElement?.value || "";

    const mode = getAceMode(scriptFormat);

    if (aceEditor.current) {
      aceEditor.current.getSession().setMode(mode);
      aceEditor.current
        .getSession()
        .setUseWorker(scriptFormat === "JavaScript");
    }
  }, [element]);

  function handleFullScreen() {
    setIsFullscreen(!isFullscreen);
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleFullScreen();
    }

    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      event.stopPropagation();

      eventBus.fire("updateModel");
    }
  };

  useEffect(() => {
    if (!eventBus || !element) return;

    const onToggle = () => {
      setIsFullscreen(true);
    };

    eventBus.on("scriptEditor.toggle", onToggle);
    return () => eventBus.off("scriptEditor.toggle", onToggle);
  }, [eventBus, element]);

  return html`
    <div class=${`script-editor ${isFullscreen ? "full-screen" : ""}`}>
      <a onClick=${handleFullScreen}>
        ${isFullscreen
          ? html`<i class="ri-close-line"></i>`
          : html`<i class="ri-fullscreen-line"></i>`}
      </a>
      <div id=${id} ref=${editorRef} onKeyDown=${handleKeyDown}></div>
      <div class="bio-properties-panel-description">
        <p style="font-size: 12px; margin: 6px 0 0 0">
          ${translate("Shortcuts")}:
        </p>
        <ul>
          <li style="font-size: 11px; list-style-type: circle;">
            ${translate("(Ctrl + Shift + F) to format code")}
          </li>
          <li style="font-size: 11px; list-style-type: circle;">
            ${translate("(Ctrl + S) to save")}
          </li>
        </ul>
      </div>
    </div>
  `;
}
