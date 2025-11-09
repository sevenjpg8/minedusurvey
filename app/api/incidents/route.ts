// app/api/incidents/route.ts
import { NextResponse } from "next/server"
import { dbQuery } from "@/app/config/connection"

export async function POST(req: Request) {
  try {
    const { incidencias } = await req.json()

    if (!Array.isArray(incidencias) || incidencias.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron incidencias válidas" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Inserta todas las incidencias en la BD
    const values = incidencias.map((desc: string) => `('${desc}', '${now}', '${now}')`).join(", ")

    await dbQuery(`
      INSERT INTO minedu.incidencias (description, created_at, updated_at)
      VALUES ${values}
    `)

    return NextResponse.json({ message: "Incidencias registradas exitosamente" })
  } catch (error: any) {
    console.error("Error al registrar incidencias:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await dbQuery(`
      SELECT id, description, created_at, updated_at
      FROM minedu.incidencias
      ORDER BY created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("Error al obtener incidencias:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
