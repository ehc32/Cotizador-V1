import { type NextRequest, NextResponse } from "next/server"
import { generatePDF } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO GENERACIÓN PDF ===")

    // Obtener datos del request
    const cotizacionData = await request.json()
    console.log("Datos recibidos:", {
      tiene_informacion_cliente: !!cotizacionData.informacion_cliente,
      tiene_resumen: !!cotizacionData.resumen,
      tiene_cotizacion: !!cotizacionData.cotizacion,
      area_total: cotizacionData.resumen?.area_total,
    })

    // Validar que los datos requeridos estén presentes
    if (!cotizacionData) {
      console.error("No se recibieron datos de cotización")
      return NextResponse.json({ error: "No se recibieron datos de cotización" }, { status: 400 })
    }

    if (!cotizacionData.resumen) {
      console.error("Faltan datos del resumen")
      return NextResponse.json({ error: "Faltan datos del resumen en la cotización" }, { status: 400 })
    }

    if (!cotizacionData.cotizacion) {
      console.error("Faltan datos de cotización")
      return NextResponse.json({ error: "Faltan datos de cotización" }, { status: 400 })
    }

    if (!cotizacionData.informacion_cliente) {
      console.error("Falta información del cliente")
      return NextResponse.json({ error: "Falta información del cliente" }, { status: 400 })
    }

    // Validar estructura de datos críticos
    if (typeof cotizacionData.resumen.area_total !== "number" || cotizacionData.resumen.area_total <= 0) {
      console.error("Área total inválida:", cotizacionData.resumen.area_total)
      return NextResponse.json({ error: "Área total inválida" }, { status: 400 })
    }

    console.log("Validación exitosa, generando PDF...")

    // Generar el PDF
    const pdfBuffer = await generatePDF(cotizacionData)

    console.log("PDF generado exitosamente, tamaño:", pdfBuffer.length, "bytes")

    // Crear nombre de archivo con fecha
    const fechaActual = new Date().toISOString().split("T")[0]
    const nombreArchivo = `cotizacion-saave-${fechaActual}.pdf`

    console.log("Enviando respuesta con archivo:", nombreArchivo)

    // Retornar el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Content-Length": pdfBuffer.length.toString(),
        // Headers CORS si es necesario
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
        // Cache control
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("=== ERROR EN GENERACIÓN PDF ===")
    console.error("Error completo:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    // Determinar tipo de error para respuesta más específica
    let errorMessage = "Error interno del servidor al generar PDF"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes("jsPDF") || error.message.includes("autoTable")) {
        errorMessage = "Error en la librería de generación de PDF"
      } else if (error.message.includes("datos") || error.message.includes("inválido")) {
        errorMessage = "Datos de cotización inválidos"
        statusCode = 400
      } else if (error.message.includes("memoria") || error.message.includes("memory")) {
        errorMessage = "Error de memoria al generar PDF"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}

// Manejar OPTIONS para CORS si es necesario
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
