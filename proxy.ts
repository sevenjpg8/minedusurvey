// app/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Rutas públicas
const publicPaths = ["/", "/acceso", "/api/validar", "/favicon.ico", "/_next"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir assets y rutas públicas
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  // No hay token → redirigir a acceso
  if (!token) {
    return NextResponse.redirect(new URL("/acceso", req.url));
  }

  try {
    // Verificar la firma del JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { rol?: string };

    const rol = payload?.rol ?? "";

    // Validar acceso por rol a rutas específicas
    if (pathname.startsWith("/dashboard") && rol !== "director") {
      return NextResponse.redirect(new URL("/acceso", req.url));
    }

    if (pathname.startsWith("/identificacion") && rol !== "estudiante") {
      // si un director intenta ir a identificacion lo mandamos al dashboard
      if (rol === "director") return NextResponse.redirect(new URL("/dashboard", req.url));
      return NextResponse.redirect(new URL("/acceso", req.url));
    }

    // Token válido y autorizaciones ok
    return NextResponse.next();
  } catch (err) {
    console.error("Token inválido o expirado en proxy:", err);
    const res = NextResponse.redirect(new URL("/acceso", req.url));
    // eliminar cookie corrupta si existe
    res.cookies.delete("auth_token");
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/identificacion/:path*", "/api/:path*"],
};
