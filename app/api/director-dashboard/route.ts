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

    const escuelasResult = await dbQuery(
      `
      SELECT school_id
      FROM minedu.encuesta_acceso
      WHERE codigo_director = $1;
      `,
      [codigo_director]
    );

    const schoolIds = escuelasResult.rows.map((r) => r.school_id);

    if (!schoolIds.length) {
      return NextResponse.json({ estudiantes: [], locales: [], avanceDiario: [] });
    }

    const participacionesResult = await dbQuery(
      `
        SELECT education_level, grade, section, school_id, completed_at
        FROM minedu.survey_participations
        WHERE school_id = ANY($1)
          AND completed_at IS NOT NULL;
      `,
      [schoolIds]
    );

    const participaciones = participacionesResult.rows;

    const schoolsDataResult = await dbQuery(
      `
        SELECT id, ugel_id
        FROM minedu.school_new
        WHERE id = ANY($1);
      `,
      [schoolIds]
    );

    const schoolsData = schoolsDataResult.rows;

    const schoolToUgel: Record<number, number> = {};
    schoolsData.forEach((s) => (schoolToUgel[s.id] = s.ugel_id));

    const ugelIds = [...new Set(schoolsData.map((s) => s.ugel_id))];

    const dresResult = await dbQuery(
      `
      SELECT id, dre_id
      FROM minedu.ugel_new
      WHERE id = ANY($1);
      `,
      [ugelIds]
    );

    const ugelToDre: Record<number, number> = {};
    dresResult.rows.forEach((u) => (ugelToDre[u.id] = u.dre_id));

    const estudiantesPorUgel = new Map<number, number>();
    const estudiantesPorDre = new Map<number, number>();

    participaciones.forEach((p) => {
      const ugelId = schoolToUgel[p.school_id];

      if (ugelId != null) {
        estudiantesPorUgel.set(ugelId, (estudiantesPorUgel.get(ugelId) || 0) + 1);

        const dreId = ugelToDre[ugelId];
        if (dreId != null) {
          estudiantesPorDre.set(dreId, (estudiantesPorDre.get(dreId) || 0) + 1);
        }
      }
    });

    const totalColegiosPorUgel = schoolsData.length;

    const totalPrimaria = participaciones.filter(
      (p) => p.level?.toLowerCase() === "primaria"
    ).length;

    const totalSecundaria = participaciones.filter(
      (p) => p.level?.toLowerCase() === "secundaria"
    ).length;

    const totalSecciones = new Set(participaciones.map((p) => p.section)).size;
    const totalGrados = new Set(participaciones.map((p) => p.grade)).size;

    const estudiantes = [
      { nombre: "Sección", valor: totalSecciones },
      { nombre: "Grado", valor: totalGrados },
      { nombre: "Nivel Primaria", valor: totalPrimaria },
      { nombre: "Nivel Secundaria", valor: totalSecundaria },
    ];

    const nivelesPorEscuela: Record<number, { p: boolean; s: boolean }> = {};

    participaciones.forEach((p) => {
      const id = p.school_id;
      const lvl = p.level?.toLowerCase();

      if (!nivelesPorEscuela[id]) {
        nivelesPorEscuela[id] = { p: false, s: false };
      }

      if (lvl === "primaria") nivelesPorEscuela[id].p = true;
      if (lvl === "secundaria") nivelesPorEscuela[id].s = true;
    });

    let soloPrimaria = 0;
    let soloSecundaria = 0;
    let conAmbos = 0;

    Object.values(nivelesPorEscuela).forEach((n) => {
      if (n.p && !n.s) soloPrimaria++;
      else if (!n.p && n.s) soloSecundaria++;
      else if (n.p && n.s) conAmbos++;
    });

    // 8️⃣ Total de colegios por DRE
    const colegiosPorDre = new Map<number, number>();
    schoolsData.forEach((s) => {
      const dreId = ugelToDre[s.ugel_id];
      if (dreId != null) {
        colegiosPorDre.set(dreId, (colegiosPorDre.get(dreId) || 0) + 1);
      }
    });

    const totalColegiosPorDre = [...colegiosPorDre.values()].reduce((a, b) => a + b, 0);

    const locales = [
      { nombre: "Solo primaria", valor: soloPrimaria },
      { nombre: "Solo secundaria", valor: soloSecundaria },
      { nombre: "Con primaria y secundaria", valor: conAmbos },
      { nombre: "Colegios a nivel UGEL", valor: totalColegiosPorUgel },
      { nombre: "Colegios a nivel DRE", valor: totalColegiosPorDre },
    ];

    // 9️⃣ Avance diario últimos 7 días
    const avanceDiarioResult = await dbQuery(
      `
        SELECT
          TO_CHAR(completed_at, 'TMDay') AS dia,
          COUNT(*) AS cantidad
        FROM minedu.survey_participations
        WHERE school_id = ANY($1)
          AND completed_at IS NOT NULL
          AND completed_at >= NOW() - INTERVAL '7 days'
        GROUP BY dia, EXTRACT(DOW FROM completed_at)
        ORDER BY EXTRACT(DOW FROM completed_at);
      `,
      [schoolIds]
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

    const conteosPorDia = diasOrdenados.map((dia) => {
      const encontrado = avanceDiarioResult.rows.find((r) => {
        const diaEnEspañol = traduccionDias[r.dia.trim().toLowerCase()];
        return diaEnEspañol === dia;
      });
      return { name: dia, valor: encontrado ? Number(encontrado.cantidad) : 0 };
    });

    return NextResponse.json({ estudiantes, locales, avanceDiario: conteosPorDia });
  } catch (err: any) {
    console.error("❌ Error en dashboard:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
