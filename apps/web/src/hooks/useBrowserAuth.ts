"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useBrowserAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      router.replace("/auth");
      return;
    }
  }, []);
}
