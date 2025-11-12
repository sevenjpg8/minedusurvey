import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Footer from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Encuesta Nacional - Ministerio de Educación",
  description: "Participa en la Encuesta Nacional de Estudiantes del Ministerio de Educación del Perú.",
  generator: "Ministerio de Educación",
  icons: {
    icon: [{ url: "/favicon2.ico", sizes: "32x32" }],
    apple: { url: "/favicon2.ico", sizes: "180x180" },
  },
  applicationName: "Encuesta Nacional",
  keywords: ["Encuesta Nacional", "Ministerio de Educación", "Estudiantes", "Educación Perú", "Minedu"],
  authors: [{ name: "Ministerio de Educación", url: "https://minedu.creainter.com.pe" }],
  creator: "Ministerio de Educación",
  publisher: "Ministerio de Educación",

  openGraph: {
    title: "Encuesta Nacional - Ministerio de Educación",
    description: "Participa en la Encuesta Nacional de Estudiantes del Perú y aporta a la mejora educativa.",
    url: "https://minedu.creainter.com.pe",
    siteName: "Encuesta Nacional - Minedu",
    images: [
      {
        url: "https://minedu.creainter.com.pe/og-image.webp", // 👈 crea una imagen 1200x630 para compartir
        width: 1200,
        height: 630,
        alt: "Encuesta Nacional - Ministerio de Educación",
      },
    ],
    locale: "es_PE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Encuesta Nacional - Ministerio de Educación",
    description: "Contribuye al desarrollo educativo participando en la Encuesta Nacional de Estudiantes.",
    images: ["https://minedu.creainter.com.pe/og-image.webp"],
    creator: "@MineduPeru", // si tienes cuenta oficial
  },

  metadataBase: new URL("https://minedu.creainter.com.pe"),
  alternates: {
    canonical: "https://minedu.creainter.com.pe",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
