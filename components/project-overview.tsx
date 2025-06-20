import type React from "react"

export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6" style={{ fontFamily: "'Lato', 'Lual', Arial, sans-serif", fontWeight: 300 }}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
        </div>
        <h1 className="text-4xl font-light text-gray-800 mb-6 tracking-wide" style={{ fontFamily: "'Lato', 'Lual', Arial, sans-serif", fontWeight: 300 }}>
          Asistente Arquitectónico IA
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8" style={{ fontFamily: "'Lato', 'Lual', Arial, sans-serif", fontWeight: 300 }}>
          Bienvenido al asistente inteligente de <span className="font-medium text-gray-800" style={{ fontFamily: "'Lato', 'Lual', Arial, sans-serif", fontWeight: 300 }}>SAAVE Arquitectos</span>.
          Para que puedas Conocer los Costos del diseño de tu proyecto.y Construccion de tu Vivienda.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500" style={{ fontFamily: "'Lato', 'Lual', Arial, sans-serif", fontWeight: 300 }}>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Diseño Arquitectónico
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Estudios Técnicos
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Construcción
          </span>
        </div>
      </div>
    </div>
  )
}
