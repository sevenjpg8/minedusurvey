// lib/getQuestions.ts
export interface Question {
  id: number
  text: string
  options: string[]
  type?: string
  survey_id?: number
  dimension_id?: number
  order?: number
  prefix?: string | null
}

// Función para traer opciones según question_id
async function getOptions(questionIds: number[]): Promise<{ question_id: number; text: string }[]> {
  if (questionIds.length === 0) return []

  const ids = questionIds.join(",")
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}rest/v1/options?select=id,question_id,text&question_id=in.(${ids})&order=id.asc`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    console.error("Error cargando opciones:", errorText)
    throw new Error(`Error ${res.status} cargando opciones`)
  }

  return res.json()
}

export async function getQuestions(surveyId: number): Promise<Question[]> {
  try {
    // 1️⃣ Traer preguntas según surveyId
    const questionsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}rest/v1/questions?select=id,text,type,prefix,order&survey_id=eq.${surveyId}&order=id.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    )

    if (!questionsRes.ok) {
      const errorText = await questionsRes.text()
      console.error("Error cargando preguntas:", errorText)
      throw new Error(`Error ${questionsRes.status} cargando preguntas`)
    }

    const questionsData = await questionsRes.json()
    const questionIds = questionsData.map((q: any) => q.id)

    // 2️⃣ Traer opciones para esas preguntas
    const optionsData = await getOptions(questionIds)

    // 3️⃣ Transformar a la interfaz que necesita la UI
    return questionsData.map((q: any) => {
      const opts = optionsData.filter((opt) => opt.question_id === q.id).map((opt) => opt.text)

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        order: q.order,
        prefix: q.prefix,
        // Si no hay opciones, fallback a valores por defecto
        options: opts.length > 0 ? opts : ["Totalmente de acuerdo", "De acuerdo", "En desacuerdo", "Totalmente en desacuerdo"],
      }
    })
  } catch (err) {
    console.error("Error en getQuestions:", err)
    throw err
  }
}
