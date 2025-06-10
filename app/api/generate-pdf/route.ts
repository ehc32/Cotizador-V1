import { type NextRequest, NextResponse } from "next/server"
import { generatePDFSimple } from "@/lib/generate-pdf-simple"
import { generatePDF } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const cotizacionData = await request.json()

    // Validar que los datos requeridos estén presentes
    if (!cotizacionData || !cotizacionData.resumen || !cotizacionData.cotizacion) {
      return NextResponse.json({ error: "Datos de cotización incompletos" }, { status: 400 })
    }

    let pdfBuffer: Buffer

    try {
      // Intentar generar PDF con autoTable
      pdfBuffer = await generatePDF(cotizacionData)
    } catch (autoTableError) {
      console.warn("Error con autoTable, usando versión simple:", autoTableError)
      // Fallback a versión simple sin autoTable
      pdfBuffer = await generatePDFSimple(cotizacionData)
    }

    // Retornar el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cotizacion-saave-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generando PDF:", error)

    return NextResponse.json(
      {
        error: "Error interno del servidor al generar PDF",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
