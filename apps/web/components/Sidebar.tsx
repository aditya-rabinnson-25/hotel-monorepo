"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Hotels", href: "/dashboard/hotels" },
  { label: "Users", href: "/dashboard/users" },
  { label: "About Us", href: "/about-us" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" }
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm border-r">
      <div className="p-4 text-xl text-black font-bold border-b">Hotel Admin</div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const active = path === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
