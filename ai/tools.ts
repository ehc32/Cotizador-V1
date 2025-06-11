import { tool } from "ai"
import { z } from "zod"

// Configuración de precios del documento
const PRECIOS_CONFIG = {
  diseno_por_m2: 25000,
  construccion_por_m2: 850000,
  areas_base: {
    cocina: 11.5, // 4,5x2,5
    sala: 13.5, // 4,5x3
    comedor: 18, // 4,5x4
    ropas: 8, // 4x2
    bano_social: 2.5, // 1,5x1,5
  },
} as const

// Definir tipos de cama con sus áreas correspondientes
const TIPOS_CAMA = {
  sencilla: 14, // 4,5x3 (solo para habitaciones adicionales)
  doble: 16, // 4,5x3,5
  queen: 18, // 4,5x4
  king_25: 25, // 4,5x5,5
  king_27: 27, // 4,5x6
  california_king_30: 30, // 4,5x6,5
  california_king_32: 32, // 4,5x7
} as const

// Definir espacios adicionales con sus áreas
const ESPACIOS_ADICIONALES = {
  estudio: 18, // 4,5x4
  sala_tv: 14, // 4,5x3
  habitacion_servicio: 14, // 4,5x3
  deposito_pequeno: 4,
  deposito_mediano: 6,
  deposito_grande: 9,
  sauna: 9, // 3x3
  turco: 9, // 3x3
  piscina_pequena: 16, // 3,6x4,5
  piscina_mediana: 24, // 3,6x6,5
  piscina_grande: 32, // 3,6x9
  bano_social_exterior: 4, // 2,4x1,5
} as const

