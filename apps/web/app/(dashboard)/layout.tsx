// apps/web/src/app/(dashboard)/layout.tsx
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ✅ Existing Sidebar (your component) */}
      <Sidebar />

      {/* ✅ New Admin Navigation (from your snippet) */}
      <aside className="w-60 bg-white border-r p-4 hidden lg:block">
        <div className="text-lg font-bold mb-6">Admin</div>
        <nav className="space-y-2">
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/dashboard">Dashboard</a>
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/hotels">Hotels</a>
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/users">Users</a>
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/about-us">About Us</a>
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/terms">Terms</a>
          <a className="block hover:bg-gray-100 rounded px-3 py-2" href="/privacy">Privacy</a>
        </nav>
      </aside>

      {/* ✅ Main area */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        {/* Content Area */}
        <main className="p-6">{children}</main>
      </div>

    </div>
  );
}
