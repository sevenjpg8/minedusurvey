"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "./ui/alert"


interface AccessData {
  codigoModular: string
  dre: string
  ugel: string
  institution: string
  level: string
}

export default function SurveyForm() {
  const router = useRouter()
  const [accessData, setAccessData] = useState<AccessData | null>(null)
  const [formData, setFormData] = useState({
    dre: "",
    ugel: "",
    institution: "",
    level: "",
    grade: "",
    section: "",
    sex: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const data = sessionStorage.getItem("accessData")
    if (!data) {
      router.push("/acceso")
      return
    }

    const parsed = JSON.parse(data) as AccessData
    setAccessData(parsed)
    setFormData((prev) => ({
      ...prev,
      dre: parsed.dre,
      ugel: parsed.ugel,
      institution: parsed.institution,
      level: parsed.level,
    }))
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    if (["dre", "ugel", "institution", "level"].includes(name)) {
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // 🔹 Validaciones de campos requeridos
    if (!formData.grade) {
      setError("Por favor, selecciona un grado")
      return
    }
    if (!formData.section) {
      setError("Por favor, selecciona una sección")
      return
    }
    if (!formData.sex) {
      setError("Por favor, selecciona tu sexo")
      return
    }

  try {
    const res = await fetch("/api/participacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: accessData?.codigoModular,
        level: formData.level,
        grade: formData.grade,
        section: formData.section,
        gender: formData.sex,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error(data.error)
      alert(data.error)
      return
    }

    // 🔹 Determinar el ID de encuesta según el nivel
    let surveyId: number
    if (formData.level.toLowerCase() === "primaria") {
      surveyId = 1
    } else {
      surveyId = 2
    }

    // 🔹 Guardar datos en sessionStorage para usarlos en /encuesta
    sessionStorage.setItem(
      "surveyAccess",
      JSON.stringify({
        schoolId: accessData?.codigoModular,
        surveyId,
        participationId: data.id // <-- Aquí es donde va
      })
    )


    console.log("Participación guardada:", data)
    router.push("/encuesta")
  } catch (error) {
    console.error("Error al enviar datos:", error)
    alert("Error al guardar la participación")
  }
}

  if (!accessData) {
    return (
      <Card className="w-full max-w-2xl bg-white shadow-lg">
        <div className="p-8 text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </Card>
    )
  }

  // 🔹 Determinar los grados disponibles según el nivel
  const gradeOptions =
    formData.level.toLowerCase() === "primaria"
      ? ["1", "2", "3", "4", "5", "6"]
      : ["1", "2", "3", "4", "5"]

  return (
    <Card className="w-full max-w-2xl bg-white shadow-lg">
      <div className="p-8">
        <div className="flex justify-center mb-8">
          <img src="/logo-minedu.png" alt="Ministerio de Educación" className="h-16 object-contain" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">Identificación para la Encuesta</h2>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-600 mb-8">
          Por favor, completa los siguientes datos para continuar. Tu identidad{" "}
          <span className="text-amber-600 font-semibold">permanecerá anónima</span>.
        </p>

        {/* ⚠️ Mensaje de error visual */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DRE - DISABLED */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Dirección Regional de Educación (DRE)
            </label>
            <select
              name="dre"
              value={formData.dre}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
            >
              <option value={formData.dre}>{formData.dre}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Este campo se completa automáticamente</p>
          </div>

          {/* UGEL - DISABLED */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">UGEL</label>
            <select
              name="ugel"
              value={formData.ugel}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
            >
              <option value={formData.ugel}>{formData.ugel}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Este campo se completa automáticamente</p>
          </div>

          {/* Institution - DISABLED */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Institución Educativa</label>
            <select
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
            >
              <option value={formData.institution}>{formData.institution}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Este campo se completa automáticamente</p>
          </div>

          {/* Level and Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Nivel</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
              >
                <option value={formData.level}>{formData.level}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Este campo se completa automáticamente</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Grado</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="">-- Seleccione --</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section and Sex */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Sección</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="">-- Seleccione --</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="a">D</option>
                <option value="c">E</option>
                <option value="b">F</option>
                <option value="c">G</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Sexo</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="">-- Seleccione --</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Continuar
          </button>
        </form>
      </div>
    </Card>
  )
}
