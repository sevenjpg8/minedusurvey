"use client"

export default function Header() {
  return (
    <header
      className="text-white py-4 px-4 sm:px-6"
      style={{ backgroundColor: "rgb(0, 51, 102)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 sm:gap-0">
        {/* 🔹 Logo y texto del ministerio */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <img
            src="/logo-minedu.webp"
            alt="Ministerio de Educación del Perú"
            className="h-12 w-auto"
          />
          <span className="text-base sm:text-lg font-semibold leading-tight">
            Ministerio de Educación
          </span>
        </div>

        {/* 🔹 Título */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-2 sm:mt-0">
          Encuesta Nacional
        </h1>
      </div>
    </header>
  )
}
