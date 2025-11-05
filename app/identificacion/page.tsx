// app/identificacion/page.tsx
import SurveyForm from "@/components/survey-form";
import Header from "@/components/header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function IdentificacionPage() {
  // 🔹 Leer cookie server-side
  const cookieStore = await cookies();
  const accessDataRaw = cookieStore.get("accessData")?.value;
  const accessData = accessDataRaw ? JSON.parse(accessDataRaw) : null;

  // 🔹 Si no hay estudiante válido, redirige
  if (!accessData || !accessData.codigoEstudiante) {
    redirect("/acceso");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex items-center justify-center py-12 px-4">
        {/* Componente client que puede usar hooks o interactividad */}
        <SurveyForm />
      </div>
    </main>
  );
}
