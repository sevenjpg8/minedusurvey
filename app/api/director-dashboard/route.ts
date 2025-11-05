import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
    const { codigo_director } = await req.json()

    // 1️⃣ Obtener las escuelas vinculadas al director
    const { data: escuelasRelacionadas, error: errorEscuelas } = await supabase
      .from("encuesta_relacionada")
      .select("school_id")
      .eq("codigo_director", codigo_director)

    if (errorEscuelas) throw errorEscuelas
    const schoolIds = escuelasRelacionadas?.map(r => r.school_id) || []

    if (!schoolIds.length) {
      return NextResponse.json({ estudiantes: [], locales: [] })
    }

    // 2️⃣ Estudiantes participantes
    const { data: participaciones, error: errorPart } = await supabase
      .from("survey_participations")
      .select("education_level, grade, section, school_id")
      .in("school_id", schoolIds)

    if (errorPart) throw errorPart

    // 3️⃣ Obtener escuelas y sus UGEL
    const { data: schoolsData, error: errorSchools } = await supabase
      .from("schools")
      .select("id, ugel_id, nivel_educativo")
      .in("id", schoolIds)

    if (errorSchools) throw errorSchools

    // Mapear school_id -> ugel_id
    const schoolToUgel = Object.fromEntries(schoolsData.map(s => [s.id, s.ugel_id]))

    // Obtener DRE de los UGEL
    const ugelIds = Array.from(new Set(schoolsData.map(s => s.ugel_id)))
    const { data: dresData, error: errorDres } = await supabase
      .from("ugels")
      .select("id, dre_id")
      .in("id", ugelIds)

    if (errorDres) throw errorDres

    const ugelToDre = Object.fromEntries(dresData.map(d => [d.id, d.dre_id]))

    // 4️⃣ Contar estudiantes por UGEL y DRE
    const estudiantesPorUgel = new Map<number, number>()
    const estudiantesPorDre = new Map<number, number>()

    participaciones.forEach(p => {
      const ugelId = schoolToUgel[p.school_id]
      if (ugelId != null) {
        estudiantesPorUgel.set(ugelId, (estudiantesPorUgel.get(ugelId) || 0) + 1)

        const dreId = ugelToDre[ugelId]
        if (dreId != null) {
          estudiantesPorDre.set(dreId, (estudiantesPorDre.get(dreId) || 0) + 1)
        }
      }
    })

    const totalUgelesEstudiantes = estudiantesPorUgel.size
    const totalDresEstudiantes = estudiantesPorDre.size

    // 5️⃣ Contar colegios por UGEL y DRE
    const colegiosPorUgel = new Map<number, number>()
    const colegiosPorDre = new Map<number, number>()

    schoolsData.forEach(s => {
      if (s.ugel_id != null) {
        colegiosPorUgel.set(s.ugel_id, (colegiosPorUgel.get(s.ugel_id) || 0) + 1)
        const dreId = ugelToDre[s.ugel_id]
        if (dreId != null) {
          colegiosPorDre.set(dreId, (colegiosPorDre.get(dreId) || 0) + 1)
        }
      }
    })

    const totalColegiosPorUgel = Array.from(colegiosPorUgel.values()).reduce((a, b) => a + b, 0)
    const totalColegiosPorDre = Array.from(colegiosPorDre.values()).reduce((a, b) => a + b, 0)

    // 6️⃣ Totales generales de estudiantes
    const totalPrimaria = participaciones.filter(p => p.education_level.toLowerCase().includes("primaria")).length
    const totalSecundaria = participaciones.filter(p => p.education_level.toLowerCase().includes("secundaria")).length
    const totalNacional = participaciones.length
    const totalGrados = new Set(participaciones.map(p => p.grade)).size
    const totalSecciones = new Set(participaciones.map(p => p.section)).size
    const totalColegios = new Set(participaciones.map(p => p.school_id)).size

    const estudiantes = [
      { nombre: "Sección", valor: totalSecciones },
      { nombre: "Grado", valor: totalGrados },
      { nombre: "Nivel Primaria", valor: totalPrimaria },
      { nombre: "Nivel Secundaria", valor: totalSecundaria },
      { nombre: "Local Educativo", valor: totalColegios },
      { nombre: "UGEL (Estudiantes)", valor: totalUgelesEstudiantes },
      { nombre: "DRE (Estudiantes)", valor: totalDresEstudiantes },
      { nombre: "Nacional", valor: totalNacional },
    ]

    // 7️⃣ Clasificación de colegios por nivel educativo
    const soloPrimaria = schoolsData.filter(
      s => s.nivel_educativo.toLowerCase().includes("primaria") &&
           !s.nivel_educativo.toLowerCase().includes("secundaria")
    ).length

    const soloSecundaria = schoolsData.filter(
      s => s.nivel_educativo.toLowerCase().includes("secundaria") &&
           !s.nivel_educativo.toLowerCase().includes("primaria")
    ).length

    const conAmbos = schoolsData.filter(
      s => s.nivel_educativo.toLowerCase().includes("primaria") &&
           s.nivel_educativo.toLowerCase().includes("secundaria")
    ).length

    const locales = [
      { nombre: "Solo primaria", valor: soloPrimaria },
      { nombre: "Solo secundaria", valor: soloSecundaria },
      { nombre: "Con primaria y secundaria", valor: conAmbos },
      { nombre: "Colegios a nivel UGEL", valor: totalColegiosPorUgel },
      { nombre: "Colegios a nivel DRE", valor: totalColegiosPorDre },
    ]

    return NextResponse.json({ estudiantes, locales })
  } catch (err: any) {
    console.error("❌ Error en dashboard:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
