// app/api/survey/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function GET(req: Request) {
  console.log("✅ GET /api/survey llamado")
  try {
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get("id")
    const level = searchParams.get("level") 

    let finalSurveyId = surveyId

    if (!finalSurveyId && level) {
      // Traer la primera encuesta activa de ese nivel
      const surveyRes = await dbQuery(
        `SELECT id FROM minedu.surveys WHERE level=$1 AND is_active=true ORDER BY id ASC LIMIT 1`,
        [level.toLowerCase()]
      )

      if (!surveyRes.rows.length) {
        return NextResponse.json({ error: "No hay encuestas activas para este nivel" }, { status: 404 })
      }

      finalSurveyId = surveyRes.rows[0].id
    }

    if (!finalSurveyId) {
      return NextResponse.json({ error: "Falta el parámetro id o level" }, { status: 400 })
    }

    // 🔹 Traer las preguntas y sus opciones
    const query = `
      SELECT 
        q.id AS question_id,
        q.text AS question_text,
        q.type AS question_type,
        o.id AS option_id,
        o.text AS option_text
      FROM minedu.questions q
      LEFT JOIN minedu.options o ON o.question_id = q.id
      WHERE q.survey_id = $1
      ORDER BY q.order ASC, o.id ASC;
    `;

    const result = await dbQuery(query, [finalSurveyId])
    const rows = result.rows

    // 🔹 Agrupar preguntas y sus opciones
    const questions = Object.values(
      rows.reduce((acc: any, row: any) => {
        if (!acc[row.question_id]) {
          acc[row.question_id] = {
            id: row.question_id,
            text: row.question_text,
            type: row.question_type,
            options: [],
          }
        }
        if (row.option_id) {
          acc[row.question_id].options.push({
            id: row.option_id,
            text: row.option_text,
          })
        }
        return acc
      }, {})
    )

    return NextResponse.json(questions)
  } catch (err: any) {
    console.error("❌ Error en /api/survey:", err.message)
    return NextResponse.json({ error: "Error al obtener preguntas" }, { status: 500 })
  }
}
