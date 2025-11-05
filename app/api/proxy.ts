import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 🔹 Leer la cookie de sesión (donde guardaste los datos del login)
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, value] = c.split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const accessData = cookies["accessData"] ? JSON.parse(cookies["accessData"]) : null;

    // 🔹 Si no hay sesión o no es director, redirigir al login
    if (!accessData || !accessData.codigoDirector) {
      return NextResponse.redirect(new URL("/acceso", req.url));
    }

    // 🔹 Si todo está ok, continuar a la página real del dashboard
    return NextResponse.redirect(new URL("/dashboard/page", req.url)); // aquí tu dashboard real
  } catch (err) {
    console.error("Error en proxy dashboard:", err);
    return NextResponse.redirect(new URL("/acceso", req.url));
  }
}
