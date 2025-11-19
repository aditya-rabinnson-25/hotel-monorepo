// packages/httpclient/server.ts
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
const AUTH_BASE = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function serverGet(path: string, init?: RequestInit) {
  const cookieStore = await cookies();

  // ✅ FastAPI JWT token
  const apiToken = cookieStore.get("access_token")?.value;

  // ✅ Better Auth session
  // ✅ Correct Better Auth cookie key
const sessionToken =
  cookieStore.get("better-auth.session-token")?.value ||
  cookieStore.get("better-auth.sessionToken")?.value;


  // ✅ Fetch tenant/organization from Better Auth
  let tenantId: string | undefined = undefined;

  if (sessionToken) {
    try {
      const authRes = await fetch(`${AUTH_BASE}/api/auth/session`, {
        headers: { cookie: `better-auth.sessionToken=${sessionToken}` },
        cache: "no-store",
      });

      if (authRes.ok) {
        const sess = await authRes.json();
        tenantId = sess?.organization?.id;
      }
    } catch (err) {
      console.error("Failed to fetch Better Auth session:", err);
    }
  }

  // ✅ Forward request to FastAPI with Authorization headers
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tenantId ? { "x-tenant-id": tenantId } : {}),
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  // ✅ Parse once safely
  let data: any = {};
  try {
    data = await response.json();
  } catch (err) {
    console.warn("serverGet: Non-JSON response", err);
  }

  if (!response.ok) {
  if (response.status === 401) {
    console.warn("Not authenticated: missing or invalid cookie");
    return null;
  }
  const detail = data?.detail || data?.message || response.statusText;
  throw new Error(`HTTP ${response.status}: ${detail}`);
}

return data;
}
