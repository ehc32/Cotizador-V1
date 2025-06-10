"use client"

import { useState } from "react"

export function SimplePDFButton({ cotizacionData }: { cotizacionData: object }) {
  const [loading, setLoading] = useState(false)

  const downloadPDF = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cotizacionData),
      })

      if (!response.ok) throw new Error("Error generando PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotizacion-saave-${new Date().toISOString().split("T")[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error descargando PDF: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "20px",
        border: "2px solid #3b82f6",
        borderRadius: "8px",
        backgroundColor: "#eff6ff",
        textAlign: "center",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#1e40af" }}>📄 Descargar Cotización</h3>
      <button
        onClick={downloadPDF}
        disabled={loading}
        style={{
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "⏳ Generando..." : "📥 Descargar PDF"}
      </button>
    </div>
  )
}
