// app/dashboard/page.tsx
import Header from "@/components/header";
import StatsGrid from "./StatsGrid"; // Este sí será client
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessDataRaw = cookieStore.get("accessData")?.value;
  const accessData = accessDataRaw ? JSON.parse(accessDataRaw) : null;

  if (!accessData || !accessData.codigoDirector) redirect("/acceso");

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <StatsGrid />
    </main>
  );
}
