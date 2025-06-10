import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import logo from "@/public/471146904_122180586404046741_1301462224554776152_n.jpg"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SAAVE Arquitectos - Asistente IA",
  description: "Asistente inteligente para consultas arquitectónicas y servicios de SAAVE Arquitectos",
  icons: {
    icon: logo.src
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
