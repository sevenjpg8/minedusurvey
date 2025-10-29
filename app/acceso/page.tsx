"use client"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoModular, codigoAcceso }),
      })

      const result = await response.json()
      setLoading(false)

      if (!response.ok || !result.success) {
        setError(result.error || "Código modular o código de acceso incorrecto")
        return
      }

      // Guardar los datos del colegio en sessionStorage
      sessionStorage.setItem("accessData", JSON.stringify(result.schools))

      // Redirigir a la página de identificación
      router.push("/identificacion")
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al validar los datos")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white shadow-lg">
          <div className="p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/logo-minedu.png"
                alt="Ministerio de Educación"
                className="h-16 object-contain"
              />
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">
              Acceso a la Encuesta
            </h2>

            <p className="text-center text-sm text-gray-600 mb-8">
              Ingresa tus códigos para acceder a la encuesta
            </p>

            {/* Error */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Código Modular */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Código Modular
                </label>
                <input
                  type="text"
                  value={codigoModular}
                  onChange={(e) => setCodigoModular(e.target.value)}
                  placeholder="Ingresa el código modular"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Código de Acceso */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Código de Acceso
                </label>
                <input
                  type="password"
                  value={codigoAcceso}
                  onChange={(e) => setCodigoAcceso(e.target.value)}
                  placeholder="Ingresa tu código de acceso"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Botón */}
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
