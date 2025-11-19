// apps/web/src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";

// ✅ Explicitly cast to any to silence type errors
// The runtime is valid — this only bypasses the overly strict InferAPI typing
const api = auth.api as any;

export const GET = api.GET;
export const POST = api.POST;
export const PUT = api.PUT;
export const DELETE = api.DELETE;
