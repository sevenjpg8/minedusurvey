import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { cod_mod, codigo_estudiante } = await req.json();

    // 🔹 Validar campos requeridos
    if (!cod_mod?.trim() || !codigo_estudiante?.trim()) {
      return NextResponse.json(
        { error: "Por favor, completa ambos campos" },
        { status: 400 }
      );
    }

    // 🔹 Buscar el registro en la tabla `encuesta_relacionada`
    const { data: registro, error: registroError } = await supabase
      .from("encuesta_relacionada")
      .select("cod_mod, school_id, education_level, codigo_estudiante, token")
      .eq("cod_mod", cod_mod)
      .eq("codigo_estudiante", codigo_estudiante)
      .single();

    if (registroError || !registro) {
      console.error("Error al validar acceso:", registroError);
      return NextResponse.json(
        { error: "credenciales_invalidas" },
        { status: 400 }
      );
    }

    // 🔹 Buscar los datos del colegio (tabla `schools`)
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id, name, departamento, nivel_educativo, ugel_id")
      .eq("id", registro.school_id)
      .single();

    if (schoolError || !schoolData) {
      console.error("Error al obtener colegio:", schoolError);
      return NextResponse.json(
        { error: "No se encontró la información del colegio" },
        { status: 404 }
      );
    }

    // 🔹 Obtener el nombre de la UGEL (tabla `ugels`)
    const { data: ugelData, error: ugelError } = await supabase
      .from("ugels")
      .select("name")
      .eq("id", schoolData.ugel_id)
      .single();

    if (ugelError) {
      console.error("Error al obtener UGEL:", ugelError);
    }

    // 🔹 Construir respuesta final
    return NextResponse.json({
      success: true,
      data: {
        codigoModular: registro.cod_mod,
        codigoEstudiante: registro.codigo_estudiante,
        dre: schoolData.departamento,
        ugel: ugelData?.name ?? "SIN UGEL",
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
