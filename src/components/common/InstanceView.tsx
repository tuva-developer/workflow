import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { RiTimerLine, RiTimerFill } from "react-icons/ri";
import { GiDuration } from "react-icons/gi";
import BpmnViewer from "bpmn-js/lib/Viewer";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import CustomRendererProvider from "@/bpmnProvider/CustomRendererProvider.js";
import { useTranslation } from "react-i18next";
import SyntaxHighlighterTabs from "@/components/dialogs/ElementDetailDlg";
import { useInstanceQuery } from "@/hooks/query/useInstancesQuery";
import { useNavigate } from "react-router-dom";

const runColor = "#007bff";
const endColor = "#28a745";
const createColor = "#9E9E9E";
const notexecutedColor = "#FF7D29";
const noneColor = "#3C3D37";
const waitColor = "#FF7D29";
const fillOpacity = "0.2";

interface InstanceProps {
  instanceId: string;
  isResetZoom?: boolean;
  isOpen?: boolean;
}

interface InstanceActivity {
  id: string;
  status?: "run" | "end" | "executed" | "create" | "notexecuted" | string;
  duration?: number;
  output?: unknown;
}
interface InstanceFlow {
  id: string;
  status?: InstanceActivity["status"];
}

type BpmnCanvas = {
  zoom: (level?: number | "fit-viewport", origin?: unknown) => unknown;
  viewbox: (box?: unknown) => unknown;
  addMarker: (id: string, cls: string) => void;
  removeMarker: (id: string, cls: string) => void;
};
type BpmnEventBus = {
  on: (
    event: string,
    cb: (evt: {
      element: { id: string; type?: string };
      originalEvent?: Event;
    }) => void
  ) => void;
  off: (event: string) => void;
};
type BpmnElementRegistry = {
  get: (id: string) => unknown;
  getAll: () => Array<{ id: string }>;
  getGraphics: (el: unknown) => SVGElement | null;
};
type BpmnOverlays = {
  add: (
    id: string,
    type: string,
    cfg: {
      position: { top?: number; left?: number; right?: number };
      html: string;
    }
  ) => void;
  remove: (filter: { element: string; type: string }) => void;
};

type ExtValue = { $type?: string; $body?: unknown };
type ExtensionElements = { values?: ExtValue[] };
type BO = { name?: unknown; extensionElements?: ExtensionElements };

type BpmnElementLite = {
  id: string;
  businessObject?: BO;
};

