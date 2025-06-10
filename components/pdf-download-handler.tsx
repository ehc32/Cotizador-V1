"use client"

import { useEffect } from "react"

interface PDFDownloadHandlerProps {
  shouldDownload: boolean
  cotizacionData: object
  onDownloadComplete: () => void
}

export function PDFDownloadHandler({ shouldDownload, cotizacionData, onDownloadComplete }: PDFDownloadHandlerProps) {
  useEffect(() => {
    if (!shouldDownload || !cotizacionData) return

    const downloadPDF = async () => {
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

        onDownloadComplete()
      } catch (error) {
        console.error("Error descargando PDF:", error)
        alert(
          `Error descargando el PDF: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor intenta nuevamente.`,
        )
        onDownloadComplete()
      }
    }

    downloadPDF()
  }, [shouldDownload, cotizacionData, onDownloadComplete])

  return null
}
