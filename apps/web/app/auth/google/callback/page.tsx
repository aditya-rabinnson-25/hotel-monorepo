"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This page is intentionally minimal.
 * Backend performs the full OAuth flow and should redirect the browser
 * back to /auth (this page path may be hit in the flow).
 * Here we simply push the user back to /auth so the session-check in /auth/page.tsx runs.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Keep this a client-side redirect to the main /auth page where
    // the session-check (with polling) runs and will pick up the server cookie.
    router.replace("/auth");
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div>
        <p className="text-lg">Processing Google Sign-in…</p>
      </div>
    </div>
  );
}
