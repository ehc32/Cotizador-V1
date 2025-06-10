"use client"

import { PDFDownloadButton } from "./pdf-download-button"

interface PDFDownloadWrapperProps {
  cotizacionData: object
}

export function PDFDownloadWrapper({ cotizacionData }: PDFDownloadWrapperProps) {
  if (!cotizacionData) return null

  return (
    <div className="my-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">📄 Cotización Lista</h3>
        <p className="text-blue-700 text-sm mb-3">
          Tu cotización está lista para descargar. Haz clic en el botón de abajo para obtener el PDF.
        </p>
        <PDFDownloadButton cotizacionData={cotizacionData} />
      </div>
    </div>
  )
}
