import { html } from "htm/preact";
import { useEffect, useState } from "@bpmn-io/properties-panel/preact/hooks";
import { useService } from "bpmn-js-properties-panel";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

export function MetadataPreview(props) {
  const { element } = props;

  const translate = useService("translate");
  const eventBus = useService("eventBus");

  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    const refreshPreview = () => {
      const bo = getBusinessObject(element);
      const metadataElement = bo?.extensionElements?.values?.find(
        (v) => v.$type === "customExtension:Metadata"
      );

      const raw = metadataElement?.value || "";

      if (!raw) {
        setHighlighted("");
        return;
      }

      let formatted = raw;

      try {
        formatted = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        // nếu không phải JSON hợp lệ thì giữ nguyên
      }

      const htmlCode = Prism.highlight(formatted, Prism.languages.json, "json");
      setHighlighted(htmlCode);
    };

    refreshPreview();

    const handler = (evt) => {
      if (!evt || !evt.element) return;

      if (evt.element.id === element.id) {
        refreshPreview();
      }
    };

    eventBus.on("element.changed", handler);

    return () => {
      eventBus.off("element.changed", handler);
    };
  }, [element, eventBus]);

  const content = highlighted.trim() ? highlighted : translate("No data");

  return html`
    <div class="metadata-highlight">
      <pre style=${{ fontSize: "11px" }}>
        <code
          class="language-json"
          dangerouslySetInnerHTML=${{ __html: content }}
        />
      </pre>
    </div>
  `;
}
