import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, text, options") // asumiendo que options es un array JSON
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ questions: data });
  } catch (err) {
    console.error("Error fetching questions:", err);
    return NextResponse.json({ error: "Error fetching questions" }, { status: 500 });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { survey } = req.query

  const PRIMARY_QUESTIONS = [
    { id: 1, text: "¿Te sientes seguro en tu colegio?", options: ["Totalmente en desacuerdo", "En desacuerdo", "De acuerdo", "Totalmente de acuerdo"] },
    { id: 2, text: "¿Tus profesores te apoyan?", options: ["Nunca", "A veces", "Casi siempre", "Siempre"] },
  ]

  const SECONDARY_QUESTIONS = [
    { id: 1, text: "¿Participas en actividades extracurriculares?", options: ["Nunca", "A veces", "Casi siempre", "Siempre"] },
    { id: 2, text: "¿Tus compañeros respetan tus opiniones?", options: ["Nunca", "A veces", "Casi siempre", "Siempre"] },
  ]

  if (survey === "primaria") return res.status(200).json({ questions: PRIMARY_QUESTIONS })
  if (survey === "secundaria") return res.status(200).json({ questions: SECONDARY_QUESTIONS })

  return res.status(404).json({ error: "Encuesta no encontrada" })
}

