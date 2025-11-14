"use client"

import { useState } from "react"

export default function Video() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="mb-8 rounded-lg overflow-hidden relative w-full h-[400px]">
      {!isPlaying ? (
        <div
          className="w-full h-full bg-cover bg-center cursor-pointer"
          style={{  backgroundImage: "url('https://img.youtube.com/vi/383tSNv-FcU/hqdefault.jpg')" }}
          onClick={() => setIsPlaying(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold">
              ▶ Reproducir Video
            </button>
          </div>
        </div>
      ) : (
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/383tSNv-FcU?autoplay=1"
          title="Descubre el secreto mejor guardado del Minedu"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full"
        ></iframe>
      )}
    </div>
  )
}
