"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    try {
      await fetch("http://localhost:8001/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      // Redirect to login page after logout
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
