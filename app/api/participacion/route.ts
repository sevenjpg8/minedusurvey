import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
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

    // 1️⃣ Buscar el school_id real desde encuesta_acceso
    const { data: relacion, error: relacionError } = await supabase
      .from("encuesta_acceso")
      .select("school_id")
      .eq("cod_mod", schoolId) // 👈 schoolId aquí es el código modular (0452011)
      .single()

    if (relacionError || !relacion) {
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

    const { error } = await supabase
      .from("survey_participations")
      .insert([
        {
          id: newId,
          survey_id: surveyId,
          school_id: realSchoolId, // ✅ ahora usa el ID real
          education_level: level,
          grade,
          section,
          gender,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

    if (error) {
      console.error("Error insertando en survey_participations:", error)
      return NextResponse.json(
        { error: "No se pudo guardar la participación" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: newId })
  } catch (err) {
    console.error("Error en /api/participacion:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
