"use client"

import { PDFDownloadSection } from "./pdf-download-section"

interface ChatMessageWithPDFProps {
  message: string
  cotizacionData?: any
  showPDFDownload?: boolean
}

export function ChatMessageWithPDF({ message, cotizacionData, showPDFDownload = false }: ChatMessageWithPDFProps) {
  return (
    <div className="space-y-4">
      {/* Mensaje del chat */}
      <div className="prose prose-sm max-w-none">
        <p>{message}</p>
      </div>

      {/* Sección de descarga PDF */}
      {showPDFDownload && cotizacionData && <PDFDownloadSection cotizacionData={cotizacionData} />}
    </div>
  )
}
