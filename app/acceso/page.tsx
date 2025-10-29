"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccesoPage() {
  const router = useRouter()
  const [codigoModular, setCodigoModular] = useState("")
  const [codigoAcceso, setCodigoAcceso] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Datos de ejemplo: código modular -> datos de la institución
  const institutionData: Record<
    string,
    {
      dre: string
      ugel: string
      institution: string
      level: string
    }
  > = {
    "001001": {
      dre: "dre1",
      ugel: "ugel1",
      institution: "IE Primaria San José",
      level: "primaria",
    },
    "001002": {
      dre: "dre2",
      ugel: "ugel2",
      institution: "IE Secundaria Los Andes",
      level: "secundaria",
    },
    "001003": {
      dre: "dre3",
      ugel: "ugel3",
      institution: "IE Inicial Pequeños Talentos",
      level: "inicial",
    },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validar que ambos campos estén completos
    if (!codigoModular.trim() || !codigoAcceso.trim()) {
      setError("Por favor, completa ambos campos")
      setLoading(false)
      return
    }

    // Validar que el código modular exista
    if (!institutionData[codigoModular]) {
      setError("Código modular no válido")
      setLoading(false)
      return
    }

    // Validar código de acceso (en este ejemplo, debe ser "1234")
    if (codigoAcceso !== "1234") {
      setError("Código de acceso incorrecto")
      setLoading(false)
      return
    }

    // Guardar datos en sessionStorage
    const data = institutionData[codigoModular]
    sessionStorage.setItem(
      "accessData",
      JSON.stringify({
        codigoModular,
        ...data,
      }),
    )

    // Redirigir a identificación
    router.push("/identificacion")
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <div className="p-8">
            {/* Logo and Header */}
            <div className="flex justify-center mb-8">
              <img src="/logo-minedu.png" alt="Ministerio de Educación" className="h-16 object-contain" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">Acceso a la Encuesta</h2>

            {/* Subtitle */}
            <p className="text-center text-sm text-gray-600 mb-8">Ingresa tus códigos para acceder a la encuesta</p>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Código Modular */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Código Modular</label>
                <input
                  type="text"
                  value={codigoModular}
                  onChange={(e) => setCodigoModular(e.target.value)}
                  placeholder="Ej: 001001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-xs text-gray-500 mt-1">Códigos de prueba: 001001, 001002, 001003</p>
              </div>

              {/* Código de Acceso */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Código de Acceso</label>
                <input
                  type="password"
                  value={codigoAcceso}
                  onChange={(e) => setCodigoAcceso(e.target.value)}
                  placeholder="Ingresa tu código de acceso"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-xs text-gray-500 mt-1">Código de prueba: 1234</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
              >
                {loading ? "Validando..." : "Acceder"}
              </button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  )
}