const InstanceView: React.FC<InstanceProps> = ({
  instanceId,
  isResetZoom = true,
  isOpen = true,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const viewModelRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnViewer | null>(null);
  const lastRunTokenRef = useRef<symbol | null>(null);
  const didInitialFitRef = useRef(false);

  const [isOpenSyntaxHighlighter, setIsOpenSyntaxHighlighter] = useState(false);
  const [script, setScript] = useState("");
  const [dataOutput, setDataOutput] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [elementId, setElementId] = useState("");
  const [elementName, setElementName] = useState("");

  const statusColors = [
    { status: "end", color: endColor, label: "ended / executed" },
    { status: "run", color: runColor, label: "running" },
    { status: "create", color: createColor, label: "created" },
    { status: "notexecuted", color: notexecutedColor, label: "not executed" },
    { status: "none status", color: noneColor, label: "none status" },
  ];

  const { data: instanceData, error } = useInstanceQuery(instanceId, isOpen);

  const outputMap = useMemo(() => {
    const map = new Map<string, unknown>();
    const acts = instanceData?.data?.activity as unknown;
    if (Array.isArray(acts)) {
      acts.forEach((a) => {
        const item = a as Partial<InstanceActivity>;
        if (typeof item.id === "string") {
          map.set(item.id, item.output);
        }
      });
    }
    return map;
  }, [instanceData]);

  const logsMap = useMemo(() => {
    const map = new Map<string, Log[]>();
    const allLogs = instanceData?.logs;
    if (Array.isArray(allLogs)) {
      allLogs.forEach((log) => {
        const eid = log.activityId;
        if (!map.has(eid)) map.set(eid, []);
        map.get(eid)!.push(log);
      });
    }
    return map;
  }, [instanceData]);

  const handleClickElement = useCallback(
    (element: BpmnElementLite) => {
      setElementId(element.id);

      const bo = element.businessObject;
      const name = typeof bo?.name === "string" ? bo!.name : "";
      setElementName(name);

      let scriptStr = "";
      const extValues = bo?.extensionElements?.values;
      if (Array.isArray(extValues)) {
        const found = extValues.find(
          (ext) => ext.$type === "customExtension:script"
        );
        if (typeof found?.$body === "string") {
          scriptStr = found.$body;
        }
      }

      const output = outputMap.get(element.id);
      const dataOutputStr =
        output == null ? "" : JSON.stringify(output, null, 2);
      const elementLogs = logsMap.get(element.id) ?? [];

      setScript(scriptStr);
      setDataOutput(dataOutputStr);
      setLogs(elementLogs);
      setIsOpenSyntaxHighlighter(true);
    },
    [logsMap, outputMap]
  );

  useEffect(() => {
    if (!isOpen) {
      viewerRef.current?.destroy();
      viewerRef.current = null;
      didInitialFitRef.current = false;
      return;
    }

    if (viewModelRef.current && !viewerRef.current) {
      viewerRef.current = new BpmnViewer({
        container: viewModelRef.current,
        additionalModules: [
          MoveCanvasModule,
          ZoomScrollModule,
          {
            __init__: ["customRendererProvider"],
            customRendererProvider: ["type", CustomRendererProvider],
          },
        ],
      });
      didInitialFitRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (error) {
      sessionStorage.setItem("message_type", "instance_not_found");
      navigate("/message_error", { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!isOpen) return;
    if (!viewerRef.current) return;
    if (!instanceData?._id || !instanceData?.model) return;

    function setColorActivity(
      elementId: string,
      fillColor: string,
      strokeColor: string,
      opacity: string,
      duration = 0
    ) {
      const elementRegistry = viewerRef.current?.get("elementRegistry") as
        | BpmnElementRegistry
        | undefined;
      const overlays = viewerRef.current?.get("overlays") as
        | BpmnOverlays
        | undefined;
      const element = elementRegistry?.get(elementId);
      if (!element || !elementRegistry) return;

      const gfx = elementRegistry.getGraphics(element);
      if (!gfx) return;

      const rect = gfx.querySelector("g rect") as SVGRectElement | null;
      if (rect) {
        const hasStyle = rect.hasAttribute("style");
        if (hasStyle) {
          rect.style.fill = fillColor;
          rect.style.stroke = strokeColor;
          rect.style.fillOpacity = opacity;
        } else {
          rect.setAttribute(
            "style",
            `fill:${fillColor};stroke:${strokeColor};fill-opacity:${opacity}`
          );
        }
      }

      const circle = gfx.querySelector("g circle") as SVGCircleElement | null;
      if (circle) {
        const hasStyle = circle.hasAttribute("style");
        if (hasStyle) {
          circle.style.fill = fillColor;
          circle.style.stroke = strokeColor;
          circle.style.fillOpacity = opacity;
        } else {
          circle.setAttribute(
            "style",
            `fill:${fillColor};stroke:${strokeColor};fill-opacity:${opacity}`
          );
        }
      }

      const hitArea = gfx.querySelector(
        ".djs-hit, .djs-hit-all"
      ) as SVGElement | null;
      if (hitArea) {
        const hasStyle = hitArea.hasAttribute("style");
        if (hasStyle) {
          (hitArea.style as CSSStyleDeclaration).fillOpacity = "0";
          (hitArea.style as CSSStyleDeclaration).strokeOpacity = "0";
        } else {
          hitArea.setAttribute("style", "fill-opacity:0;stroke-opacity:0");
        }
      }

      if (duration && overlays) {
        overlays.remove({ element: elementId, type: "duration-overlay" });
        overlays.add(elementId, "duration-overlay", {
          position: { top: 2, right: 36 },
          html: `<div style="background: rgba(0,0,0,.7); color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px;">
                 ${Math.trunc(duration * 1000)}ms
               </div>`,
        });
      }

      const visual = gfx.querySelector("g.djs-visual") as SVGGElement | null;
      const paths = visual?.querySelectorAll("path");
      const polygon = visual?.querySelector(
        "polygon"
      ) as SVGPolygonElement | null;

      paths?.forEach((p) => {
        const hasStyle = p.hasAttribute("style");
        if (hasStyle) {
          (p.style as CSSStyleDeclaration).stroke = strokeColor;
          if (!p.hasAttribute("data-corner-radius"))
            (p.style as CSSStyleDeclaration).fill = fillColor;
        } else {
          p.setAttribute(
            "style",
            `fill:${fillColor};stroke-linecap:round;stroke-linejoin:round;stroke:${strokeColor};stroke-width:2px;`
          );
        }
      });

      if (polygon) {
        const hasStyle = polygon.hasAttribute("style");
        if (hasStyle) {
          (polygon.style as CSSStyleDeclaration).fill = fillColor;
          (polygon.style as CSSStyleDeclaration).stroke = strokeColor;
          (polygon.style as CSSStyleDeclaration).fillOpacity = opacity;
        } else {
          polygon.setAttribute(
            "style",
            `fill:${fillColor};stroke:${strokeColor};fill-opacity:${opacity}`
          );
        }
      }
    }

    function setColorFlow(id: string, color: string) {
      const elementRegistry = viewerRef.current?.get("elementRegistry") as
        | BpmnElementRegistry
        | undefined;
      const element = elementRegistry?.get(id);
      if (!element || !elementRegistry) return;

      const gfx = elementRegistry.getGraphics(element);
      if (!gfx) return;

      const visual = gfx.querySelector("g.djs-visual") as SVGGElement | null;
      const flowPaths = visual?.querySelectorAll("path");

      flowPaths?.forEach((p) => {
        const hasStyle = p.hasAttribute("style");
        if (hasStyle) {
          (p.style as CSSStyleDeclaration).stroke = color;
          if (!p.hasAttribute("data-corner-radius"))
            (p.style as CSSStyleDeclaration).fill = color;
        } else {
          p.setAttribute(
            "style",
            `fill:${color};stroke-linecap:round;stroke-linejoin:round;stroke:${color};stroke-width:2px;`
          );
        }
      });

      const flowCircle = visual?.querySelector(
        "circle"
      ) as SVGCircleElement | null;
      if (!flowCircle) return;

      const hasStyle = flowCircle.hasAttribute("style");
      if (hasStyle) {
        (flowCircle.style as CSSStyleDeclaration).stroke = color;
        (flowCircle.style as CSSStyleDeclaration).fill = color;
        (flowCircle.style as CSSStyleDeclaration).fillOpacity = "1";
      } else {
        flowCircle.setAttribute(
          "style",
          `fill:${color};stroke:${color};fill-opacity:1`
        );
      }
    }

    const statusToColor = (status?: string) => {
      switch (status) {
        case "run":
          return runColor;
        case "end":
        case "executed":
          return endColor;
        case "create":
          return createColor;
        case "notexecuted":
          return notexecutedColor;
        default:
          return noneColor;
      }
    };

    function setInstanceColor() {
      const viewer = viewerRef.current;
      const inst = instanceData;

      if (!viewer || !inst?._id) return;

      const elementRegistry = viewer.get(
        "elementRegistry"
      ) as BpmnElementRegistry;
      const overlays = viewer.get("overlays") as BpmnOverlays;

      elementRegistry.getAll().forEach((el) => {
        setColorActivity(el.id, "#F5F5F5", noneColor, fillOpacity);
      });

      const activities: InstanceActivity[] = Array.isArray(inst.data?.activity)
        ? (inst.data!.activity as InstanceActivity[])
        : [];

      for (const a of activities) {
        if (!a?.id) continue;
        const c = statusToColor(a.status);
        setColorActivity(a.id, c, c, fillOpacity, a.duration ?? 0);
      }

      const flows: InstanceFlow[] = Array.isArray(inst.data?.flow)
        ? (inst.data!.flow as InstanceFlow[])
        : [];

      for (const f of flows) {
        if (!f?.id) continue;
        setColorFlow(f.id, statusToColor(f.status));
      }

      const waits: { id: string }[] = Array.isArray(inst.data?.wait)
        ? (inst.data!.wait as { id: string }[])
        : [];

      for (const w of waits) {
        if (!w?.id) continue;

        overlays.remove({ element: w.id, type: "wait-overlay" });

        const shape = elementRegistry.get(w.id) as
          | { width?: number; height?: number }
          | undefined;
        const width = (shape?.width ?? 100) + 2;
        const height = (shape?.height ?? 80) + 2;

        overlays.add(w.id, "wait-overlay", {
          position: { top: -1, left: -1 },
          html: `<div class="wait-overlay" style="
        position:absolute;
        width:${width}px;height:${height}px;
        border-radius:10px;box-sizing:border-box;pointer-events:none;
        animation:pulseGlow .8s ease-in-out infinite;"></div>
      <style>
        @keyframes pulseGlow {
          0%,100% { opacity:.6; box-shadow:0 0 6px ${waitColor}, 0 0 10px ${waitColor}; }
          50%     { opacity:1;  box-shadow:0 0 10px ${waitColor}, 0 0 14px ${waitColor}; }
        }
      </style>`,
        });
      }
    }

    const token = Symbol();
    lastRunTokenRef.current = token;

    (async () => {
      try {
        const canvas = viewerRef.current!.get("canvas") as BpmnCanvas;

        let prevViewbox: unknown | null = null;
        if (!isResetZoom) {
          try {
            prevViewbox = canvas.viewbox();
          } catch {
            // ignore viewbox read error
          }
        }

        await viewerRef.current!.importXML(instanceData.model);

        if (lastRunTokenRef.current !== token) return;

        if (isResetZoom || !didInitialFitRef.current) {
          canvas.zoom("fit-viewport", "auto");
          const current = canvas.zoom() as number;
          canvas.zoom(current - 0.1, "auto");
          didInitialFitRef.current = true;
        } else if (prevViewbox) {
          canvas.viewbox(prevViewbox);
        }

        const eventBus = viewerRef.current!.get("eventBus") as BpmnEventBus;
        eventBus.off("element.hover");
        eventBus.off("element.out");
        eventBus.off("element.click");

        eventBus.on("element.hover", (event) => {
          const el = event.element;
          if (
            ["label", "bpmn:Participant", "bpmn:Collaboration"].includes(
              el.type ?? ""
            )
          )
            return;
          canvas.addMarker(el.id, "bpmn-hover-highlight");
        });
        eventBus.on("element.out", (event) => {
          const el = event.element;
          if (
            ["label", "bpmn:Participant", "bpmn:Collaboration"].includes(
              el.type ?? ""
            )
          )
            return;
          canvas.removeMarker(el.id, "bpmn-hover-highlight");
        });
        eventBus.on("element.click", (event) => {
          event.originalEvent?.preventDefault();
          const el = event.element;
          if (
            ["label", "bpmn:Participant", "bpmn:Collaboration"].includes(
              el.type ?? ""
            )
          )
            return;
          handleClickElement(
            el as { id: string; businessObject?: Record<string, unknown> }
          );
        });

        setInstanceColor();
      } catch (err) {
        console.error("Error importing BPMN diagram:", err);
      }
    })();
  }, [
    isOpen,
    instanceData,
    instanceData?._id,
    instanceData?.model,
    isResetZoom,
    handleClickElement,
  ]);

  return (
    <>
      <Box
        ref={viewModelRef}
        sx={{
          flex: 1,
          position: "relative",
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `radial-gradient(circle, ${theme.palette.divider} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            p: "8px 12px",
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            zIndex: 100,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              gap: 12,
            }}
          >
            {statusColors.map((item) => (
              <li
                key={item.status}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  fontSize: 12,
                  color: theme.palette.text.primary,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: item.color,
                    display: "inline-block",
                    borderRadius: 2,
                    marginRight: 2,
                  }}
                />
                {t(item.label)}
              </li>
            ))}
          </ul>
        </Box>

        {instanceData?._id && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              position: "absolute",
              bottom: 10,
              right: 10,
              p: "8px 12px",
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              zIndex: 100,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexShrink: 0,
              }}
            >
              <RiTimerLine size={16} color="#006A71" />
              <Typography
                sx={{ color: theme.palette.text.primary, fontSize: 13 }}
              >
                {t("Created at")}:{" "}
                {new Date(instanceData.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <RiTimerFill size={16} color="#E83F25" />
              <Typography
                sx={{ color: theme.palette.text.primary, fontSize: 13 }}
              >
                {t("Updated at")}:{" "}
                {new Date(instanceData.updated_at).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <GiDuration size={16} color="#FFA725" />
              <Typography
                sx={{ color: theme.palette.text.primary, fontSize: 13 }}
              >
                {t("Duration")}:{" "}
                {instanceData?.data?.duration
                  ? `${Math.floor(instanceData.data.duration * 1000)}ms`
                  : "N/A"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <SyntaxHighlighterTabs
        open={isOpenSyntaxHighlighter}
        onClose={() => setIsOpenSyntaxHighlighter(false)}
        elementId={elementId}
        elementName={elementName}
        script={script}
        dataOutput={dataOutput}
        logs={logs}
      />
    </>
  );
};

export default InstanceView;
