"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useBrowserAuth } from "@/hooks/useBrowserAuth";

export default function DashboardPage() {
  useBrowserAuth(); // browser-side redirect protection
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
          router.replace("/auth");
          return;
        }

        // 1. Get FastAPI session
        const sessionRes = await fetch(
          process.env.NEXT_PUBLIC_API_URL + "/api/auth/get-session",
          { credentials: "include" }
        );

        const sessionJson = await sessionRes.json();

        if (!sessionJson?.data?.session) {
          router.replace("/auth");
          return;
        }

        setSession(sessionJson.data.session.user);

        // 2. Backend API calls
        const [userRes, hotelsRes, usersRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/hotels"),
          fetch("/api/users"),
        ]);

        setUser(await userRes.json());
        setHotels(await hotelsRes.json());
        setUsers(await usersRes.json());
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="text-sm text-gray-600 mt-1">
            Authenticated as <b>{session.email}</b>
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Welcome, {user?.name}
          </p>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* USER INFO */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Information
          </h2>

          <div className="space-y-2 text-gray-700">
            <p><b>Name:</b> {user?.name}</p>
            <p><b>Email:</b> {user?.email}</p>
            <p><b>Role:</b> {user?.role}</p>
            <p><b>User ID:</b> {user?.id}</p>
          </div>
        </div>

        {/* STATS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hotel Management System
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-blue-900 mb-1">Total Hotels</h3>
              <p className="text-3xl font-bold text-blue-600">{hotels.length}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-green-900 mb-1">Total Users</h3>
              <p className="text-3xl font-bold text-green-600">{users.length}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-purple-900 mb-1">Active Bookings</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
