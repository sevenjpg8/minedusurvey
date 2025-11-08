import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const { survey_participation_id, answers } = await req.json()

    if (!survey_participation_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // 🔹 Ejecutar la función almacenada en PostgreSQL
    const query = `
      SELECT minedu.submit_survey($1::UUID, $2::JSONB);
    `
    await dbQuery(query, [survey_participation_id, JSON.stringify(answers)])

    return NextResponse.json({ message: "Encuesta enviada correctamente ✅" })
  } catch (err: any) {
    console.error("❌ Error al enviar encuesta:", err.message)
    return NextResponse.json({ error: "Error al enviar encuesta" }, { status: 500 })
  }
}
