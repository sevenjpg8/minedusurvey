import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const accessRaw = cookieStore.get("accessData")?.value;

    if (accessRaw) {
      const access = JSON.parse(accessRaw);
      access.completed = true;

      cookieStore.set("accessData", JSON.stringify(access), {
        path: "/",
        httpOnly: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error marcando completado" }, { status: 500 });
  }
}
