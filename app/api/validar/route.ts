import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Función para extraer el código de acceso del token
function extraerCodigoAcceso(token: string): string {
  // Buscar la letra A o E
  const match = token.match(/[AE]/);
  if (!match) return "";

  const index = match.index!;
  let parte = token.slice(index);

  // Quitar un 0 del final si existe
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

    // Convertir a número
    const codigoNum = Number(codigoModular);
    if (isNaN(codigoNum)) {
      return NextResponse.json(
        { error: "El código modular debe ser numérico" },
        { status: 400 }
      );
    }

    // Buscar registro
    const { data, error } = await supabase
      .from("codigo_modular")
      .select("*")
      .eq("codigo", codigoNum)
      .single();

    if (error || !data) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Código modular no válido" },
        { status: 400 }
      );
    }

    // Calcular acceso
    const accesoCalculado = extraerCodigoAcceso(data.token);

    if (accesoCalculado !== codigoAcceso) {
      return NextResponse.json(
        { error: "Código de acceso incorrecto" },
        { status: 400 }
      );
    }

    // Éxito
    return NextResponse.json({
      success: true,
      schools: {
        codigo: data.codigo,
        school_id: data.school_id,
        education_level: data.education_level,
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
