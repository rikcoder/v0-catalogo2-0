import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// PADRÃO DE METADATA PROFISSIONAL
export const metadata: Metadata = {
  title: "RA Broker | Catalogo",
  description: "Encontre casas, lotes e apartamentos em Porteirinha/MG. Compra, venda e aluguel com segurança.",
  icons: {
    // Usando sua logo oficial como ícone da aba do navegador
    icon: "/logo-icon.svg", 
    apple: "/logo-icon.svg", // Fallback para Apple Touch Icon
  },
  openGraph: {
    title: "RA Broker - Negócios Imobiliários",
    description: "Seu imóvel ideal em Porteirinha e região está aqui.",
    siteName: "RA Broker",
    locale: "pt_BR",
    type: "website",
  }
}

export const viewport: Viewport = {
  themeColor: "#0f172a", // Mantém a cor do tema escuro
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased ${_geist.className}`}>
        {children}
        <Analytics />
        <Footer />
      </body>
    </html>
  )
}