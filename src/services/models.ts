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
import { mockBackend } from "./mockBackend";

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
  return mockBackend.getModels(params);
}

export async function loadEditableModels(
  params?: ModelQuery
): Promise<PagedModels> {
  return mockBackend.getModels(params, "editable");
}

export async function loadExecuteModels(
  params?: ModelQuery
): Promise<PagedModels> {
  return mockBackend.getModels(params, "execute");
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
    return mockBackend.getModelXml(id);
  }

  return mockBackend.getModel(id);
}

export async function createModel(
  input: CreateModelInput
): Promise<CreateModelResponse> {
  return mockBackend.createModel(input);
}

export async function updateModel(input: UpdateModelInput): Promise<Model> {
  return mockBackend.updateModel(input);
}

export async function deleteModel({ id }: DeleteModelInput): Promise<void> {
  await mockBackend.deleteModel({ id });
}

export async function setReadOnlyModel({
  id,
  readOnly,
}: SetReadOnlyInput): Promise<Model> {
  return mockBackend.setReadOnlyModel({ id, readOnly });
}

export async function loadModelPermission(
  modelId: string
): Promise<ModelPermission> {
  return mockBackend.getModelPermission(modelId);
}

export async function updateModelPermission(
  modelId: string,
  data: ModelPermission
): Promise<ModelPermission> {
  return mockBackend.updateModelPermission(modelId, data);
}

export async function runModel(input: RunModelInput): Promise<unknown> {
  return mockBackend.runModel(input);
}

export async function runModelWithFile(
  input: RunModelWithFileInput
): Promise<unknown> {
  return mockBackend.runModel({ modelId: input.modelId, data: { file: "uploaded" } });
}

export async function runModelWithMultipart(
  input: RunModelWithMultipartInput
): Promise<unknown> {
  return mockBackend.runModel({ modelId: input.modelId, data: { form: "multipart" } });
}

export async function debugModel(input: DebugModelInput): Promise<unknown> {
  return mockBackend.debugModel(input);
}

export async function debugModelWithFile(
  input: DebugModelWithFileInput
): Promise<unknown> {
  return mockBackend.debugModel({ modelId: input.modelId, data: { file: "uploaded" } });
}

export async function debugModelWithMultipart(
  input: DebugModelWithMultipartInput
): Promise<unknown> {
  return mockBackend.debugModel({ modelId: input.modelId, data: { form: "multipart" } });
}
