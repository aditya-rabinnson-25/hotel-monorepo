import { cookies } from "next/headers";

export async function getServerSession() {
  const cookieHeader = cookies().toString();

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/get-session",
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
      credentials: "include",   // ⭐ IMPORTANT ⭐
    }
  );

  const data = await res.json();
  return data?.data?.session || null;
}
