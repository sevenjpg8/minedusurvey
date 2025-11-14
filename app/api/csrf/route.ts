// app/api/csrf/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Generar token aleatorio
  const token = crypto.randomBytes(32).toString("hex");

  // Guardarlo en cookie HttpOnly
  const res = NextResponse.json({ csrfToken: token });
  res.cookies.set("csrfToken", token, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hora
  });

  return res;
}
