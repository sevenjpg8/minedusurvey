import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // GET COOKIES
  const cookieRaw = req.cookies.get("accessData")?.value;
  let accessData = null;

  try {
    accessData = cookieRaw ? JSON.parse(cookieRaw) : null;
  } catch {
    accessData = null;
  }

  // COOKIE lastRoute (última ruta válida)
  const lastRoute = req.cookies.get("lastRoute")?.value || pathname;

  // Detectar si el usuario cambió la URL manualmente
  if (pathname !== lastRoute) {
    const redirect = NextResponse.redirect(new URL(lastRoute, req.url));
    redirect.cookies.set("lastRoute", lastRoute, { path: "/" });
    return redirect;
  }

  // Función base de respuesta
  const next = () => {
    const res = NextResponse.next();
    res.cookies.set("lastRoute", pathname, { path: "/" });
    return res;
  };

  // RUTAS PUBLICAS
  const publicPaths = ["/acceso", "/api/validar"];
  if (publicPaths.includes(pathname)) {
    if (!accessData) return next();

    if (accessData.completed) {
      const redirect = NextResponse.redirect(new URL("/gracias", req.url));
      redirect.cookies.set("lastRoute", "/gracias");
      return redirect;
    }

    if (accessData.esDirector) {
      const redirect = NextResponse.redirect(new URL("/dashboard", req.url));
      redirect.cookies.set("lastRoute", "/dashboard");
      return redirect;
    }

    if (accessData.codigoEstudiante) {
      const redirect = NextResponse.redirect(new URL("/identificacion", req.url));
      redirect.cookies.set("lastRoute", "/identificacion");
      return redirect;
    }
  }

  // SI NO ESTA LOGEADO → SOLO /acceso
  if (!accessData) {
    const redirect = NextResponse.redirect(new URL("/acceso", req.url));
    redirect.cookies.set("lastRoute", "/acceso");
    return redirect;
  }

  // ENCUESTA COMPLETADA → SOLO /gracias
  if (accessData.completed) {
    if (pathname !== "/gracias") {
      const redirect = NextResponse.redirect(new URL("/gracias", req.url));
      redirect.cookies.set("lastRoute", "/gracias");
      return redirect;
    }
    return next();
  }

  // DIRECTOR → solo puede acceder a /dashboard
  if (accessData.esDirector) {
    if (!pathname.startsWith("/dashboard")) {
      const redirect = NextResponse.redirect(new URL("/dashboard", req.url));
      redirect.cookies.set("lastRoute", "/dashboard");
      return redirect;
    }
    return next();
  }

  // ESTUDIANTE → solo puede acceder a /identificacion o /encuesta
  if (accessData.codigoEstudiante) {
    const studentFlow = ["/identificacion", "/encuesta"];
    if (!studentFlow.some((p) => pathname.startsWith(p))) {
      const redirect = NextResponse.redirect(new URL("/identificacion", req.url));
      redirect.cookies.set("lastRoute", "/identificacion");
      return redirect;
    }
    return next();
  }

  // POR DEFECTO
  return next();
}
