import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET() {
  try {
    const result = await dbQuery(`SELECT * FROM minedu.usuarios`);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error en GET /api/usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
