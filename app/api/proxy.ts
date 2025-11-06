import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const pathname = new URL(req.url).pathname;

    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const [key, value] = c.trim().split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const accessData = cookies["accessData"] ? JSON.parse(cookies["accessData"]) : null;

    // ✅ Si no hay accessData → enviar a /acceso
    if (!accessData) {
      if (pathname !== "/acceso") {
        return NextResponse.redirect(new URL("/acceso", req.url));
      }
      return NextResponse.next();
    }

    // ✅ Si la encuesta está completada → SOLO permitir /gracias
    if (accessData.completed) {
      if (pathname !== "/gracias") {
        return NextResponse.redirect(new URL("/gracias", req.url));
      }
      return NextResponse.next();
    }

    // ✅ Si es director
    if (accessData.codigoDirector) {
      if (!pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/dashboard/page", req.url));
      }
      return NextResponse.next();
    }

    // ✅ Si es estudiante pero NO ha completado encuesta
    if (accessData.codigoEstudiante) {
      // Asegurar flujo correcto:
      // 1. /identificacion
      // 2. /encuesta
      // 3. /gracias

      // Si está en /acceso, redirigir a /identificacion
      if (pathname === "/acceso") {
        return NextResponse.redirect(new URL("/identificacion", req.url));
      }

      // Crear una pequeña máquina de estados
      const allowedPaths = ["/identificacion", "/encuesta"];

      // SI intenta ir a cualquier otra ruta → enviarlo a /identificacion
      if (!allowedPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/identificacion", req.url));
      }

      return NextResponse.next();
    }

    // ✅ Default → acceso
    return NextResponse.redirect(new URL("/acceso", req.url));

  } catch (err) {
    console.error("Error en proxy:", err);
    return NextResponse.redirect(new URL("/acceso", req.url));
  }
}
