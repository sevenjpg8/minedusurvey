"use client"

import { useEffect, useState } from "react"
import { Loader2, Users, Building2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  codigoDirector: string
}

interface Dato {
  nombre: string
  valor: number
}

export default function StatsGridImproved({ codigoDirector }: Props) {
  const [estudiantes, setEstudiantes] = useState<Dato[]>([])
  const [locales, setLocales] = useState<Dato[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/director-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo_director: codigoDirector }),
        })
        const data = await res.json()
        setEstudiantes(data.estudiantes || [])
        setLocales(data.locales || [])
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )

  const totalEstudiantes = estudiantes.reduce((sum, e) => sum + e.valor, 0)
  const totalLocales = locales.reduce((sum, l) => sum + l.valor, 0)

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h1 className="text-3xl font-bold text-text-balance">Panel del Director</h1>
          </div>
          <p className="text-muted-foreground text-sm">Visualización de estadísticas y participación</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards 
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Estudiantes Totales
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">{totalEstudiantes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Participantes en la encuesta</p>
            </CardContent>
          </Card>


          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-secondary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Locales Educativos
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-1">{totalLocales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Instituciones participantes</p>
            </CardContent>
          </Card>
        </div>*/}

        {/* Data Tables Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Students Table */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/30 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <CardTitle>I. Estudiantes Participantes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((e, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3 px-4 text-foreground">{e.nombre}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold text-sm">
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

          {/* Locals Table */}
          <Card className="border-border/50">
            <CardHeader className="border-b border-border/30 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-secondary rounded-full" />
                <CardTitle>II. Locales Educativos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locales.map((l, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3 px-4 text-foreground">{l.nombre}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold text-sm">
                            {l.valor.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
