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
    console.log("📊 Iniciando carga del dashboard del director...")

    const accessDataRaw = localStorage.getItem("accessData")
    if (!accessDataRaw) {
      console.warn("⚠️ No se encontró accessData en localStorage.")
      router.push("/acceso")
      return
    }

    try {
      const parsedData = JSON.parse(accessDataRaw)
      setAccessData(parsedData)
      console.log("✅ accessData cargado correctamente:", parsedData)
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
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <br />
      <Card className="p-6 max-w-5xl mx-auto bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {accessData.institution} ({accessData.level})
        </h2>
        <p className="text-gray-600 mb-6">
          DRE: {accessData.dre} • UGEL: {accessData.ugel}
        </p>

        {/* ✅ Pasamos el código del director */}
        <StatsGrid codigoDirector={accessData.codigoDirector} />
      </Card>
    </main>
  )
}
