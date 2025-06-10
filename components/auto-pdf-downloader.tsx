"use client"

import { useEffect, useState } from "react"

interface AutoPDFDownloaderProps {
  cotizacionData: object
}

export function AutoPDFDownloader({ cotizacionData }: AutoPDFDownloaderProps) {
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cotizacionData) return

    const downloadPDF = async () => {
      try {
        setStatus("downloading")
        setError(null)

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

        setStatus("success")
      } catch (error) {
        console.error("Error descargando PDF:", error)
        setError(error instanceof Error ? error.message : "Error desconocido al generar PDF")
        setStatus("error")
      }
    }

    downloadPDF()
  }, [cotizacionData])

  return (
    <div className="pdf-status">
      {status === "downloading" && (
        <div className="text-blue-600">
          <p>Generando PDF, espera un momento...</p>
        </div>
      )}
      {status === "success" && (
        <div className="text-green-600">
          <p>¡PDF descargado exitosamente! Revisa tu carpeta de descargas.</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-red-600">
          <p>Error al descargar el PDF: {error}</p>
          <button
            onClick={() => {
              setStatus("idle")
              setTimeout(() => {
                if (cotizacionData) {
                  setStatus("downloading")
                  // Intentar descargar nuevamente
                  fetch("/api/generate-pdf", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(cotizacionData),
                  })
                    .then((response) => {
                      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
                      return response.blob()
                    })
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `cotizacion-saave-${new Date().toISOString().split("T")[0]}.pdf`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      window.URL.revokeObjectURL(url)
                      setStatus("success")
                    })
                    .catch((error) => {
                      console.error("Error en reintento:", error)
                      setError(error instanceof Error ? error.message : "Error desconocido")
                      setStatus("error")
                    })
                }
              }, 500)
            }}
            className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded text-sm mt-2"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
