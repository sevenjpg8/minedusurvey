"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

const QUESTIONS = [
  {
    id: 1,
    text: "En mi colegio los y las estudiantes nos llevamos bien",
    options: ["Muy en desacuerdo", "En desacuerdo", "De acuerdo", "Muy de acuerdo"],
  },
  {
    id: 2,
    text: "Los profesores y profesoras me tratan con respeto",
    options: ["Muy en desacuerdo", "En desacuerdo", "De acuerdo", "Muy de acuerdo"],
  },
  {
    id: 3,
    text: "Me siento seguro(a) en mi colegio",
    options: ["Muy en desacuerdo", "En desacuerdo", "De acuerdo", "Muy de acuerdo"],
  },
  {
    id: 4,
    text: "Las clases son interesantes y me ayudan a aprender",
    options: ["Muy en desacuerdo", "En desacuerdo", "De acuerdo", "Muy de acuerdo"],
  },
  {
    id: 5,
    text: "Tengo oportunidades para participar en actividades escolares",
    options: ["Muy en desacuerdo", "En desacuerdo", "De acuerdo", "Muy de acuerdo"],
  },
]

export default function SurveyPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTIONS.length).fill(null))
  const [timeLeft, setTimeLeft] = useState(300)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      }
    }, 500)
  }

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1])
    }
  }

  const handleSubmit = () => {
    console.log("Survey completed with answers:", answers)
    router.push("/gracias")
  }

  const question = QUESTIONS[currentQuestion]
  const isAnswered = selectedAnswer !== null
  const progressPercentage = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Pregunta {currentQuestion + 1} de {QUESTIONS.length}
              </span>
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-lg font-semibold text-gray-700">{formatTime(timeLeft)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          {/* Instructions (only on first question) */}
          {currentQuestion === 0 && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-gray-700 text-sm leading-relaxed">
                A continuación, vas a encontrar algunos enunciados acerca de tu colegio, tus compañeros(as) y
                profesores(as). Lee cada enunciado con atención y marca con un aspa (X) en el cuadro correspondiente qué
                tan de acuerdo o en desacuerdo te encuentras con cada enunciado según tu experiencia. Solo puedes marcar
                una respuesta por enunciado.
              </p>
            </div>
          )}

          {/* Question */}
          <h2 className="text-2xl font-bold text-blue-900 mb-8">
            {currentQuestion + 1}. {question.text}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`p-4 rounded-lg font-semibold transition-all ${
                  selectedAnswer === index
                    ? "bg-blue-900 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentQuestion === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-400 text-white hover:bg-gray-500"
              }`}
            >
              Anterior
            </button>

            {currentQuestion === QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !isAnswered
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Enviar Encuesta
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !isAnswered
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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
