import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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
