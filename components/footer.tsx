export default function Footer() {
  return (
    <footer className="bg-[rgb(31,41,55)] text-gray-300 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Ministry Section */}
          <div>
            <h3 className="text-white font-bold mb-4">MINISTERIO DE EDUCACIÓN</h3>
            <p className="text-sm text-gray-300 mb-2">Dirección: Calle Del Comercio 193, San Borja</p>
            <p className="text-sm text-gray-300 mb-2">Lima 41, Perú</p>
            <p className="text-sm text-gray-300">Central Telefónica: (01) 615-5800</p>
          </div>

          {/* About Application */}
          <div>
            <h3 className="text-white font-bold mb-4">SOBRE EL APLICATIVO</h3>
            <p className="text-sm text-gray-300 mb-2">Nombre: Plataforma de Encuesta Nacional</p>
            <p className="text-sm text-gray-300">Versión: 1.0.0 (Build 20251029)</p>
          </div>

          {/* Links of Interest */}
          <div>
            <h3 className="text-white font-bold mb-4">ENLACES DE INTERÉS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Portal MINEDU
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Portal de Transparencia
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 pt-6">
          {/* Copyright */}
          <p className="text-center text-xs text-gray-400">
            © 2025 Ministerio de Educación del Perú. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
