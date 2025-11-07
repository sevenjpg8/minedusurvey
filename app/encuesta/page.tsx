"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient" // tu cliente Supabase
import Header from "@/components/header"
import { getQuestions, Question as QuestionType } from "@/lib/getQuestions"

interface Question {
  id: number
  text: string
  options: { id: number; text: string; next_question_id?: number | null }[] // 👈 agregado
  prefix?: string | null
  type?: string
  survey_id?: number
  dimension_id?: number
  order?: number
}


export default function SurveyPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const access = sessionStorage.getItem("surveyAccess")
    if (!access) return

    const { surveyId } = JSON.parse(access)

    const loadQuestions = async () => {
      try {
        const data = await getQuestions(surveyId)
        setQuestions(data)
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
    if (selectedOption?.next_question_id) {
      const nextIndex = questions.findIndex(q => q.id === selectedOption.next_question_id)
      if (nextIndex !== -1) {
        setCurrentQuestion(nextIndex)
        setSelectedAnswer(answers[questions[nextIndex].id] ?? null)
        return
      }
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[questions[currentQuestion + 1].id] ?? null)
    }
  }


  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] ?? null)
    }
  }

  const handleSubmit = async () => {
    try {
      const stored = sessionStorage.getItem("surveyAccess")
      console.log("🟦 Revisando sessionStorage...")
      if (!stored) return

      let parsed
      try {
        parsed = JSON.parse(stored)
      } catch (err) {
        console.error("❌ Error parseando surveyAccess:", err, stored)
        return
      }

      const { participationId } = parsed
      if (!participationId) return

      // ✅ Recorremos las respuestas efectivas
      const answersPayload = Object.entries(answers).map(([questionId, optionId]) => ({
        survey_participation_id: participationId,
        question_id: Number(questionId),
        option_id: optionId,
      }))

      if (answersPayload.length === 0) {
        alert("No hay respuestas para enviar")
        return
      }

      //console.log("📤 Respuestas a enviar:", answersPayload)
      //console.log(`🔢 Total de respuestas: ${answersPayload.length}`)
      //console.log(`🟩 Enviando ${answersPayload.length} respuestas en un solo INSERT...`)

      const { error } = await supabase
        .from("answers")
        .insert(answersPayload)

      if (error) throw error
      
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
                Pregunta {currentQuestion + 1} de {questions.length}
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
              <p className="text-gray-700 font-medium">
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
