import jsPDF from "jspdf"

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

export async function generatePDFSimple(data: CotizacionData): Promise<Buffer> {
  try {
    const doc = new jsPDF()

    // Configuración de colores
    const primaryColor = [41, 128, 185] as const
    const secondaryColor = [52, 73, 94] as const
    const accentColor = [231, 76, 60] as const

    let yPosition = 20

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 30, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("SAAVE ARQUITECTOS", 20, 20)

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Cotización de Construcción", 20, 27)

    yPosition = 50

    // Información del cliente
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DEL CLIENTE", 20, yPosition)

    yPosition += 15
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`¿Tiene lote?: ${data.informacion_cliente.tiene_lote}`, 20, yPosition)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CO")}`, 120, yPosition)

    yPosition += 25

    // Resumen del proyecto
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RESUMEN DEL PROYECTO", 20, yPosition)

    yPosition += 20

    // Áreas (sin tabla, solo texto)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    doc.text(`Áreas base incluidas: ${data.resumen.areas_base}m²`, 20, yPosition)
    yPosition += 8
    doc.text("(Cocina, sala, comedor, ropas, baño social)", 25, yPosition)
    yPosition += 15

    doc.text(
      `Habitación principal: ${data.resumen.habitacion_principal.area}m² (${data.resumen.habitacion_principal.tipo_cama})`,
      20,
      yPosition,
    )
    yPosition += 15

    // Habitaciones adicionales
    if (data.resumen.habitaciones_adicionales.cantidad > 0) {
      doc.text("Habitaciones adicionales:", 20, yPosition)
      yPosition += 10
      data.resumen.habitaciones_adicionales.detalle.forEach((hab) => {
        doc.text(
          `• Habitación ${hab.numero}: ${hab.area_total}m² (${hab.tipo_cama}${hab.tiene_bano ? " + baño" : ""})`,
          25,
          yPosition,
        )
        yPosition += 8
      })
      yPosition += 10
    }

    // Espacios adicionales
    if (data.resumen.espacios_adicionales.cantidad > 0) {
      doc.text("Espacios adicionales:", 20, yPosition)
      yPosition += 10
      data.resumen.espacios_adicionales.detalle.forEach((espacio) => {
        doc.text(`• ${espacio.nombre}: ${espacio.area}m²`, 25, yPosition)
        yPosition += 8
      })
      yPosition += 10
    }

    // Área total destacada
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(20, yPosition, 170, 12, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`ÁREA TOTAL: ${data.resumen.area_total}m²`, 25, yPosition + 8)

    yPosition += 25

    // Cotización
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("COTIZACIÓN", 20, yPosition)

    yPosition += 20

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Diseño Arquitectónico: ${data.precios_m2.diseno}/m² × ${data.resumen.area_total}m²`, 20, yPosition)
    yPosition += 8
    doc.setFont("helvetica", "bold")
    doc.text(`= ${data.cotizacion.diseno}`, 25, yPosition)
    yPosition += 15

    doc.setFont("helvetica", "normal")
    doc.text(`Construcción: ${data.precios_m2.construccion}/m² × ${data.resumen.area_total}m²`, 20, yPosition)
    yPosition += 8
    doc.setFont("helvetica", "bold")
    doc.text(`= ${data.cotizacion.construccion}`, 25, yPosition)
    yPosition += 20

    // Total final
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(20, yPosition, 170, 15, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("TOTAL PROYECTO:", 25, yPosition + 10)
    doc.text(data.cotizacion.total, 140, yPosition + 10)

    yPosition += 30

    // Notas importantes
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("NOTAS IMPORTANTES:", 20, yPosition)

    yPosition += 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const notas = [
      "• Esta cotización tiene validez de 30 días.",
      "• Los precios están sujetos a cambios según especificaciones finales.",
      "• No incluye licencias, permisos ni conexiones de servicios públicos.",
      "• El diseño arquitectónico incluye planos estructurales y arquitectónicos.",
      "• La construcción incluye mano de obra y materiales básicos.",
      "• Para mayor información contacte a SAAVE Arquitectos.",
    ]

    notas.forEach((nota) => {
      doc.text(nota, 20, yPosition)
      yPosition += 6
    })

    // Footer
    yPosition = 280
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, yPosition, 210, 17, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text("SAAVE Arquitectos - Construyendo tus sueños", 20, yPosition + 8)
    doc.text("www.saavearquitectos.com | contacto@saavearquitectos.com", 20, yPosition + 13)

    return Buffer.from(doc.output("arraybuffer"))
  } catch (error) {
    console.error("Error en generatePDFSimple:", error)
    throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}
