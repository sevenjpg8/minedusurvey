import { NextResponse } from "next/server";
import { dbQuery } from "@/app/config/connection";

export async function POST(req: Request) {
  try {
    const { codigo_director } = await req.json();

    if (!codigo_director) {
      return NextResponse.json(
        { error: "Falta el código del director" },
        { status: 400 }
      );
    }

    // 1️⃣ Obtener escuelas vinculadas al director
    const escuelasResult = await dbQuery(
      `
      SELECT school_id
      FROM minedu.encuesta_acceso
      WHERE codigo_director = $1;
      `,
      [codigo_director]
    );

    const schoolIds = escuelasResult.rows.map(r => r.school_id);

    if (!schoolIds.length) {
      return NextResponse.json({ estudiantes: [], locales: [] });
    }

    // 2️⃣ Participaciones de estudiantes
    const participacionesResult = await dbQuery(
      `
      SELECT education_level, grade, section, school_id
      FROM minedu.survey_participations
      WHERE school_id = ANY($1);
      `,
      [schoolIds]
    );

    const participaciones = participacionesResult.rows;

    // 3️⃣ Datos de escuelas
    const schoolsDataResult = await dbQuery(
      `
      SELECT id, ugel_id, nivel_educativo
      FROM minedu.school_new
      WHERE id = ANY($1);
      `,
      [schoolIds]
    );

    const schoolsData = schoolsDataResult.rows;

    // Mapa school_id → ugel_id
    const schoolToUgel: Record<number, number> = {};
    schoolsData.forEach(s => (schoolToUgel[s.id] = s.ugel_id));

    //  Obtener DRE por cada UGEL
    const ugelIds = [...new Set(schoolsData.map(s => s.ugel_id))];

    const dresResult = await dbQuery(
      `
      SELECT id, dre_id
      FROM minedu.ugel_new
      WHERE id = ANY($1);
      `,
      [ugelIds]
    );

    const ugelToDre: Record<number, number> = {};
    dresResult.rows.forEach(u => (ugelToDre[u.id] = u.dre_id));

    // 4️⃣ Contar estudiantes por UGEL y DRE
    const estudiantesPorUgel = new Map<number, number>();
    const estudiantesPorDre = new Map<number, number>();

    participaciones.forEach(p => {
      const ugelId = schoolToUgel[p.school_id];
      if (ugelId != null) {
          estudiantesPorUgel.set(
            ugelId,
            (estudiantesPorUgel.get(ugelId) || 0) + 1
          );

        const dreId = ugelToDre[ugelId];
        if (dreId != null) {
          estudiantesPorDre.set(
            dreId,
            (estudiantesPorDre.get(dreId) || 0) + 1
          );
        }
      }
    });

    const totalColegiosPorUgel = schoolsData.length;

    // 5️⃣ Totales generales estudiantes
    const totalPrimaria = participaciones.filter(p =>
      p.education_level.toLowerCase().includes("primaria")
    ).length;

    const totalSecundaria = participaciones.filter(p =>
      p.education_level.toLowerCase().includes("secundaria")
    ).length;

    const totalSecciones = new Set(participaciones.map(p => p.section)).size;
    const totalGrados = new Set(participaciones.map(p => p.grade)).size;

    const estudiantes = [
      { nombre: "Sección", valor: totalSecciones },
      { nombre: "Grado", valor: totalGrados },
      { nombre: "Nivel Primaria", valor: totalPrimaria },
      { nombre: "Nivel Secundaria", valor: totalSecundaria },
    ];

    // 6️⃣ Clasificación de colegios
    const soloPrimaria = schoolsData.filter(
      s =>
        s.nivel_educativo.toLowerCase().includes("primaria") &&
        !s.nivel_educativo.toLowerCase().includes("secundaria")
    ).length;

    const soloSecundaria = schoolsData.filter(
      s =>
        s.nivel_educativo.toLowerCase().includes("secundaria") &&
        !s.nivel_educativo.toLowerCase().includes("primaria")
    ).length;

    const conAmbos = schoolsData.filter(
      s =>
        s.nivel_educativo.toLowerCase().includes("primaria") &&
        s.nivel_educativo.toLowerCase().includes("secundaria")
    ).length;

    // Contar colegios por DRE
    const colegiosPorDre = new Map<number, number>();
    schoolsData.forEach(s => {
      const dreId = ugelToDre[s.ugel_id];
      if (dreId != null) {
        colegiosPorDre.set(dreId, (colegiosPorDre.get(dreId) || 0) + 1);
      }
    });

    const totalColegiosPorDre = [...colegiosPorDre.values()].reduce(
      (a, b) => a + b,
      0
    );

    const locales = [
      { nombre: "Solo primaria", valor: soloPrimaria },
      { nombre: "Solo secundaria", valor: soloSecundaria },
      { nombre: "Con primaria y secundaria", valor: conAmbos },
      { nombre: "Colegios a nivel UGEL", valor: totalColegiosPorUgel },
      { nombre: "Colegios a nivel DRE", valor: totalColegiosPorDre },
    ];

    return NextResponse.json({ estudiantes, locales });
  } catch (err: any) {
    console.error("❌ Error en dashboard:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
