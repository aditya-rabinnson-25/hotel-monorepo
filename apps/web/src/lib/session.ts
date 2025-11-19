// apps/web/src/lib/session.ts
import { cookies, headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * ✅ Works in all Next.js App Router versions
 * ✅ Converts ReadonlyHeaders → real Headers
 * ✅ Supports both cookie-based and header-based session retrieval
 */

/**
 * Universal session fetch using headers (works for API routes and SSR)
 */
export async function getServerSession() {
  // Next.js returns an async ReadonlyHeaders object
  const raw = await nextHeaders();

  // Convert to real Headers
  const realHeaders = new Headers();
  raw.forEach((value, key) => realHeaders.append(key, value));

  try {
    const session = await auth.api.getSession({
      headers: realHeaders,
    });
    return session;
  } catch (error) {
    console.error("getServerSession() failed:", error);
    return null;
  }
}

/**
 * Faster cookie-based session fetch for server components
 */
export async function serverGetSession() {
  const c = await cookies();
  const token = c.get("access_token")?.value;
  if (!token) return null;

   try {
    const s = await auth.api.getSession({
      headers: new Headers({ cookie: `better-auth.session-token=${token}` }),
    });

    if (!(s as any)?.user) return null;

    const user = (s as any).user; // 👈 type-safe workaround

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? "viewer",
        hotelId: user.hotelId ?? null,
      },
    };
  } catch (error) {
    console.error("serverGetSession() failed:", error);
    return null;
  }
}