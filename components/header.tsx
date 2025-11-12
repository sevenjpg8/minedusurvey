export default function Header() {
  return (
    <header className="text-white py-4 px-6" style={{ backgroundColor: "rgb(0, 51, 102)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-minedu.webp" alt="Ministerio de Educación del Perú" className="h-12 w-auto" />
          <span className="text-lg font-semibold">Ministerio de Educación</span>
        </div>
        <h1 className="text-xl font-bold">Encuesta Nacional</h1>
      </div>
    </header>
  )
}
