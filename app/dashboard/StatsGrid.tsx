"use client"

import { useState } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface DataRow {
  label: string
  total: number
  gestionPublica: number
  gestionPrivada: number
}

interface DataSection {
  title: string
  rows: DataRow[]
}

interface Incidence {
  id: string
  description: string
  seccion: string
  grado: string
  localEducativo: string
  ugel: string
  dre: string
  date: string
}

export default function DashboardPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["I"])
  const [incidences, setIncidences] = useState<Incidence[]>([])
  const [showIncidenceForm, setShowIncidenceForm] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    seccion: "",
    grado: "",
    localEducativo: "",
    ugel: "",
    dre: "",
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const handleAddIncidence = () => {
    if (formData.description.trim() === "") return

    const newIncidence: Incidence = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toLocaleDateString("es-ES"),
    }

    setIncidences([...incidences, newIncidence])
    setFormData({
      description: "",
      seccion: "",
      grado: "",
      localEducativo: "",
      ugel: "",
      dre: "",
    })
    setShowIncidenceForm(false)
  }

  const handleDeleteIncidence = (id: string) => {
    setIncidences(incidences.filter((inc) => inc.id !== id))
  }

  const dataSections: DataSection[] = [
    {
      title: "I.- Estudiantes participantes en la encuesta",
      rows: [
        { label: "Sección", total: 450, gestionPublica: 280, gestionPrivada: 170 },
        { label: "Grado", total: 1200, gestionPublica: 720, gestionPrivada: 480 },
        { label: "Nivel Primaria", total: 3500, gestionPublica: 2100, gestionPrivada: 1400 },
        { label: "Nivel Secundaria", total: 4200, gestionPublica: 2500, gestionPrivada: 1700 },
        { label: "Local Educativo", total: 2800, gestionPublica: 1680, gestionPrivada: 1120 },
        { label: "UGEL", total: 1900, gestionPublica: 1140, gestionPrivada: 760 },
        { label: "DRE", total: 890, gestionPublica: 534, gestionPrivada: 356 },
        { label: "Nacional", total: 580, gestionPublica: 348, gestionPrivada: 232 },
      ],
    },
    {
      title: "II.- Total de locales educativos participantes (*)",
      rows: [
        { label: "Solo primaria", total: 23, gestionPublica: 15, gestionPrivada: 8 },
        { label: "Solo secundaria", total: 18, gestionPublica: 10, gestionPrivada: 8 },
        { label: "Con primaria y secundaria", total: 31, gestionPublica: 20, gestionPrivada: 11 },
        { label: "A nivel de UGEL", total: 12, gestionPublica: 8, gestionPrivada: 4 },
        { label: "A nivel de DRE", total: 5, gestionPublica: 3, gestionPrivada: 2 },
      ],
    },
    {
      title: "III.- Avance diario de encuestas",
      rows: [
        { label: "Lunes", total: 342, gestionPublica: 205, gestionPrivada: 137 },
        { label: "Martes", total: 428, gestionPublica: 257, gestionPrivada: 171 },
        { label: "Miércoles", total: 385, gestionPublica: 231, gestionPrivada: 154 },
        { label: "Jueves", total: 412, gestionPublica: 247, gestionPrivada: 165 },
        { label: "Viernes", total: 395, gestionPublica: 237, gestionPrivada: 158 },
        { label: "Sábado", total: 287, gestionPublica: 172, gestionPrivada: 115 },
        { label: "Domingo", total: 251, gestionPublica: 151, gestionPrivada: 100 },
      ],
    },
  ]

  const DataRow = ({ row }: { row: DataRow }) => (
    <div className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
      <div className="grid grid-cols-4 gap-4 px-6 py-4 items-center">
        <div className="text-gray-700 font-medium">{row.label}</div>
        <div className="text-center">
          <span className="text-lg font-bold text-gray-900">{row.total}</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-blue-600">{row.gestionPublica}</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-emerald-600">{row.gestionPrivada}</span>
        </div>
      </div>
    </div>
  )

  const SectionHeader = ({ section }: { section: DataSection }) => (
    <div
      onClick={() => toggleSection(section.title)}
      className="bg-gradient-to-r from-blue-50 to-transparent border-b-2 border-gray-300 px-6 py-4 cursor-pointer hover:bg-blue-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${
            expandedSections.includes(section.title) ? "rotate-180" : ""
          }`}
        />
        <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
      </div>
    </div>
  )

  const TableHeader = () => (
    <div className="bg-gray-900 text-white sticky top-0 z-10">
      <div className="grid grid-cols-4 gap-4 px-6 py-4 font-bold text-center">
        <div className="text-left">Campos de visualización</div>
        <div>Total</div>
        <div>Gestión Pública</div>
        <div>Gestión Privada</div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard de Encuestas Educativas</h1>
          <p className="text-gray-600 mt-2">Monitoreo de participación por gestión educativa</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <TableHeader />

          {dataSections.map((section) => (
            <div key={section.title} className="border-b border-gray-300">
              <SectionHeader section={section} />
              {expandedSections.includes(section.title) && (
                <div className="bg-white">
                  {section.rows.map((row, idx) => (
                    <DataRow key={idx} row={row} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="px-6 py-4 bg-gray-100 text-sm text-gray-600 border-t border-gray-200">
            <p>(*) Locales educativos con estudiantes que completaron el cuestionario</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Total de Estudiantes</p>
            <p className="text-3xl font-bold text-gray-900">15,620</p>
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <p className="text-gray-500">Gestión Pública</p>
                <p className="font-bold text-blue-600">9,372</p>
              </div>
              <div>
                <p className="text-gray-500">Gestión Privada</p>
                <p className="font-bold text-emerald-600">6,248</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Locales Educativos</p>
            <p className="text-3xl font-bold text-gray-900">89</p>
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <p className="text-gray-500">Gestión Pública</p>
                <p className="font-bold text-blue-600">56</p>
              </div>
              <div>
                <p className="text-gray-500">Gestión Privada</p>
                <p className="font-bold text-emerald-600">33</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Tasa de Participación</p>
            <p className="text-3xl font-bold text-gray-900">85.2%</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85.2%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-transparent border-b-2 border-gray-300 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">IV.- Registro de incidencias/casos presentados</h2>
          </div>

          <div className="p-6">
            {!showIncidenceForm ? (
              <Button
                onClick={() => setShowIncidenceForm(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Agregar Incidencia
              </Button>
            ) : (
              <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción de la incidencia o caso presentado *
                  </label>
                  <Textarea
                    placeholder="Describe el incidente o caso..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
                    <Input
                      placeholder="Ingresa la sección"
                      value={formData.seccion}
                      onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                    <Input
                      placeholder="Ingresa el grado"
                      value={formData.grado}
                      onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local Educativo</label>
                  <Input
                    placeholder="Ingresa el local educativo"
                    value={formData.localEducativo}
                    onChange={(e) => setFormData({ ...formData, localEducativo: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UGEL</label>
                    <Input
                      placeholder="Ingresa la UGEL"
                      value={formData.ugel}
                      onChange={(e) => setFormData({ ...formData, ugel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DRE</label>
                    <Input
                      placeholder="Ingresa la DRE"
                      value={formData.dre}
                      onChange={(e) => setFormData({ ...formData, dre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddIncidence} className="bg-orange-600 hover:bg-orange-700 text-white">
                    Guardar Incidencia
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIncidenceForm(false)
                      setFormData({
                        description: "",
                        seccion: "",
                        grado: "",
                        localEducativo: "",
                        ugel: "",
                        dre: "",
                      })
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {incidences.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Incidencias Registradas ({incidences.length})</h3>
                {incidences.map((incidence) => (
                  <div
                    key={incidence.id}
                    className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{incidence.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <p>
                            <span className="font-medium">Sección:</span> {incidence.seccion || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Grado:</span> {incidence.grado || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Local:</span> {incidence.localEducativo || "-"}
                          </p>
                          <p>
                            <span className="font-medium">UGEL:</span> {incidence.ugel || "-"}
                          </p>
                          <p>
                            <span className="font-medium">DRE:</span> {incidence.dre || "-"}
                          </p>
                          <p className="text-gray-500 text-xs">Fecha: {incidence.date}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteIncidence(incidence.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
