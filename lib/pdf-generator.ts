import jsPDF from "jspdf"

// Importación dinámica de autoTable para evitar problemas de SSR
let autoTable: ((doc: jsPDF, options: AutoTableOptions) => void) | null = null

interface AutoTableOptions {
  startY: number
  head: string[][]
  body: string[][]
  theme: string
  headStyles: {
    fillColor: readonly [number, number, number]
    textColor: readonly [number, number, number]
    fontStyle: string
  }
  styles: {
    fontSize: number
    cellPadding: number
  }
  columnStyles?: {
    [key: number]: {
      fontStyle?: string
      halign?: string
      fontSize?: number
    }
  }
  didParseCell?: (data: AutoTableCellData) => void
}

interface AutoTableCellData {
  row: {
    index: number
  }
  cell: {
    styles: {
      fillColor: readonly [number, number, number]
      textColor: readonly [number, number, number]
      fontStyle: string
    }
  }
}

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number
  }
}

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

export async function generatePDF(data: CotizacionData): Promise<Buffer> {
  try {
    // Importar autoTable dinámicamente
    if (!autoTable) {
      const autoTableModule = await import("jspdf-autotable")
      autoTable = autoTableModule.default as (doc: jsPDF, options: AutoTableOptions) => void
    }

    const doc = new jsPDF() as ExtendedJsPDF

    // Configuración de colores
    const primaryColor = [41, 128, 185] as const // Azul corporativo
    const secondaryColor = [52, 73, 94] as const // Gris oscuro
    const accentColor = [231, 76, 60] as const // Rojo para totales

    let yPosition = 20

    // Header con logo y título
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 30, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("SAAVE ARQUITECTOS", 20, 20)

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Cotización de Construcción", 20, 27)

    yPosition = 45

    // Información del cliente
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DEL CLIENTE", 20, yPosition)

    yPosition += 10
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`¿Tiene lote?: ${data.informacion_cliente.tiene_lote}`, 20, yPosition)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CO")}`, 120, yPosition)

    yPosition += 20

    // Resumen del proyecto
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RESUMEN DEL PROYECTO", 20, yPosition)

    yPosition += 15

    // Tabla de áreas
    const areasData = [
      ["Concepto", "Área (m²)", "Descripción"],
      ["Áreas base incluidas", data.resumen.areas_base.toString(), "Cocina, sala, comedor, ropas, baño social"],
      [
        "Habitación principal",
        data.resumen.habitacion_principal.area.toString(),
        data.resumen.habitacion_principal.tipo_cama,
      ],
    ]

    // Agregar habitaciones adicionales
    if (data.resumen.habitaciones_adicionales.cantidad > 0) {
      data.resumen.habitaciones_adicionales.detalle.forEach((hab) => {
        areasData.push([
          `Habitación ${hab.numero}`,
          hab.area_total.toString(),
          `${hab.tipo_cama}${hab.tiene_bano ? " + baño" : ""}`,
        ])
      })
    }

    // Agregar espacios adicionales
    if (data.resumen.espacios_adicionales.cantidad > 0) {
      data.resumen.espacios_adicionales.detalle.forEach((espacio) => {
        areasData.push([espacio.nombre, espacio.area.toString(), "Espacio adicional"])
      })
    }

    // Fila de total
    areasData.push(["ÁREA TOTAL", data.resumen.area_total.toString(), ""])

    // Usar autoTable con la función importada dinámicamente
    if (autoTable) {
      autoTable(doc, {
        startY: yPosition,
        head: [areasData[0]],
        body: areasData.slice(1),
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "center" },
          2: { fontSize: 9 },
        },
        didParseCell: (data: AutoTableCellData) => {
          if (data.row.index === areasData.length - 2) {
            // Última fila (ÁREA TOTAL)
            data.cell.styles.fillColor = accentColor
            data.cell.styles.textColor = [255, 255, 255]
            data.cell.styles.fontStyle = "bold"
          }
        },
      })
    }

    yPosition = doc.lastAutoTable.finalY + 20

    // Cotización
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("COTIZACIÓN", 20, yPosition)

    yPosition += 15

    const cotizacionData = [
      ["Concepto", "Precio por m²", "Área Total", "Subtotal"],
      ["Diseño Arquitectónico", data.precios_m2.diseno, `${data.resumen.area_total}m²`, data.cotizacion.diseno],
      ["Construcción", data.precios_m2.construccion, `${data.resumen.area_total}m²`, data.cotizacion.construccion],
    ]

    if (autoTable) {
      autoTable(doc, {
        startY: yPosition,
        head: [cotizacionData[0]],
        body: cotizacionData.slice(1),
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 11,
          cellPadding: 6,
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "center" },
          3: { halign: "right", fontStyle: "bold" },
        },
      })
    }

    yPosition = doc.lastAutoTable.finalY + 10

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

    yPosition += 10
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
    console.error("Error en generatePDF:", error)
    throw new Error(`Error generando PDF: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}