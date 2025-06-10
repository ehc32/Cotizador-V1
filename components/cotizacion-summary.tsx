"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PDFDownloadButton } from "./pdf-download-button"

interface CotizacionSummaryProps {
  data: any
  showDownload?: boolean
}

export function CotizacionSummary({ data, showDownload = false }: CotizacionSummaryProps) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Resumen de la cotización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumen de Cotización</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              {data.resumen.area_total}m² total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-2">INFORMACIÓN DEL CLIENTE</h4>
              <p className="text-sm">
                <span className="font-medium">¿Tiene lote?:</span> {data.informacion_cliente.tiene_lote}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-2">FECHA</h4>
              <p className="text-sm">{new Date().toLocaleDateString("es-CO")}</p>
            </div>
          </div>

          {/* Desglose de áreas */}
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-3">DESGLOSE DE ÁREAS</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Áreas base incluidas</span>
                <span className="font-medium">{data.resumen.areas_base}m²</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Habitación principal ({data.resumen.habitacion_principal.tipo_cama})</span>
                <span className="font-medium">{data.resumen.habitacion_principal.area}m²</span>
              </div>

              {data.resumen.habitaciones_adicionales.cantidad > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">
                    Habitaciones adicionales ({data.resumen.habitaciones_adicionales.cantidad})
                  </span>
                  <span className="font-medium">{data.resumen.habitaciones_adicionales.area_total}m²</span>
                </div>
              )}

              {data.resumen.espacios_adicionales.cantidad > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Espacios adicionales ({data.resumen.espacios_adicionales.cantidad})</span>
                  <span className="font-medium">{data.resumen.espacios_adicionales.area_total}m²</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-md">
                <span className="font-semibold">ÁREA TOTAL</span>
                <span className="font-bold text-blue-600">{data.resumen.area_total}m²</span>
              </div>
            </div>
          </div>

          {/* Cotización */}
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-3">COTIZACIÓN</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Diseño Arquitectónico</span>
                <span className="font-medium">{data.cotizacion.diseno}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Construcción</span>
                <span className="font-medium">{data.cotizacion.construccion}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded-md border-2 border-green-200">
                <span className="font-bold text-lg">TOTAL PROYECTO</span>
                <span className="font-bold text-xl text-green-600">{data.cotizacion.total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de descarga */}
      {showDownload && <PDFDownloadButton cotizacionData={data} />}
    </div>
  )
}
