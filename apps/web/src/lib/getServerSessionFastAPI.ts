import { cookies } from "next/headers";

export async function getFastAPISession() {
  const cookieHeader = cookies().toString();

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/auth/get-session",
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  return data?.data?.session || null;
}
