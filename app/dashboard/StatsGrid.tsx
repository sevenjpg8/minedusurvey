"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import IncidentsModal from "@/components/incidents-modal"

interface Props {
  codigoDirector: string
}

interface EstudiantesData {
  totalCompletados: number
  primaria: number
  secundaria: number
  grados: number
  secciones: number
}

interface Dato {
  nombre: string
  valor: number
}

const dailyData = [
  { name: "Lunes", valor: 0 },
  { name: "Martes", valor: 0 },
  { name: "Miércoles", valor: 0 },
  { name: "Jueves", valor: 0 },
  { name: "Viernes", valor: 0 },
  { name: "Sábado", valor: 0 },
  { name: "Domingo", valor: 0 },
]

export default function StatsGrid({ codigoDirector }: Props) {
  const [estudiantes, setEstudiantes] = useState<EstudiantesData | null>(null)
  const [avanceDiario, setAvanceDiario] = useState<Dato[]>([])
  const [locales, setLocales] = useState<Dato[]>([])
  const [loading, setLoading] = useState(true)
  const [isIncidentsModalOpen, setIsIncidentsModalOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/director-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo_director: codigoDirector }),
        })
        const data = await res.json()

        console.log("Datos recibidos del API:", data)

        setEstudiantes({
          totalCompletados: data.estudiantes?.find((x: Dato) => x.nombre === "Total completados")?.valor ?? 0,
          primaria: data.estudiantes?.find((x: Dato) => x.nombre === "Total primaria")?.valor ?? 0,
          secundaria: data.estudiantes?.find((x: Dato) => x.nombre === "Total secundaria")?.valor ?? 0,
          grados: data.estudiantes?.find((x: Dato) => x.nombre === "Total grados")?.valor ?? 0,
          secciones: data.estudiantes?.find((x: Dato) => x.nombre === "Total secciones")?.valor ?? 0,
        })

        setLocales(data.locales || [])
        setAvanceDiario(data.avanceDiario || [])
      } catch (err) {
        console.error("Error al cargar:", err)
      } finally {
        setLoading(false)
      }
    }
    if (codigoDirector) fetchStats()
  }, [codigoDirector])

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )

  const rows = [
    { nombre: "Total encuestas completadas", valor: estudiantes?.totalCompletados ?? 0 },
    { nombre: "Total primaria", valor: estudiantes?.primaria ?? 0 },
    { nombre: "Total secundaria", valor: estudiantes?.secundaria ?? 0 },
    { nombre: "Total grados", valor: estudiantes?.grados ?? 0 },
    { nombre: "Total secciones", valor: estudiantes?.secciones ?? 0 },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div
        className="border-b-2 border-blue-200 sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: "rgb(0, 51, 102)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-white rounded-full" />
            <h1 className="text-4xl font-bold text-white">Panel del Director</h1>
          </div>
          <p className="text-blue-100 text-sm">Visualización de estadísticas y participación</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="border-b-2 border-gray-100 pb-4 bg-gradient-to-r from-gray-50 to-green-50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gray-600 rounded-full" />
                <CardTitle className="text-gray-900 text-xl">I. Estudiantes Participantes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-600 font-medium">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-3 px-4 text-gray-900">{e.nombre}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-sm">
                            {e.valor.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="border-b-2 border-blue-100 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                <CardTitle className="text-gray-900 text-xl">II. Avance Diario de Encuestas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={avanceDiario.length ? avanceDiario : dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" stroke="#000000ff" />
                  <YAxis stroke="#000000ff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #2563eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#1e40af" }}
                  />
                  <Bar dataKey="valor" fill="#f63b3bff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-6">
            <Button
              onClick={() => setIsIncidentsModalOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-12 py-5 text-xl font-bold tracking-wide shadow-lg rounded-2xl"
            >
              🚨 Reportar Incidencia
            </Button>
          </div>
        </div>
      </div>

      <IncidentsModal isOpen={isIncidentsModalOpen} onClose={() => setIsIncidentsModalOpen(false)} />
    </main>
  )
}
