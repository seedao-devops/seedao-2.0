const BASE = "";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, body: Record<string, unknown>) {
    super((body.message as string) ?? (body.error as string) ?? "请求失败");
    this.status = status;
    this.code = body.error as string | undefined;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body);
  }

  const data = await res.json();
  return { data, headers: res.headers };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
