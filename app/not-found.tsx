"use client"

import Link from "next/link"
import Header from "@/components/header"

export default function NotFoundPage() {
  return (
    <>
      <Header />

      {/* Main content area - centered below header */}
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-2xl w-full text-center space-y-8 px-4">
          {/* Illustration Container */}
          <div className="relative h-64 mb-12 flex items-center justify-center">
            {/* Background decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Browser windows illustration */}
              <svg
                className="w-full h-full max-w-sm opacity-100"
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Back window */}
                <g opacity="0.4">
                  <rect
                    x="80"
                    y="100"
                    width="140"
                    height="120"
                    rx="8"
                    fill="#e5e7eb"
                    stroke="#d1d5db"
                    strokeWidth="2"
                  />
                  <rect x="80" y="100" width="140" height="24" rx="8" fill="#d1d5db" />
                  <circle cx="92" cy="112" r="2" fill="#9ca3af" />
                  <circle cx="104" cy="112" r="2" fill="#9ca3af" />
                  <circle cx="116" cy="112" r="2" fill="#9ca3af" />
                </g>

                {/* Front window - larger */}
                <rect x="120" y="60" width="200" height="180" rx="10" fill="white" stroke="#9ca3af" strokeWidth="2" />
                <rect x="120" y="60" width="200" height="32" rx="10" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />

                {/* Window controls */}
                <circle cx="140" cy="76" r="3" fill="#ef4444" />
                <circle cx="154" cy="76" r="3" fill="#f59e0b" />
                <circle cx="168" cy="76" r="3" fill="#10b981" />

                {/* Window content area - 404 text */}
                <text
                  x="220"
                  y="150"
                  fontSize="60"
                  fontWeight="bold"
                  fill="#1f2937"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  404
                </text>

                {/* Gears */}
                <g opacity="0.6">
                  {/* Gear 1 - top right */}
                  <circle cx="340" cy="70" r="12" fill="none" stroke="#d1d5db" strokeWidth="2" />
                  <circle cx="340" cy="70" r="8" fill="none" stroke="#d1d5db" strokeWidth="1" />
                  <circle cx="340" cy="70" r="3" fill="#d1d5db" />

                  {/* Gear 2 - left */}
                  <circle cx="100" cy="160" r="10" fill="none" stroke="#dc2626" strokeWidth="2" />
                  <circle cx="100" cy="160" r="6" fill="none" stroke="#dc2626" strokeWidth="1" />
                  <circle cx="100" cy="160" r="2.5" fill="#dc2626" />

                  {/* Gear 3 - top left */}
                  <circle cx="140" cy="50" r="8" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                  <circle cx="140" cy="50" r="4" fill="none" stroke="#dc2626" strokeWidth="0.5" />
                  <circle cx="140" cy="50" r="2" fill="#dc2626" />

                  {/* Gear 4 - right */}
                  <circle cx="360" cy="140" r="9" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
                  <circle cx="360" cy="140" r="5" fill="none" stroke="#d1d5db" strokeWidth="0.5" />

                  {/* Gear 5 - bottom right */}
                  <circle cx="320" cy="220" r="7" fill="none" stroke="#d1d5db" strokeWidth="1" />
                </g>
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Lo sentimos. La página que buscas no existe.
            </h1>

            <p className="text-lg text-gray-600">
              Puede que hayas escrito mal la dirección, que la hayan cambiado o eliminado.
            </p>

            {/* Back to Home Link */}
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <span>←</span>
                <span>Regresar al Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
