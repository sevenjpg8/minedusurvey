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

    // Crear nueva participación
    const { error } = await supabase.from("survey_participations").insert([
      {
        id: uuidv4(),
        survey_id: 1, // ✅ Ajusta este valor según tu encuesta actual
        school_id: schoolId,
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error en /api/participacion:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
