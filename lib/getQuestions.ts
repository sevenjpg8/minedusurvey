// lib/getQuestions.ts
interface Option {
  id: number
  text: string
  next_question_id?: number | null
}

export interface Question {
  id: number
  text: string
  type?: string
  survey_id?: number
  dimension_id?: number
  order?: number
  prefix?: string | null
  options: Option[]
}

// Función para traer opciones según question_id
async function getOptions(questionIds: number[]): Promise<{ id: number; question_id: number; text: string }[]> {
  if (questionIds.length === 0) return []

  const ids = questionIds.join(",")
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}rest/v1/options?select=id,question_id,text,next_question_id&question_id=in.(${ids})&order=id.asc`,
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

    // 2️⃣ Traer opciones (incluyendo next_question_id)
    const optionsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}rest/v1/options?select=id,question_id,text,next_question_id&question_id=in.(${questionIds.join(",")})`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      }
    )

    if (!optionsRes.ok) {
      const errorText = await optionsRes.text()
      console.error("Error cargando opciones:", errorText)
      throw new Error(`Error ${optionsRes.status} cargando opciones`)
    }

    const optionsData = await optionsRes.json()

    // 3️⃣ Transformar la estructura para el frontend
    return questionsData.map((q: any) => {
      const opts = optionsData
        .filter((opt: any) => opt.question_id === q.id)
        .map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          next_question_id: opt.next_question_id ?? null,
        }))
      //console.log("🧠 Preguntas cargadas con flujos:", questionsData)
      //console.log("🧩 Opciones cargadas:", optionsData)
      return {
        id: q.id,
        text: q.text,
        type: q.type,
        order: q.order,
        prefix: q.prefix,
        options: opts,  
      }
    })
    
  } catch (err) {
    console.error("Error en getQuestions:", err)
    throw err
  }
}