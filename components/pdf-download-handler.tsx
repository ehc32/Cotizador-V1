"use client"

import { useEffect, useRef } from "react"

// Definir una interfaz para los datos de cotización
interface CotizacionData {
  informacion_cliente: {
    tiene_lote: string
  }
  resumen: {
    area_total: number
    areas_base: number
    habitacion_principal: {
      tipo_cama: string
      area: number
    }
    habitaciones_adicionales: {
      cantidad: number
      area_total: number
      detalle: Array<{
        numero: number
        tipo_cama: string
        area_cama: number
        tiene_bano: boolean
        area_bano: number
        area_total: number
      }>
    }
    espacios_adicionales: {
      cantidad: number
      area_total: number
      detalle: Array<{
        nombre: string
        area: number
      }>
    }
  }
  cotizacion: {
    diseno: string
    construccion: string
    total: string
  }
  precios_m2: {
    diseno: string
    construccion: string
  }
  desglose_detallado: Record<string, string>
}

interface PDFDownloadHandlerProps {
  shouldDownload: boolean
  cotizacionData: CotizacionData | null
  onDownloadComplete: () => void
}

export function PDFDownloadHandler({ shouldDownload, cotizacionData, onDownloadComplete }: PDFDownloadHandlerProps) {
  // Usar una referencia para rastrear si ya se inició la descarga
  const downloadInitiated = useRef(false)

  useEffect(() => {
    // Solo proceder si shouldDownload es true, hay datos y NO se ha iniciado la descarga
    if (!shouldDownload || !cotizacionData || downloadInitiated.current) return

    const downloadPDF = async () => {
      try {
        // Marcar que la descarga ya se inició para evitar múltiples solicitudes
        downloadInitiated.current = true
        console.log("Iniciando descarga de PDF (una sola vez)...")

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

        console.log("PDF descargado exitosamente")
      } catch (error) {
        console.error("Error descargando PDF:", error)
        alert(
          `Error descargando el PDF: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor intenta nuevamente.`,
        )
      } finally {
        // Siempre notificar que la descarga se completó, independientemente del resultado
        onDownloadComplete()
        // Resetear el estado para permitir futuros intentos si es necesario
        setTimeout(() => {
          downloadInitiated.current = false
        }, 2000)
      }
    }

    downloadPDF()
  }, [shouldDownload, cotizacionData, onDownloadComplete])

  return null
}
