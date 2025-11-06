import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { cod_mod, codigo_estudiante } = await req.json();

    if (!cod_mod?.trim() || !codigo_estudiante?.trim()) {
      return NextResponse.json(
        { error: "Por favor, completa ambos campos" },
        { status: 400 }
      );
    }

    // 🔹 Verificar si el código coincide con codigo_estudiante o codigo_director
    const { data: registro, error: registroError } = await supabase
      .from("encuesta_acceso")
      .select(
        "cod_mod, school_id, education_level, codigo_estudiante, codigo_director, token"
      )
      .eq("cod_mod", cod_mod)
      .or(`codigo_estudiante.eq.${codigo_estudiante},codigo_director.eq.${codigo_estudiante}`)
      .single();

    if (registroError || !registro) {
      return NextResponse.json(
        { error: "credenciales_invalidas" },
        { status: 400 }
      );
    }

    // 🔹 Buscar datos del colegio (con relaciones)
    const { data: schoolData, error: schoolError } = await supabase
      .from("school_new")
      .select(`
        id,
        name,
        nivel_educativo,
        ugel_new (
          id,
          name,
          dres (
            id,
            name
          )
        )
      `)
      .eq("id", registro.school_id)
      .single();

    if (schoolError || !schoolData) {
      return NextResponse.json(
        { error: "No se encontró la información del colegio" },
        { status: 404 }
      );
    }

    // 🔹 Acceder correctamente a los datos (arrays)
    const ugel = Array.isArray(schoolData.ugel_new) ? schoolData.ugel_new[0] : schoolData.ugel_new;
    const dre = ugel?.dres ? (Array.isArray(ugel.dres) ? ugel.dres[0] : ugel.dres) : null;

    const ugelName = ugel?.name ?? "SIN UGEL";
    const dreName = dre?.name ?? "SIN DRE";

    // 🔹 Detectar si el código corresponde al director
    const esDirector = registro.codigo_director === codigo_estudiante;

    return NextResponse.json({
      success: true,
      esDirector,
      data: {
        codigoModular: registro.cod_mod,
        codigoEstudiante: registro.codigo_estudiante,
        codigoDirector: registro.codigo_director,
        dre: dreName,
        ugel: ugelName,
        institution: schoolData.name,
        level: schoolData.nivel_educativo,
        token: registro.token,
      },
    });
  } catch (err) {
    console.error("Error en /api/validar:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}