"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/auth",
  fetch: async (url: string, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",  // ⭐ REQUIRED ⭐
    });
  }
});

export const useAuth = () => {
  return {
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    session: authClient.useSession(),
  };
};

export const auth = authClient;
