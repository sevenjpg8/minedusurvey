"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { CheckCircle2 } from "lucide-react"

export default function GraciasPage() {
  const router = useRouter()

  useEffect(() => {
    // Verify that user came from the survey
    const accessData = sessionStorage.getItem("accessData")
    if (!accessData) {
      router.push("/acceso")
    }
  }, [router])

  const handleReturn = () => {
    // Clear session data and return to access page
    sessionStorage.removeItem("accessData")
    router.push("/acceso")
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-blue-900 text-center mb-4">¡Encuesta Finalizada!</h1>

          {/* Messages */}
          <div className="space-y-4 mb-8 text-center">
            <p className="text-gray-700 text-base leading-relaxed">
              Hemos registrado tus respuestas de forma anónima y segura.
            </p>

            <p className="text-gray-700 text-base leading-relaxed">
              Tu participación es fundamental para construir un mejor futuro para la educación en el Perú.
            </p>

            <p className="text-gray-800 font-semibold text-base">¡Muchas gracias por tu tiempo y colaboración!</p>
          </div>
        </div>
      </div>
    </main>
  )
}
