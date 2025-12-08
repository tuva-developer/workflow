import { requestWithRefresh } from "@/api/client";
import {
  asObject,
  asArray,
  asNumber,
  asBoolean,
  asString,
} from "@/utils/typeGuards";
import { PagedRemoteFunctions, RemoteFunction } from "@/services/types";

export function normalizePagedFunctions(data: unknown): PagedRemoteFunctions {
  const obj = asObject(data) ?? {};

  const itemsArr = asArray(obj["modules-js"]) ?? [];

  const items: RemoteFunction[] = itemsArr.map((raw): RemoteFunction => {
    const m = asObject(raw) ?? {};

    return {
      _id: asString(m["_id"], ""),
      name: asString(m["name"], ""),
      description: asString(m["description"], ""),
      script: asString(m["script"], ""),
      created_at: asString(m["created_at"], ""),
      updated_at: asString(m["updated_at"], ""),
    };
  });

  const len = items.length;

  return {
    items,
    total: asNumber(obj["total"], len),
    page: asNumber(obj["page"], 1),
    limit: asNumber(obj["limit"], len),
    totalPages: asNumber(obj["totalPages"], 1),
    hasNext: asBoolean(obj["hasNext"], false),
    hasPrev: asBoolean(obj["hasPrev"], false),
  };
}

export async function loadFunctions(): Promise<PagedRemoteFunctions> {
  const res = await requestWithRefresh<unknown>({
    method: "GET",
    url: "/api/v2/workflow/modules/js",
    headers: { "Content-Type": "application/json" },
  });

  return normalizePagedFunctions(res.data);
}

export interface AddFunctionInput {
  name: string;
  description: string;
  script: string;
  public?: boolean;
}

export async function addFunction(
  input: AddFunctionInput
): Promise<RemoteFunction> {
  const res = await requestWithRefresh<RemoteFunction>({
    method: "POST",
    url:
      `/api/v2/workflow/modules/js` +
      `?name=${encodeURIComponent(input.name)}` +
      `&description=${encodeURIComponent(input.description)}` +
      `&public=${String(input.public ?? false)}`,
    data: input.script,
    headers: {
      "Content-Type": "application/javascript",
    },
  });

  return res.data;
}

export async function deleteFunction(id: string): Promise<void> {
  await requestWithRefresh<void>({
    method: "DELETE",
    url: `/api/v2/workflow/modules/js/${encodeURIComponent(id)}`,
    headers: { "Content-Type": "application/json" },
  });
}