"use client"

import { defaultModel, type modelID } from "@/ai/providers"
import { useChat } from "ai/react"
import { useState, useRef, useCallback } from "react"
import { Textarea } from "./textarea"
import { ProjectOverview } from "./project-overview"
import { Messages } from "./messages"
import { Header } from "./header"
import { toast } from "sonner"

// Tipos específicos para los datos de cotización
interface CotizacionData {
  cotizacion?: {
    diseno?: string
    construccion?: string
    total?: string
  }
  resumen?: {
    area_total?: number
    habitacion_principal?: {
      tipo_cama?: string
      area?: number
    }
    habitaciones_adicionales?: {
      cantidad?: number
    }
    espacios_adicionales?: {
      cantidad?: number
    }
  }
  informacion_cliente?: {
    nombre?: string
    correo?: string
    telefono?: string
    fecha?: string
  }
}

interface PDFData {
  Diseño_Ar: string
  Diseño_Calcu: string
  Acompañamie: string
  Subtotal_1: string
  Diseño_Calculo: string
  Diseño_Sanitario: string
  Presupuesta: string
  Subtotal_2: string
  Total: string
  texto: string
  area_total: number
  habitacion_principal: string
  habitaciones_adicionales: number
  espacios_adicionales: number
  nombre?: string
  correo?: string
  telefono?: string
  fecha?: string
}

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel)
  const [isDownloading, setIsDownloading] = useState(false)
  const downloadInProgress = useRef(false)
  const lastProcessedMessage = useRef<string | null>(null)

  const handlePDFDownload = useCallback(
    async (cotizacionData: CotizacionData) => {
      // Doble verificación para evitar ejecuciones múltiples
      if (downloadInProgress.current || isDownloading) {
        console.log("Descarga ya en progreso, saltando...")
        return
      }

      downloadInProgress.current = true
      setIsDownloading(true)

      toast.info("Preparando descarga del documento...", { position: "top-center" })

      try {
        console.log("Iniciando descarga con datos:", cotizacionData)

        // Preparar datos para el servicio de PDF
        const pdfData: PDFData = {
          Diseño_Ar: cotizacionData.cotizacion?.diseno || "$ 0",
          Diseño_Calcu: "$ 23.918.292",
          Acompañamie: "$ 1.516.141",
          Subtotal_1: "",
          Diseño_Calculo: "$ 23.918.292",
          Diseño_Sanitario: "$ 20.501.393",
          Presupuesta: cotizacionData.cotizacion?.construccion || "$ 0",
          Subtotal_2: "",
          Total: cotizacionData.cotizacion?.total || "$ 0",
          texto: `${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).replace(/de /, ' de ')}\n\nSeñor(a)\n${cotizacionData.informacion_cliente?.nombre || ""}\n${cotizacionData.informacion_cliente?.correo || ""}\n\nCotización para proyecto de ${cotizacionData.resumen?.area_total || 0}m²`,
          area_total: cotizacionData.resumen?.area_total || 0,
          habitacion_principal: cotizacionData.resumen?.habitacion_principal?.tipo_cama || "",
          habitaciones_adicionales: cotizacionData.resumen?.habitaciones_adicionales?.cantidad || 0,
          espacios_adicionales: cotizacionData.resumen?.espacios_adicionales?.cantidad || 0,
          nombre: cotizacionData.informacion_cliente?.nombre || "",
          correo: cotizacionData.informacion_cliente?.correo || "",
          telefono: cotizacionData.informacion_cliente?.telefono || "",
          fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
          
        }

        // Llamar al servicio de generación de PDF
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const response = await fetch("https://cotizador-scrips-i48a.onrender.com/generar-word", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pdfData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
        }

        // Descargar el archivo
        const blob = await response.blob()

        if (blob.size === 0) {
          throw new Error("El archivo generado está vacío")
        }

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `cotizacion_saave_${Date.now()}.docx`

        document.body.appendChild(a)
        a.click()

        // Limpiar después de un delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }, 1000)

        toast.success("¡Documento descargado exitosamente!", { position: "top-center" })
      } catch (error) {
        console.error("Error descargando PDF:", error)

        let errorMessage = "Hubo un error al descargar el documento."

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "La descarga tardó demasiado. Por favor intenta nuevamente."
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "No se pudo conectar al servidor. Verifica que esté ejecutándose en el puerto 3001."
          } else {
            errorMessage = `Error: ${error.message}`
          }
        }

        toast.error(errorMessage, { position: "top-center" })
      } finally {
        setIsDownloading(false)
        downloadInProgress.current = false
      }
    },
    [isDownloading],
  )

  const { messages, input, handleInputChange, handleSubmit, status, stop } = useChat({
    maxSteps: 5,
    body: {
      selectedModel,
    },
    onError: (error) => {
      toast.error(error.message.length > 0 ? error.message : "An error occured, please try again later.", {
        position: "top-center",
        richColors: true,
      })
    },
    onFinish: (message) => {
      console.log("onFinish ejecutado para mensaje:", message.id)

      // Evitar procesar el mismo mensaje múltiples veces
      if (lastProcessedMessage.current === message.id) {
        console.log("Mensaje ya procesado, saltando...")
        return
      }

      // Verificar si hay herramientas de descarga con verificación de estado
      const hasDownloadTool = message.toolInvocations?.some((tool) => {
        return (
          tool.toolName === "descargarPDF" &&
          "result" in tool &&
          tool.result &&
          typeof tool.result === "object" &&
          "descargar_pdf" in tool.result &&
          tool.result.descargar_pdf === true
        )
      })

      if (!hasDownloadTool) {
        return
      }

      lastProcessedMessage.current = message.id

      // Buscar datos de cotización en todos los mensajes
      let cotizacionData: CotizacionData | null = null

      // Buscar en el mensaje actual primero
      if (message.toolInvocations) {
        for (const tool of message.toolInvocations) {
          if (
            tool.toolName === "descargarPDF" &&
            "result" in tool &&
            tool.result &&
            typeof tool.result === "object" &&
            "datos_cotizacion" in tool.result
          ) {
            cotizacionData = tool.result.datos_cotizacion as CotizacionData
            break
          }
        }
      }

      // Si no se encontró, buscar en mensajes anteriores
      if (!cotizacionData) {
        for (const msg of messages) {
          if (msg.toolInvocations) {
            for (const tool of msg.toolInvocations) {
              if (
                tool.toolName === "calcularCotizacion" &&
                "result" in tool &&
                tool.result &&
                typeof tool.result === "object"
              ) {
                cotizacionData = tool.result as CotizacionData
                break
              }
            }
          }
          if (cotizacionData) break
        }
      }

      if (cotizacionData) {
        console.log("Datos de cotización encontrados, iniciando descarga...")
        // Usar setTimeout para asegurar que el estado se actualice
        setTimeout(() => {
          handlePDFDownload(cotizacionData!)
        }, 100)
      } else {
        console.error("No se encontraron datos de cotización")
        toast.error("No se encontraron datos de cotización para descargar", { position: "top-center" })
      }
    },
  })

  const isLoading = status === "streaming" || status === "submitted" || isDownloading

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header />
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <form onSubmit={handleSubmit} className="pb-8 bg-white dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0">
        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </form>
      {isDownloading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generando documento...</span>
          </div>
        </div>
      )}
    </div>
  )
}
