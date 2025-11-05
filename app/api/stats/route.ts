import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(req: Request) {
  try {
    const { codigoDirector } = await req.json()

    if (!codigoDirector) {
      return NextResponse.json({ error: "Falta codigoDirector" }, { status: 400 })
    }

    // 1️⃣ Obtener school_id del director
    const { rows: schoolRows } = await sql`
      SELECT school_id 
      FROM encuesta_relacionada
      WHERE codigo_director = ${codigoDirector}
      LIMIT 1;
    `
    if (schoolRows.length === 0) {
      return NextResponse.json({ error: "No se encontró colegio para el director" }, { status: 404 })
    }

    const schoolId = schoolRows[0].school_id

    // 2️⃣ Estudiantes participantes y resumen general
    const { rows: resumenRows } = await sql`
      SELECT
        COUNT(*) AS total_participaciones,
        COUNT(DISTINCT grade) AS total_grados,
        COUNT(DISTINCT section) AS total_secciones,
        COUNT(DISTINCT education_level) AS total_niveles,
        COUNT(DISTINCT school_id) AS total_locales
      FROM survey_participations
      WHERE school_id = ${schoolId};
    `

    // 3️⃣ Total de respuestas
    const { rows: totalRespuestasRows } = await sql`
      SELECT COUNT(*) AS total_respuestas
      FROM answers
      WHERE survey_participation_id IN (
        SELECT id FROM survey_participations WHERE school_id = ${schoolId}
      );
    `

    // 4️⃣ Avance diario de encuestas (por día completado)
    const { rows: avanceRows } = await sql`
      SELECT
        TO_CHAR(completed_at, 'Day') AS dia,
        COUNT(*) AS total
      FROM survey_participations
      WHERE completed_at IS NOT NULL
      AND school_id = ${schoolId}
      GROUP BY 1
      ORDER BY MIN(completed_at);
    `

    // 5️⃣ Porcentaje completado
    const { rows: porcentajeRows } = await sql`
      SELECT
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / COUNT(*) AS porcentaje_completado
      FROM survey_participations
      WHERE school_id = ${schoolId};
    `

    // 6️⃣ Construir respuesta
    const resumen = resumenRows[0]
    const totalRespuestas = totalRespuestasRows[0].total_respuestas
    const porcentajeCompletado = porcentajeRows[0].porcentaje_completado

    return NextResponse.json({
      ok: true,
      resumen: {
        totalParticipaciones: Number(resumen.total_participaciones) || 0,
        totalGrados: Number(resumen.total_grados) || 0,
        totalSecciones: Number(resumen.total_secciones) || 0,
        totalNiveles: Number(resumen.total_niveles) || 0,
        totalLocales: Number(resumen.total_locales) || 0,
        totalRespuestas: Number(totalRespuestas) || 0,
        porcentajeCompletado: Number(porcentajeCompletado) || 0,
      },
      avanceDiario: avanceRows.map((r) => ({
        dia: r.dia.trim(),
        total: Number(r.total),
      })),
    })
  } catch (error) {
    console.error("Error en /api/director/stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
