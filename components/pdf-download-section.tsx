"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2, CheckCircle } from "lucide-react"

interface PDFDownloadSectionProps {
  cotizacionData: object
}

export function PDFDownloadSection({ cotizacionData }: PDFDownloadSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDownload = async () => {
    if (!cotizacionData) {
      setError("No hay datos de cotización disponibles")
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error HTTP: ${response.status}`)
      }

      // Crear blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotizacion-saave-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000) // Reset success state after 3 seconds
    } catch (error) {
      console.error("Error descargando PDF:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al generar PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 my-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tu Cotización PDF</h3>
          <p className="text-sm text-gray-600">Descarga el documento completo con todos los detalles</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          disabled={isGenerating || !cotizacionData}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generando PDF...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              ¡Descargado!
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Descargar Cotización PDF
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Cerrar
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          📄 El PDF incluye: resumen completo, desglose de áreas, precios detallados y especificaciones técnicas
        </div>
      </div>
    </div>
  )
}
