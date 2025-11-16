import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

interface NivelesEscuela {
  primaria: boolean;
  secundaria: boolean;
}

export async function POST(req: Request) {
  try {
    const { codigo_director } = await req.json();

    if (!codigo_director) {
      return NextResponse.json(
        { error: "Falta el código del director" },
        { status: 400 }
      );
    }

    // 1. Obtener los códigos modulares del director
    const colegios = await dbQuery(
      `
      SELECT DISTINCT cod_mod AS codigo_modular
      FROM minedu.encuesta_acceso
      WHERE codigo_director = $1
      `,
      [codigo_director]
    );

    const codigos = colegios.rows.map((c) => c.codigo_modular);

    if (!codigos.length) {
      return NextResponse.json({
        estudiantes: [],
        locales: [],
        avanceDiario: [],
      });
    }

    // 2. Participaciones sin duplicados
    const participacionesResult = await dbQuery(
      `
      SELECT
        id,
        school_id,
        education_level,
        grade,
        section,
        ugel_id,
        dre_id,
        codigo_modular,
        codigo_estudiante,
        completed_at
      FROM minedu.survey_participations
      WHERE codigo_modular = ANY($1)
        AND completed_at IS NOT NULL;
      `,
      [codigos]
    );

    const participaciones = participacionesResult.rows;

    // Total encuestas completadas
    const totalCompletados = participaciones.length;

    // Total estudiantes únicos por nivel educativo
    const primariaEstudiantes = new Set(
      participaciones
        .filter(p => p.education_level?.toLowerCase() === "primaria")
        .map(p => p.codigo_estudiante)
    );

    const secundariaEstudiantes = new Set(
      participaciones
        .filter(p => p.education_level?.toLowerCase() === "secundaria")
        .map(p => p.codigo_estudiante)
    );

    // Total de grados únicos
    const totalGrados = new Set(
      participaciones.map(p => p.grade?.trim()).filter(Boolean)
    ).size;

    // Total de secciones únicas
    const totalSecciones = new Set(
      participaciones.map(p => p.section?.trim()).filter(Boolean)
    ).size;

    const estudiantes = [
      { nombre: "Total completados", valor: totalCompletados },
      { nombre: "Total primaria", valor: primariaEstudiantes.size },
      { nombre: "Total secundaria", valor: secundariaEstudiantes.size },
      { nombre: "Total grados", valor: totalGrados },
      { nombre: "Total secciones", valor: totalSecciones },
    ];


    // 4. Clasificación de colegios
    const nivelesPorEscuela: Record<string, NivelesEscuela> = {};

    participaciones.forEach((p) => {
      const id = String(p.school_id);
      const lvl = p.education_level?.toLowerCase();

      if (!nivelesPorEscuela[id]) {
        nivelesPorEscuela[id] = { primaria: false, secundaria: false };
      }

      if (lvl === "primaria") nivelesPorEscuela[id].primaria = true;
      if (lvl === "secundaria") nivelesPorEscuela[id].secundaria = true;
    });

    let soloPrimaria = 0;
    let soloSecundaria = 0;
    let conAmbos = 0;

    Object.values(nivelesPorEscuela).forEach((n) => {
      if (n.primaria && !n.secundaria) soloPrimaria++;
      else if (!n.primaria && n.secundaria) soloSecundaria++;
      else if (n.primaria && n.secundaria) conAmbos++;
    });

    const totalColegiosUgel = new Set(participaciones.map((p) => p.school_id)).size;
    const totalColegiosDre = new Set(participaciones.map((p) => p.dre_id).filter(Boolean)).size;

    const locales = [
      { nombre: "Solo primaria", valor: soloPrimaria },
      { nombre: "Solo secundaria", valor: soloSecundaria },
      { nombre: "Con primaria y secundaria", valor: conAmbos },
      { nombre: "Colegios a nivel UGEL", valor: totalColegiosUgel },
      { nombre: "Colegios a nivel DRE", valor: totalColegiosDre },
    ];

    // 5. Avance diario
    const avanceDiarioResult = await dbQuery(
      `
      SELECT
        TO_CHAR(completed_at, 'TMDay') AS dia,
        COUNT(*) AS cantidad
      FROM minedu.survey_participations
      WHERE codigo_modular = ANY($1)
        AND completed_at IS NOT NULL
        AND completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY dia, EXTRACT(DOW FROM completed_at)
      ORDER BY EXTRACT(DOW FROM completed_at);
      `,
      [codigos]
    );

    const diasOrdenados = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    const traduccionDias: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    };

    const avanceDiario = diasOrdenados.map((dia) => {
      const encontrado = avanceDiarioResult.rows.find((r) => {
        const esp = traduccionDias[r.dia.trim().toLowerCase()];
        return esp === dia;
      });

      return { name: dia, valor: encontrado ? Number(encontrado.cantidad) : 0 };
    });

    return NextResponse.json({ estudiantes, locales, avanceDiario });
  } catch (err) {
    console.error("❌ Error en dashboard:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
