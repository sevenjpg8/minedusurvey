// app/api/answers/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const answers = await req.json()

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "No hay respuestas para guardar" }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Crear múltiples inserts (batch)
    const values = answers
    .map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`)
    .join(",")

    const params = answers.flatMap((a) => [
        a.survey_participation_id,
        a.question_id,
        Number(a.option_id),
        a.value ?? null,
        new Date().toISOString(),
        a.survey_id,
    ])

    const query = `
        INSERT INTO minedu.answers (
            survey_participation_id,
            question_id,
            option_id,
            value,
            created_at,
            survey_id
        )
        VALUES ${values};
    `

    await dbQuery(query, params)

    return NextResponse.json({ message: "✅ Respuestas guardadas correctamente" })
  } catch (err: any) {
    console.error("❌ Error al guardar respuestas:", err.message)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
