"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

const incidents = [
  "El estudiante manifestó voluntariamente no participar de la encuesta.",
  "El estudiante inició el cuestionario, sin embargo, decidió no continuar con su desarrollo.",
  "El estudiante reveló un caso de violencia escolar.",
  "El estudiante mostró malestar emocional (expresión de angustia, bloqueo, llanto, etc.) durante la aplicación del cuestionario, pero decidió continuar con la encuesta.",
  "El estudiante mostró malestar emocional (expresión de angustia, bloqueo, llanto, etc.) durante la aplicación del cuestionario y decidió no continuar con la encuesta.",
  "El estudiante requirió ser derivado a primeros auxilios durante la aplicación del cuestionario.",
  "El estudiante requirió contención emocional durante la aplicación del cuestionario.",
  "El estudiante requirió ser derivado al servicio de tutoría y/o psicología durante la aplicación del cuestionario.",
  "Fallas de la plataforma web, donde los estudiantes no pudieron ingresar al desarrollo del cuestionario.",
  "Fallas de la plataforma web, donde los estudiantes no pudieron grabar el cuestionario aplicado.",
]

interface IncidentsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IncidentsModal({ isOpen, onClose }: IncidentsModalProps) {
  const [selectedIncidents, setSelectedIncidents] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleToggleIncident = (index: number) => {
    setSelectedIncidents((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleSubmit = () => {
    console.log(
      "Incidencias seleccionadas:",
      selectedIncidents.map((i) => incidents[i]),
    )
    setSubmitted(true)
    setTimeout(() => {
      handleReset()
    }, 2000)
  }

  const handleReset = () => {
    setSelectedIncidents([])
    setSubmitted(false)
    onClose()
  }

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl text-center p-8 bg-white">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Gracias por tu aporte!</h2>
          <p className="text-slate-600 mb-6">
            Tus respuestas han sido registradas exitosamente y nos ayudarán a mejorar la educación en el Perú.
          </p>
          <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
            Cerrar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.50)] flex items-center justify-center p-4 z-50">
      <Card
        className="w-full max-w-4xl bg-white shadow-2xl my-8 max-h-300 flex flex-col border-0 border-t-4"
        style={{ borderTopColor: "rgb(0, 51, 102)" }}
      >

        <div className="p-8 overflow-y-auto flex-1">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Qué tipo de incidencia o caso se presentó en el aula
            </h3>
            <p className="text-sm text-slate-600 mb-6">Selecciona todas las opciones que apliquen</p>

            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`incident-${index}`}
                    checked={selectedIncidents.includes(index)}
                    onCheckedChange={() => handleToggleIncident(index)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`incident-${index}`}
                    className="text-sm text-slate-700 cursor-pointer leading-relaxed flex-1"
                  >
                    {incident}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-base"
          >
            Enviar Respuestas
          </Button>

          {selectedIncidents.length > 0 && (
            <p className="text-center text-sm text-slate-600 mt-4">
              Has seleccionado {selectedIncidents.length} de {incidents.length} opciones
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
