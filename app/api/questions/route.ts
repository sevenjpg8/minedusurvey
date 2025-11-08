// app/api/questions/route.ts
import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const survey = searchParams.get("survey"); // primaria | secundaria | etc.

    if (!survey) {
      return NextResponse.json(
        { error: "No se indicó el tipo de encuesta" },
        { status: 400 }
      );
    }

    const surveyMap: Record<string, number> = { primaria: 1, secundaria: 2 }
    const surveyId = surveyMap[survey.toLowerCase()]
    if (!surveyId) {
      return NextResponse.json({ error: "Tipo de encuesta inválido" }, { status: 400 })
    }

    // ✅ Consulta SQL usando tu schema minedu
    const query = `
      SELECT 
        id,
        text,
        prefix,
        type,
        survey_id,
        dimension_id,
        "order"
      FROM minedu.questions
      WHERE survey_id = $1
      ORDER BY id ASC;
    `;

    const result = await dbQuery(query, [surveyId]);

    if (!result.rows.length) {
      return NextResponse.json({ error: "No hay preguntas disponibles" }, { status: 404 })
    }

    if (!result.rows.length) {
      return NextResponse.json(
        { error: "No hay preguntas disponibles" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      questions: result.rows,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
