"use client"
import SurveyForm from "@/components/survey-form"
import Header from "@/components/header"

export default function IdentificacionPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4">
        <SurveyForm />
      </div>
    </main>
  )
}