export const cotizadorTool = tool({
  description: "Calcula cotización final de construcción SAAVE Arquitectos basada en el flujo de preguntas completado",
  parameters: z.object({
    tiene_lote: z.enum(["si", "no_en_proceso"]).describe("Si tiene lote o está en proceso de compra"),

    habitacion_principal: z
      .object({
        tipo_cama: z
          .enum(["doble", "queen", "king_25", "king_27", "california_king_30", "california_king_32"])
          .describe("Tipo de cama para habitación principal"),
      })
      .describe("Configuración de la habitación principal"),

    habitaciones_adicionales: z
      .array(
        z.object({
          numero: z.number().describe("Número de la habitación (1, 2, 3, 4)"),
          tipo_cama: z.enum(["sencilla", "doble", "queen"]).describe("Tipo de cama para habitación adicional"),
          tiene_bano: z.boolean().describe("Si la habitación tiene baño propio (+3.5m²)"),
        }),
      )
      .default([])
      .describe("Lista de habitaciones adicionales"),

    espacios_adicionales: z
      .array(
        z.enum([
          "estudio",
          "sala_tv",
          "habitacion_servicio",
          "deposito_pequeno",
          "deposito_mediano",
          "deposito_grande",
          "sauna",
          "turco",
          "piscina_pequena",
          "piscina_mediana",
          "piscina_grande",
          "bano_social_exterior",
        ]),
      )
      .default([])
      .describe("Lista de espacios adicionales seleccionados"),
  }),

  execute: async ({ tiene_lote, habitacion_principal, habitaciones_adicionales, espacios_adicionales }) => {
    try {
      // Validar que el tipo de cama existe
      if (!(habitacion_principal.tipo_cama in TIPOS_CAMA)) {
        throw new Error(`Tipo de cama inválido: ${habitacion_principal.tipo_cama}`)
      }

      // Calcular áreas base fijas
      const areas_base = Object.values(PRECIOS_CONFIG.areas_base).reduce((sum, area) => sum + area, 0)

      // Calcular área de habitación principal
      const area_habitacion_principal = TIPOS_CAMA[habitacion_principal.tipo_cama]

      // Calcular área de habitaciones adicionales
      const area_habitaciones_adicionales = habitaciones_adicionales.reduce((total, habitacion) => {
        if (!(habitacion.tipo_cama in TIPOS_CAMA)) {
          throw new Error(`Tipo de cama inválido en habitación adicional: ${habitacion.tipo_cama}`)
        }

        const area_cama = TIPOS_CAMA[habitacion.tipo_cama]
        const area_bano = habitacion.tiene_bano ? 3.5 : 0
        return total + area_cama + area_bano
      }, 0)

      // Calcular área de espacios adicionales
      const area_espacios_adicionales = espacios_adicionales.reduce((total, espacio) => {
        if (!(espacio in ESPACIOS_ADICIONALES)) {
          throw new Error(`Espacio adicional inválido: ${espacio}`)
        }
        return total + ESPACIOS_ADICIONALES[espacio]
      }, 0)

      // Calcular área total
      const area_total =
        areas_base + area_habitacion_principal + area_habitaciones_adicionales + area_espacios_adicionales

      // Validar que el área total sea positiva
      if (area_total <= 0) {
        throw new Error("El área total debe ser mayor a 0")
      }

      // Precios por m2
      const precio_diseno = PRECIOS_CONFIG.diseno_por_m2
      const precio_construccion = PRECIOS_CONFIG.construccion_por_m2

      // Calcular costos
      const costo_diseno = area_total * precio_diseno
      const costo_construccion = area_total * precio_construccion
      const costo_total = costo_diseno + costo_construccion

      // Función para formatear moneda colombiana
      const formatCurrency = (amount: number): string => {
        if (isNaN(amount) || !isFinite(amount)) {
          throw new Error("Monto inválido para formatear")
        }

        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.round(amount))
      }

      // Crear descripción legible de habitaciones adicionales
      const descripcion_habitaciones = habitaciones_adicionales.map((hab) => ({
        numero: hab.numero,
        tipo_cama: hab.tipo_cama,
        area_cama: TIPOS_CAMA[hab.tipo_cama],
        tiene_bano: hab.tiene_bano,
        area_bano: hab.tiene_bano ? 3.5 : 0,
        area_total: TIPOS_CAMA[hab.tipo_cama] + (hab.tiene_bano ? 3.5 : 0),
      }))

      // Crear descripción legible de espacios adicionales
      const descripcion_espacios = espacios_adicionales.map((espacio) => ({
        nombre: espacio.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        area: ESPACIOS_ADICIONALES[espacio],
      }))

      const resultado = {
        informacion_cliente: {
          tiene_lote: tiene_lote === "si" ? "Sí" : "No, en proceso de compra",
        },
        resumen: {
          area_total: Math.round(area_total * 100) / 100,
          areas_base: Math.round(areas_base * 100) / 100,
          habitacion_principal: {
            tipo_cama: habitacion_principal.tipo_cama.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            area: area_habitacion_principal,
          },
          habitaciones_adicionales: {
            cantidad: habitaciones_adicionales.length,
            area_total: Math.round(area_habitaciones_adicionales * 100) / 100,
            detalle: descripcion_habitaciones,
          },
          espacios_adicionales: {
            cantidad: espacios_adicionales.length,
            area_total: Math.round(area_espacios_adicionales * 100) / 100,
            detalle: descripcion_espacios,
          },
        },
        cotizacion: {
          diseno: formatCurrency(costo_diseno),
          construccion: formatCurrency(costo_construccion),
          total: formatCurrency(costo_total),
        },
        precios_m2: {
          diseno: formatCurrency(precio_diseno),
          construccion: formatCurrency(precio_construccion),
        },
        desglose_detallado: {
          "🏠 Áreas base incluidas": `${areas_base}m² (cocina, sala, comedor, ropas, baño social)`,
          "🛏️ Habitación principal": `${area_habitacion_principal}m²`,
          "🏠 Habitaciones adicionales": `${Math.round(area_habitaciones_adicionales * 100) / 100}m²`,
          "✨ Espacios adicionales": `${Math.round(area_espacios_adicionales * 100) / 100}m²`,
          "📐 ÁREA TOTAL": `${Math.round(area_total * 100) / 100}m²`,
        },
      }

      return resultado
    } catch (error) {
      console.error("Error en cotizadorTool:", error)
      throw new Error(`Error al calcular cotización: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  },
})

export const descargarPDFTool = tool({
  description: "Prepara la descarga del PDF con la cotización cuando el usuario confirma",
  parameters: z.object({
    confirmar_descarga: z.boolean().describe("Confirmación del usuario para descargar el PDF"),
    datos_cotizacion: z.any().describe("Datos completos de la cotización para incluir en el PDF"),
  }),
  execute: async ({ confirmar_descarga, datos_cotizacion }) => {
    if (!confirmar_descarga) {
      return {
        mensaje: "Descarga cancelada. ¿Hay algo más en lo que pueda ayudarte?",
        descargar_pdf: false,
      }
    }

    try {
      // Validar datos antes de proceder
      if (!datos_cotizacion || !datos_cotizacion.resumen || !datos_cotizacion.cotizacion) {
        throw new Error("Datos de cotización incompletos")
      }

      // Retornar señal para activar descarga en el cliente
      return {
        mensaje:
          "¡Perfecto! Tu cotización se está preparando para descarga. El archivo PDF se descargará automáticamente en unos segundos...",
        descargar_pdf: true,
        datos_cotizacion: datos_cotizacion,
      }
    } catch (error) {
      console.error("Error preparando PDF:", error)
      return {
        mensaje: `Hubo un error preparando el PDF: ${error instanceof Error ? error.message : "Error desconocido"}. Por favor intenta nuevamente.`,
        descargar_pdf: false,
      }
    }
  },
})
