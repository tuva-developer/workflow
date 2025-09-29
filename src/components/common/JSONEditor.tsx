import React, { useEffect, useRef } from "react";
import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

import * as ace from "ace-builds";
ace.config.set("basePath", "/ace");
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-textmate";

type Props = {
  value: unknown;
  onChange?: (value: unknown) => void;
  onValidate?: (isValid: boolean) => void;
  mode?: JSONEditorOptions["mode"];
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

const JsonEditor: React.FC<Props> = ({
  value,
  onChange,
  onValidate,
  mode = "code",
  height = 400,
  width = "100%",
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const onChangeRef = useRef<Props["onChange"]>(onChange);
  const onValidateRef = useRef<Props["onValidate"]>(onValidate);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onValidateRef.current = onValidate;
  }, [onValidate]);

  const initialModeRef = useRef(mode);
  const initialValueRef = useRef(value);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || editorRef.current) return;

    window.ace = ace;

    editorRef.current = new JSONEditor(el, {
      mode: initialModeRef.current,
      onChangeText: () => {
        try {
          const json = editorRef.current?.get();
          const isValid = json != null && typeof json === "object";
          onValidateRef.current?.(isValid);
          if (isValid) onChangeRef.current?.(json);
        } catch {
          onValidateRef.current?.(false);
        }
      },
    });

    try {
      editorRef.current.set(initialValueRef.current as unknown);
    } catch {
      onValidateRef.current?.(false);
    }

    return () => {
      try {
        editorRef.current?.destroy();
      } finally {
        editorRef.current = null;
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.setMode?.(mode);
  }, [mode]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    try {
      const cur = ed.get();
      const same =
        cur === value || JSON.stringify(cur) === JSON.stringify(value);
      if (!same) ed.set(value as unknown);
    } catch {
      onValidateRef.current?.(false);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width,
        ...style,
      }}
    />
  );
};

export default JsonEditor;
