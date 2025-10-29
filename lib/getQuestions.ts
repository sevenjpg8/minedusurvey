// lib/getQuestions.ts
export interface Question {
  id: number
  text: string
  options: string[]
}

export async function getQuestions(surveyId: number) {
  try {
    const url = `https://lhndzyivcaqearmpcnzx.supabase.co/rest/v1/questions?select=id,survey_id,dimension_id,text,type,prefix,order&survey_id=eq.${surveyId}&order=id.asc`;

  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error cargando preguntas:", errorText);
    throw new Error(`Error ${res.status} cargando preguntas`);
  }

  return res.json();
  } catch (err) {
    console.error("Error en getQuestions:", err)
    throw err
  }
}

