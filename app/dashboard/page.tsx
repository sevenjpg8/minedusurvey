"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import StatsGrid from "./StatsGrid"
import Header from "@/components/header"

export default function DirectorDashboard() {
  const router = useRouter()
  const [accessData, setAccessData] = useState<any>(null)

  useEffect(() => {

    const accessDataRaw = sessionStorage.getItem("accessData")

    if (!accessDataRaw) {
      router.push("/acceso")
      return
    }

    try {
      const parsedData = JSON.parse(accessDataRaw)

      if (!parsedData.esDirector) {
        router.push("/acceso");
        return;
      }

      setAccessData(parsedData)
    } catch (err) {
      console.error("❌ Error al parsear accessData:", err)
      router.push("/acceso")
    }
  }, [router])

  if (!accessData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando datos del director...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="w-full px-6 py-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full">

          <h2 className="text-2xl font-semibold mb-2">
            {accessData.institution} -
            ({accessData.level === "p"
              ? "Primaria"
              : accessData.level === "s"
              ? "Secundaria"
              : accessData.level}
            )
          </h2>

          <p className="text-gray-600 mb-8 text-lg">
            DRE: {accessData.dre} • UGEL: {accessData.ugel}
          </p>

          {/* ✅ Tarjetas ocupan todo el ancho */}
          <StatsGrid codigoDirector={accessData.codigoDirector} />
        </div>
      </div>
    </main>
  )

}
