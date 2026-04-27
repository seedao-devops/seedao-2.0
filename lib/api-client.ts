/**
 * Tiny `fetch` wrapper used by every client-side network call.
 *
 * Why not Axios: every API route in this app returns small JSON. A native
 * `fetch` wrapper covers what we actually need (timeout, typed errors,
 * 401 redirect) without adding ~30KB.
 *
 * Conventions:
 *   - All non-2xx responses become `ApiError`. Callers map `error.code` to
 *     localized toasts.
 *   - On 401 we dispatch `seedao:unauthorized` so the listener mounted in
 *     the root layout can route to the right login page (admin vs user).
 *   - Default 15s timeout. Override per-call via `timeoutMs`.
 */

export const UNAUTHORIZED_EVENT = "seedao:unauthorized";

export class ApiError extends Error {
  status: number;
  code?: string;
  issues?: unknown;

  constructor(opts: {
    status: number;
    code?: string;
    issues?: unknown;
    message?: string;
  }) {
    super(opts.message ?? opts.code ?? `Request failed (${opts.status})`);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.issues = opts.issues;
  }
}

export type RequestOpts = {
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: HeadersInit;
};

const DEFAULT_TIMEOUT_MS = 15000;

async function request<T>(
  method: string,
  url: string,
  body: unknown,
  opts: RequestOpts = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else
      opts.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
  }

  const hasBody = body !== undefined;
  const headers = new Headers(opts.headers);
  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError({
        status: 0,
        code: "TIMEOUT",
        message: "请求超时，请稍后重试",
      });
    }
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: err instanceof Error ? err.message : "网络异常",
    });
  }
  clearTimeout(timeout);

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!res.ok) {
    const data: { error?: string; issues?: unknown } | null = await res
      .json()
      .catch(() => null);
    throw new ApiError({
      status: res.status,
      code: data?.error,
      issues: data?.issues,
    });
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const apiGet = <T = unknown>(url: string, opts?: RequestOpts) =>
  request<T>("GET", url, undefined, opts);

export const apiPost = <T = unknown>(
  url: string,
  body?: unknown,
  opts?: RequestOpts,
) => request<T>("POST", url, body, opts);

export const apiPut = <T = unknown>(
  url: string,
  body?: unknown,
  opts?: RequestOpts,
) => request<T>("PUT", url, body, opts);

export const apiDelete = <T = unknown>(url: string, opts?: RequestOpts) =>
  request<T>("DELETE", url, undefined, opts);

/**
 * SWR fetcher. Accepts either a string URL or a tuple `[url, params]` where
 * `params` is an object that gets serialized to a querystring. Allows hooks
 * like `useSWR(['/api/bases', { tag: 'COLIVING' }], fetcher)`.
 */
export function swrFetcher<T = unknown>(
  key: string | readonly [string, Record<string, unknown> | undefined],
): Promise<T> {
  if (typeof key === "string") return apiGet<T>(key);
  const [url, params] = key;
  if (!params) return apiGet<T>(url);
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.set(k, String(v));
  }
  const qs = search.toString();
  return apiGet<T>(qs ? `${url}?${qs}` : url);
}
