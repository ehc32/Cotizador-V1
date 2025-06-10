"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PDFDownloadButtonProps {
  cotizacionData: any
  className?: string
}

export function PDFDownloadButton({ cotizacionData, className }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!cotizacionData) {
      setError("No hay datos de cotización disponibles")
      return
    }

    setIsGenerating(true)
    setError(null)

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
    } catch (error) {
      console.error("Error descargando PDF:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al generar PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Cotización Lista</h3>
              <p className="text-sm text-gray-600">Tu cotización está lista para descargar</p>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={isGenerating || !cotizacionData}
            className="w-full max-w-xs"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </>
            )}
          </Button>

          {error && (
            <div className="w-full max-w-xs">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2 w-full">
                  Intentar de nuevo
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center max-w-xs">
            El PDF incluye todos los detalles de tu cotización: áreas, precios y especificaciones técnicas.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
