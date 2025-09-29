function getQueryParams(): Record<string, string> {
  const map: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const sp = new URLSearchParams(window.location.search);
    sp.forEach((v, k) => (map[k] = v));
  }
  return map;
}

const isProd = import.meta.env.PROD;
const qp = getQueryParams();

const getApiService = (): string => {
  if (qp.baseUrl) {
    let b = qp.baseUrl;
    if ((b.startsWith('"') && b.endsWith('"')) || (b.startsWith("'") && b.endsWith("'"))) {
      b = b.slice(1, -1);
    }
    return b;
  }

  const runtimeBase = window.VBD_WORKFLOW_CONFIG?.API_BASE_URL?.trim() || "";

  if (isProd) {
    if (!runtimeBase) {
      throw new Error("API_BASE_URL is missing. Please set it in public/config.js at deploy time.");

    }
    return runtimeBase;
  }

  if (runtimeBase) return runtimeBase;

  const devEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (devEnv) return devEnv;

  const host = import.meta.env.VITE_API_HOST || "";
  const port = import.meta.env.VITE_API_PORT || "";
  if (host && port) return `${host}:${port}`;

  return "http://localhost:2106";
};

export const API_SERVICE = getApiService();

export const getCurrentApiService = (): string => getApiService();
export const isUsingQueryParamBaseUrl = (): boolean => !!qp.baseUrl;
export const getQueryParamBaseUrl = (): string | null => qp.baseUrl || null;