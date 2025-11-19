// index.ts
import type { ApiOptions } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function request(path: string, options: ApiOptions = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // Ensures cookies are sent from browser
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || "HTTP Client Error");
  }

  return data;
}

export const apiGet = (path: string, options: ApiOptions = {}) =>
  request(path, { method: "GET", ...options });

export const apiPost = (path: string, body: any, options: ApiOptions = {}) =>
  request(path, { method: "POST", body, ...options });

export const apiPut = (path: string, body: any, options: ApiOptions = {}) =>
  request(path, { method: "PUT", body, ...options });

export const apiDelete = (path: string, options: ApiOptions = {}) =>
  request(path, { method: "DELETE", ...options });
