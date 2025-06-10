import type React from "react"
import NextLink from "next/link"

export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
        </div>
        <h1 className="text-4xl font-light text-gray-800 mb-6 tracking-wide">Asistente Arquitectónico IA</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Bienvenido al asistente inteligente de <span className="font-medium text-gray-800">SAAVE Arquitectos</span>.
          Estoy aquí para ayudarte con consultas sobre diseño arquitectónico, planificación urbana y nuestros servicios
          profesionales.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Diseño Arquitectónico
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Planificación Urbana
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Consultoría Especializada
          </span>
        </div>
      </div>
    </div>
  )
}

const Link = ({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) => {
  return (
    <NextLink
      target="_blank"
      className="text-gray-700 hover:text-gray-900 transition-colors duration-200 underline decoration-gray-300 hover:decoration-gray-500"
      href={href}
    >
      {children}
    </NextLink>
  )
}
