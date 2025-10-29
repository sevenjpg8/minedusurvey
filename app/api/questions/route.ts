import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    // Obtenemos el parámetro "survey" de la URL
    const { searchParams } = new URL(req.url);
    const survey = searchParams.get("survey");

    if (!survey) {
      return NextResponse.json({ error: "No se indicó el tipo de encuesta" }, { status: 400 });
    }

    // Consultamos la tabla questions según el tipo de encuesta
    const { data, error } = await supabase
      .from("questions")
      .select("id, text, options")
      .eq("level", survey) // Asegúrate de que tu tabla tenga columna "level": "primaria" o "secundaria"
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No hay preguntas disponibles" }, { status: 404 });
    }

    return NextResponse.json({ questions: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
