import LogoutButton from "./LogoutButton";
import { serverGet } from "@repo/httpclient/server";

export default async function Topbar() {
  try {
    const user = await serverGet("/users/me");

    return (
      <header className="bg-white shadow flex justify-between items-center px-6 py-4 border-b">
        <div className="text-gray-700 font-medium">
          Welcome, <span className="font-bold">{user?.name ?? "Guest"}</span>
        </div>
        <LogoutButton />
      </header>
    );
  } catch (error) {
    console.error("Topbar failed:", error);

    return (
      <header className="bg-white shadow flex justify-between items-center px-6 py-4 border-b">
        <div className="text-gray-700 font-medium">Welcome, Guest</div>
        <LogoutButton />
      </header>
    );
  }
}

