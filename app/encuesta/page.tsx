// app/encuesta/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

interface Question {
  id: number
  text: string
  options: { id: number; text: string; next_question_id?: number | null }[]
  prefix?: string | null
  type?: string
  survey_id?: number
  dimension_id?: number
  order?: number
}

export default function SurveyPage() {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [questionHistory, setQuestionHistory] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const access = sessionStorage.getItem("surveyAccess")
    if (!access) return

    const { surveyId } = JSON.parse(access)

    const loadQuestions = async () => {
      try {
        // ✅ Llamada a tu nueva API
        const res = await fetch(`/api/surveys?id=${surveyId}`)
        const questionsData = await res.json()
        setQuestions(questionsData)
      } catch (error) {
        console.error("Error cargando preguntas", error)
      }
    }

    loadQuestions()
  }, [router])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (optionId: number) => {
    const questionId = questions[currentQuestion].id
    setSelectedAnswer(optionId)
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleNext = () => {
    const question = questions[currentQuestion]
    const selectedOptionId = answers[question.id]
    if (!selectedOptionId) return

    const selectedOption = question.options.find(o => o.id === selectedOptionId)

    let nextIndex = -1

    if (selectedOption?.next_question_id) {
      nextIndex = questions.findIndex(q => q.id === selectedOption.next_question_id)
    } else if (currentQuestion < questions.length - 1) {
      nextIndex = currentQuestion + 1
    }

    if (nextIndex !== -1) {
      setQuestionHistory(prev => [...prev, currentQuestion])
      setCurrentQuestion(nextIndex)
      setSelectedAnswer(answers[questions[nextIndex].id] ?? null)
    }
  }

  const handlePrevious = () => {
    if (questionHistory.length === 0) return

    const previousIndex = questionHistory[questionHistory.length - 1]

    setQuestionHistory(prev => prev.slice(0, -1)) // quitar la última
    setCurrentQuestion(previousIndex)
    setSelectedAnswer(answers[questions[previousIndex].id] ?? null)
  }


  const handleSubmit = async () => {
    try {
      const stored = sessionStorage.getItem("surveyAccess")
      if (!stored) return

      const { participationId } = JSON.parse(stored)
      if (!participationId) return

      // Payload para la API
      const answersPayload = Object.entries(answers).map(([questionId, optionId]) => ({
        survey_participation_id: participationId,
        question_id: Number(questionId),
        option_id: optionId,
      }))

      if (answersPayload.length === 0) {
        alert("No hay respuestas para enviar")
        return
      }

      const payload = {
        survey_participation_id: participationId,
        answers: answersPayload,
      }


      // ✅ Enviar las respuestas al backend
      const res = await fetch("/api/submit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Error guardando respuestas:", data)
        alert("Error al guardar respuestas")
        return
      }

      sessionStorage.removeItem("surveyAccess")
      router.push("/gracias")

    } catch (error) {
      console.error(error)
      alert("Error al enviar la encuesta")
    }
  }


  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando preguntas...</p>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isAnswered = selectedAnswer !== null
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>

            {/* <span className="text-lg font-semibold text-gray-700">{formatTime(timeLeft)}</span> */}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          {question.prefix && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-gray-700 font-medium text-md">
                {question.prefix}
              </p>
            </div>
          )}

          <h2 className="text-2xl font-bold text-blue-900 mb-8">
            {question.text}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                className={`p-4 rounded-lg font-semibold transition-all ${selectedAnswer === option.id
                  ? "bg-blue-900 text-white shadow-md scale-105 cursor-pointer"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${currentQuestion === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-400 text-white hover:bg-gray-500 cursor-pointer"
                }`}
            >
              Anterior
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!isAnswered ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  }`}
              >
                Enviar Encuesta
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!isAnswered ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
