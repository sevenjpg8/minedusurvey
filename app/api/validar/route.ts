import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Función para extraer el código de acceso del token
function extraerCodigoAcceso(token: string): string {
  const match = token.match(/[AE]/);
  if (!match) return "";
  const index = match.index!;
  let parte = token.slice(index);
  if (parte.endsWith("0")) parte = parte.slice(0, -1);
  return parte;
}

export async function POST(req: Request) {
  try {
    const { codigoModular, codigoAcceso } = await req.json();

    // Validar campos
    if (!codigoModular?.trim() || !codigoAcceso?.trim()) {
      return NextResponse.json(
        { error: "Por favor, completa ambos campos" },
        { status: 400 }
      );
    }

    const codigoNum = Number(codigoModular);
    if (isNaN(codigoNum)) {
      return NextResponse.json(
        { error: "El código modular debe ser numérico" },
        { status: 400 }
      );
    }

    // Buscar el registro en la tabla `codigo_modular`
    const { data: modularData, error: modularError } = await supabase
      .from("codigo_modular")
      .select("codigo, token, school_id")
      .eq("codigo", codigoNum)
      .single();

    if (modularError || !modularData) {
      console.error("Supabase error:", modularError);
      return NextResponse.json(
        { error: "Código modular no válido" },
        { status: 400 }
      );
    }

    // Verificar el código de acceso
    const accesoCalculado = extraerCodigoAcceso(modularData.token);
    if (accesoCalculado !== codigoAcceso) {
      return NextResponse.json(
        { error: "Código de acceso incorrecto" },
        { status: 400 }
      );
    }

    // Buscar los datos del colegio relacionado (tabla schools)
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .select("id, name, departamento, nivel_educativo, ugel_id")
      .eq("id", modularData.school_id)
      .single();

    if (schoolError || !schoolData) {
      console.error("Error al obtener school:", schoolError);
      return NextResponse.json(
        { error: "No se encontró la información del colegio" },
        { status: 404 }
      );
    }

    // Obtener el nombre de la UGEL (si está en otra tabla)
    const { data: ugelData } = await supabase
      .from("ugeles")
      .select("name")
      .eq("id", schoolData.ugel_id)
      .single();

    // Construir la respuesta completa
    return NextResponse.json({
      success: true,
      schools: {
        codigo: modularData.codigo,
        dre: schoolData.departamento,
        ugel: ugelData?.name ?? "SIN UGEL",
        institution: schoolData.name,
        level: schoolData.nivel_educativo,
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
