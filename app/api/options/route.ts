// app/api/options/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const questionId = searchParams.get("questionId")

    if (!questionId) {
      return NextResponse.json({ error: "Falta el parámetro questionId" }, { status: 400 })
    }

    const query = `
      SELECT id, text, next_question_id
      FROM minedu.options
      WHERE question_id = $1
      ORDER BY id ASC;
    `
    const result = await dbQuery(query, [questionId])
    return NextResponse.json(result.rows)
  } catch (err: any) {
    console.error("❌ Error al obtener opciones:", err.message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
