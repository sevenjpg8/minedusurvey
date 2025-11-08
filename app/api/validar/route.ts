import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function POST(req: Request) {
  try {
    const { cod_mod, codigo_estudiante } = await req.json();

    if (!cod_mod?.trim() || !codigo_estudiante?.trim()) {
      return NextResponse.json(
        { error: "Por favor, completa ambos campos" },
        { status: 400 }
      );
    }

    // ✅ 1. Buscar registro en minedu.encuesta_acceso
    const registroQuery = `
      SELECT 
        cod_mod,
        school_id,
        education_level,
        codigo_estudiante,
        codigo_director,
        token
      FROM minedu.encuesta_acceso
      WHERE cod_mod = $1
      AND (codigo_estudiante = $2 OR codigo_director = $2)
      LIMIT 1;
    `;

    const registroResult = await dbQuery(registroQuery, [
      cod_mod,
      codigo_estudiante,
    ]);

    const registro = registroResult.rows[0];

    if (!registro) {
      return NextResponse.json(
        { error: "credenciales_invalidas" },
        { status: 400 }
      );
    }

    // ✅ 2. Obtener datos del colegio + ugel + dre
    const schoolQuery = `
      SELECT 
        s.id,
        s.name,
        s.nivel_educativo,
        u.id AS ugel_id,
        u.name AS ugel_name,
        d.id AS dre_id,
        d.name AS dre_name
      FROM minedu.school_new s
      LEFT JOIN minedu.ugel_new u ON u.id = s.ugel_id
      LEFT JOIN minedu.dres d ON d.id = u.dre_id
      WHERE s.id = $1
      LIMIT 1;
    `;

    const schoolResult = await dbQuery(schoolQuery, [registro.school_id]);
    const schoolData = schoolResult.rows[0];

    if (!schoolData) {
      return NextResponse.json(
        { error: "No se encontró la información del colegio" },
        { status: 404 }
      );
    }

    const esDirector = registro.codigo_director === codigo_estudiante;

    return NextResponse.json({
      success: true,
      esDirector,
      data: {
        codigoModular: registro.cod_mod,
        schoolId: registro.id,
        codigoEstudiante: registro.codigo_estudiante,
        codigoDirector: registro.codigo_director,
        dre: schoolData.dre_name ?? "SIN DRE",
        ugel: schoolData.ugel_name ?? "SIN UGEL",
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
