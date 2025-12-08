import { requestWithRefresh } from "@/api/client";
import {
  ModelQuery,
  PagedModels,
  CreateModelInput,
  UpdateModelInput,
  DeleteModelInput,
  SetReadOnlyInput,
  ModelPermission,
  DebugModelInput,
  DebugModelWithFileInput,
  DebugModelWithMultipartInput,
  RunModelInput,
  RunModelWithFileInput,
  RunModelWithMultipartInput,
} from "@/services/types";

export type CreateModelResponse = { id: string };

const asObject = (v: unknown): Record<string, unknown> | null =>
  typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;

const asArray = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);

const asNumber = (v: unknown, fallback: number): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const asBoolean = (v: unknown, fallback: boolean): boolean =>
  typeof v === "boolean" ? v : fallback;

export function normalizePaged(data: unknown): PagedModels {
  const obj = asObject(data) ?? {};

  const modelsArr = asArray(obj["models"]);
  const items = (modelsArr ?? []) as Model[];

  const len = items.length;

  return {
    items,
    total: asNumber(obj["total"], 0),
    page: asNumber(obj["page"], 1),
    limit: asNumber(obj["limit"], len),
    totalPages: asNumber(obj["totalPages"], 1),
    hasNext: asBoolean(obj["hasNext"], false),
    hasPrev: asBoolean(obj["hasPrev"], false),
  };
}

export async function loadAllModels(params?: ModelQuery): Promise<PagedModels> {
  const res = await requestWithRefresh<unknown>({
    method: "GET",
    url: "/api/v2/workflow/models",
    params: { hasConfig: false, ...(params || {}) },
    headers: { "Content-Type": "application/json" },
  });
  return normalizePaged(res.data);
}

export async function loadEditableModels(
  params?: ModelQuery
): Promise<PagedModels> {
  const res = await requestWithRefresh<unknown>({
    method: "GET",
    url: "/api/v2/workflow/models/edit",
    params: { hasConfig: false, ...(params || {}) },
    headers: { "Content-Type": "application/json" },
  });
  return normalizePaged(res.data);
}

export async function loadExecuteModels(
  params?: ModelQuery
): Promise<PagedModels> {
  const res = await requestWithRefresh<unknown>({
    method: "GET",
    url: "/api/v2/workflow/models/execute",
    params: { hasConfig: false, ...(params || {}) },
    headers: { "Content-Type": "application/json" },
  });
  return normalizePaged(res.data);
}

export async function loadModelData(id: string, onlyXML: true): Promise<string>;

export async function loadModelData(
  id: string,
  onlyXML?: false
): Promise<Model>;

export async function loadModelData(
  id: string,
  onlyXML: boolean = false
): Promise<Model | string> {
  if (onlyXML) {
    const res = await requestWithRefresh<string>({
      method: "GET",
      url: `/api/v2/workflow/model/${encodeURIComponent(id)}?onlyXML=true`,
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  }

  const res = await requestWithRefresh<Model>({
    method: "GET",
    url: `/api/v2/workflow/model/${encodeURIComponent(id)}?onlyXML=false`,
    params: { data: "all" },
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function createModel(
  input: CreateModelInput
): Promise<CreateModelResponse> {
  const { name, categoryId, typeId, xml } = input;
  const res = await requestWithRefresh<CreateModelResponse>({
    method: "POST",
    url:
      `/api/v2/workflow/model` +
      `?name=${encodeURIComponent(name)}` +
      `&categoryId=${encodeURIComponent(categoryId)}` +
      `&typeId=${encodeURIComponent(typeId)}`,
    data: xml,
    headers: { "Content-Type": "application/xml" },
  });
  return res.data;
}

export async function updateModel(input: UpdateModelInput): Promise<Model> {
  const { id, params, xml } = input;
  const res = await requestWithRefresh<Model>({
    method: "PATCH",
    url: `/api/v2/workflow/model/${encodeURIComponent(id)}`,
    params: { ...(params || {}) },
    data: xml ?? null,
    headers: { "Content-Type": "application/xml" },
  });
  return res.data;
}

export async function deleteModel({ id }: DeleteModelInput): Promise<void> {
  await requestWithRefresh<void>({
    method: "DELETE",
    url: `/api/v2/workflow/model/${encodeURIComponent(id)}`,
    headers: { "Content-Type": "application/json" },
  });
}

export async function setReadOnlyModel({
  id,
  readOnly,
}: SetReadOnlyInput): Promise<Model> {
  const res = await requestWithRefresh<Model>({
    method: "PATCH",
    url:
      `/api/v2/workflow/model/${encodeURIComponent(id)}` +
      `/readonly?read_only=${encodeURIComponent(String(readOnly))}`,
    data: null,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function loadModelPermission(
  modelId: string
): Promise<ModelPermission> {
  const res = await requestWithRefresh<ModelPermission>({
    method: "GET",
    url: `/api/v2/workflow/model/${encodeURIComponent(modelId)}/permissions`,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function updateModelPermission(
  modelId: string,
  data: ModelPermission
): Promise<ModelPermission> {
  const res = await requestWithRefresh<ModelPermission>({
    method: "PATCH",
    url: `/api/v2/workflow/model/${encodeURIComponent(modelId)}/permissions`,
    data,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function runModel(input: RunModelInput): Promise<unknown> {
  const { modelId, data } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/start_id/${encodeURIComponent(modelId)}/await`,
    data: data || {},
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function runModelWithFile(
  input: RunModelWithFileInput
): Promise<unknown> {
  const { modelId, file } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/start_id/${encodeURIComponent(modelId)}/await`,
    data: file,
    headers: {
      "Content-Type": "application/octet-stream",
    },
    transformRequest: [(data) => data],
    withCredentials: true,
  });
  return res.data;
}

export async function runModelWithMultipart(
  input: RunModelWithMultipartInput
): Promise<unknown> {
  const { modelId, formData } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/start_id/${encodeURIComponent(modelId)}/await`,
    data: formData,
    withCredentials: true,
  });
  return res.data;
}

export async function debugModel(input: DebugModelInput): Promise<unknown> {
  const { modelId, data } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/${encodeURIComponent(
      modelId
    )}/debug_start?public=true`,
    data,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function debugModelWithFile(
  input: DebugModelWithFileInput
): Promise<unknown> {
  const { modelId, file } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/${encodeURIComponent(
      modelId
    )}/debug_start?public=true`,
    data: file,
    headers: {
      "Content-Type": "application/octet-stream",
    },
    transformRequest: [(data) => data],
    withCredentials: true,
  });
  return res.data;
}

export async function debugModelWithMultipart(
  input: DebugModelWithMultipartInput
): Promise<unknown> {
  const { modelId, formData } = input;
  const res = await requestWithRefresh<unknown>({
    method: "POST",
    url: `/api/v2/workflow/model/${encodeURIComponent(
      modelId
    )}/debug_start?public=true`,
    data: formData,
    withCredentials: true,
  });
  return res.data;
}
