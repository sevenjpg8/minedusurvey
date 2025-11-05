import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [key, value] = c.split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const accessData = cookies["accessData"] ? JSON.parse(cookies["accessData"]) : null;

    if (!accessData) {
      // No hay acceso → login
      return NextResponse.redirect(new URL("/acceso", req.url));
    }

    if (accessData.codigoDirector) {
      // Director → dashboard
      return NextResponse.redirect(new URL("/dashboard/page", req.url));
    }

    if (accessData.codigoEstudiante) {
      // Estudiante → identificacion
      return NextResponse.redirect(new URL("/identificacion", req.url));
    }

    // Cualquier otra cosa → login
    return NextResponse.redirect(new URL("/acceso", req.url));
  } catch (err) {
    console.error("Error en proxy:", err);
    return NextResponse.redirect(new URL("/acceso", req.url));
  }
}
