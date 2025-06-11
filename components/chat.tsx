"use client"

import { defaultModel, type modelID } from "@/ai/providers"
import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { Textarea } from "./textarea"
import { ProjectOverview } from "./project-overview"
import { Messages } from "./messages"
import { Header } from "./header"
import { PDFDownloadHandler } from "./pdf-download-handler"
import { toast } from "sonner"

// Definir interfaces para los tipos de datos
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

// Define proper types for tool invocations
interface ToolInvocationResult {
  mensaje?: string
  descargar_pdf?: boolean
  datos_cotizacion?: CotizacionData
  [key: string]: unknown
}

interface ToolInvocation {
  toolName: string
  toolInput: Record<string, unknown>
  result?: ToolInvocationResult
}

// Extend the message type to include toolInvocations
interface MessageWithTools {
  id: string
  role: string
  toolInvocations?: ToolInvocation[]
}

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel)
  const [shouldDownloadPDF, setShouldDownloadPDF] = useState(false)
  const [pdfData, setPdfData] = useState<CotizacionData | null>(null)

  // Usar una referencia para rastrear el último ID de mensaje procesado
  const lastProcessedMessageId = useRef<string | null>(null)

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
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Detectar cuando se debe descargar PDF
  useEffect(() => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1] as MessageWithTools

    // Evitar procesar el mismo mensaje más de una vez
    if (lastMessage.id === lastProcessedMessageId.current) return

    if (lastMessage?.role === "assistant" && lastMessage.toolInvocations) {
      // Use proper typing instead of any
      const pdfTool = lastMessage.toolInvocations.find(
        (tool: ToolInvocation) =>
          tool.toolName === "descargarPDF" &&
          tool.result?.descargar_pdf === true
      );

      if (
        pdfTool &&
        pdfTool.result &&
        pdfTool.result.descargar_pdf &&
        pdfTool.result.datos_cotizacion
      ) {
        console.log("Activando descarga de PDF para mensaje:", lastMessage.id);
        setPdfData(pdfTool.result.datos_cotizacion);
        setShouldDownloadPDF(true);
        // Marcar este mensaje como procesado
        lastProcessedMessageId.current = lastMessage.id;
      }
    }
  }, [messages])

  const handleDownloadComplete = () => {
    console.log("Descarga completada, reseteando estado")
    setShouldDownloadPDF(false)
    setPdfData(null)
    toast.success("¡PDF descargado exitosamente!", {
      position: "top-center",
      richColors: true,
    })
  }

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
      <form onSubmit={handleSubmit} className="pb-8 bg-[#f9fafb] dark:bg-black w-full max-w-xl mx-auto px-4 sm:px-0">
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

      {/* Handler para descarga de PDF */}
      <PDFDownloadHandler
        shouldDownload={shouldDownloadPDF}
        cotizacionData={pdfData}
        onDownloadComplete={handleDownloadComplete}
      />
    </div>
  )
}