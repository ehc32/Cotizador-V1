"use client"
import { PDFDownloadSection } from "./pdf-download-section"

// En tu componente de chat donde manejas las respuestas del AI
export function ChatHandler({ messages }: { messages: any[] }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        // Si el mensaje contiene datos de cotización y debe mostrar PDF
        if (message.toolInvocations) {
          const pdfTool = message.toolInvocations.find((tool: any) => tool.toolName === "descargarPDF")

          if (pdfTool && pdfTool.result?.mostrar_pdf) {
            return (
              <div key={index} className="space-y-4">
                {/* Mensaje del asistente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>{pdfTool.result.mensaje}</p>
                </div>

                {/* Componente de descarga PDF */}
                <PDFDownloadSection cotizacionData={pdfTool.result.datos} />
              </div>
            )
          }
        }

        // Renderizado normal de mensajes
        return (
          <div key={index} className="message">
            {message.content}
          </div>
        )
      })}
    </div>
  )
}
