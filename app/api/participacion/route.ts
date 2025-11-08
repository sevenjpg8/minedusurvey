import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection" // 👈 conexión directa a PostgreSQL
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const { schoolId, level, grade, section, gender } = await req.json()

    if (!schoolId || !level || !grade || !section || !gender) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // 1️⃣ Buscar el school_id real desde minedu.encuesta_acceso
    const relacionQuery = `
      SELECT school_id
      FROM minedu.encuesta_acceso
      WHERE cod_mod = $1
      LIMIT 1;
    `
    const relacionResult = await dbQuery(relacionQuery, [schoolId])
    const relacion = relacionResult.rows[0]

    if (!relacion) {
      return NextResponse.json(
        { error: "No se encontró el colegio en encuesta_acceso" },
        { status: 400 }
      )
    }

    const realSchoolId = relacion.school_id

    // 2️⃣ Determinar la encuesta según el nivel
    let surveyId: number
    const nivel = level.trim().toLowerCase()

    if (nivel.includes("primaria")) {
      surveyId = 1
    } else if (nivel.includes("secundaria")) {
      surveyId = 2
    } else {
      return NextResponse.json(
        { error: "Nivel educativo no reconocido" },
        { status: 400 }
      )
    }

    // 3️⃣ Crear el registro de participación
    const newId = uuidv4()
    const now = new Date().toISOString()

    const insertQuery = `
      INSERT INTO survey_participations (
        id,
        survey_id,
        school_id,
        education_level,
        grade,
        section,
        gender,
        started_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `
    await dbQuery(insertQuery, [
      newId,
      surveyId,
      realSchoolId,
      level,
      grade,
      section,
      gender,
      now,
      now,
      now,
    ])

    return NextResponse.json({ id: newId })
  } catch (err) {
    console.error("❌ Error en /api/participacion:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
