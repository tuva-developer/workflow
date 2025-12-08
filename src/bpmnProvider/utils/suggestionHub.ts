let _fnSuggestions: Array<{
  caption: string;
  value: string;
  meta?: string;
}> = [];
let _completerAdded = false;

export function setFunctionSuggestions(
  list: Array<{ caption: string; value: string }>
) {
  _fnSuggestions = list.map((x) => ({ ...x, meta: "function" }));
}

export function getFunctionSuggestions() {
  return _fnSuggestions;
}

function getStaticSuggestions() {
  const METHODS: Record<string, string[]> = {
    console: ["log", "error"],
    activity: [
      "constructor",
      "getInput",
      "setStatus",
      "disableInvoke",
      "getInputCollection",
      "getOutput",
      "setOutput",
      "importForm",
      "getProcess",
      "setCollectionValue",
      "setData",
      "getData",
    ],
    engine: [
      "log",
      "error",
      "getInput",
      "getOutput",
      "getInputCollection",
      "getProcess",
      "getActivity",
      "getGlobalData",
      "addGlobalData",
      "addResultData",
      "getBinaryData",
      "fetch",
      "getUploadFileList",
      "getFileData",
      "getFileDataStr",
      "createBuffer",
      "getBuffer",
      "getFormDataKV",
    ],
    blob: ["constructor", "toString"],
    formData: [
      "constructor",
      "append",
      "entries",
      "toString",
      "generateMultipartBody",
    ],
    "": ["isRealValue", "fetch"],
  };

  const s: unknown[] = [];
  for (const [obj, methods] of Object.entries(METHODS)) {
    for (const m of methods) {
      const text = obj ? `${obj}.${m}()` : `${m}()`;
      s.push({ caption: text, value: text, meta: "function" });
    }
  }
  s.push(
    {
      caption: "setTimeout = (cb, ms)",
      value: "setTimeout = (cb, ms) => timer(ms, 0, cb, wfscriptid)",
      meta: "snippet",
    },
    {
      caption: "setInterval = (cb, ms)",
      value: "setInterval = (cb, ms) => timer(0, ms, cb, wfscriptid)",
      meta: "snippet",
    }
  );
  return s;
}

export function addGlobalCompleter(ace) {
  if (_completerAdded) return;

  const langTools = ace.require("ace/ext/language_tools");

  const customCompleter = {
    getCompletions: (
      _ed: unknown,
      _sess: unknown,
      _pos: unknown,
      _prefix: string,
      cb
    ) => {
      const out = [...getStaticSuggestions(), ...getFunctionSuggestions()];
      cb(null, out);
    },
  };

  langTools.addCompleter(customCompleter);
  _completerAdded = true;
}
