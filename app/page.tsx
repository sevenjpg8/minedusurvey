"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario ya tiene acceso
    const accessData = sessionStorage.getItem("accessData")
    if (accessData) {
      router.push("/identificacion")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          {/* Video Container */}
          <div className="mb-8 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/FrZUjHeI6xI"
              title="Descubre el secreto mejor guardado del Minedu"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full"
            ></iframe>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-6">"TU VOZ NOS IMPORTA"</h2>

          {/* Description */}
          <p className="text-center text-amber-600 font-semibold mb-4">
            Queremos saber cómo te sientes en tu colegio. ¡Tus respuestas son muy importantes y secretas!
          </p>

          {/* Additional Info */}
          <p className="text-center text-gray-700 mb-8">
            Tu participación es voluntaria, anónima y muy valiosa. ¡Gracias por ayudarnos a mejorar la educación en el
            Perú!
          </p>

          <Link href="/acceso">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Iniciar Encuesta
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
