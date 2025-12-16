"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react"
import { siteConfig } from "@/lib/site-config"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Coluna 1: Marca e Social (Igual ao Header) */}
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                {siteConfig.logoUrl ? (
                    <div className="relative h-10 w-10 overflow-hidden">
                        <Image 
                        src={siteConfig.logoUrl} 
                        alt={siteConfig.name} 
                        fill 
                        className="object-contain" // Corrigido de object-conteiner para object-contain
                        />
                    </div>
                ) : (
                    <div className="h-10 w-10 bg-primary rounded-lg" />
                )}
                
                <div className="flex flex-col items-start">
                    <span className="text-lg font-bold leading-none text-foreground">{siteConfig.name}</span>
                    <span className="text-xs text-muted-foreground">CRECI 8899-J</span>
                </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>

            {/* Redes Sociais com as cores do Header */}
            <div className="flex gap-4 pt-2 justify-center md:justify-start">
              {siteConfig.social.instagram && (
                <a 
                    href={siteConfig.social.instagram} 
                    target="_blank" 
                    className="hover:text-instagram transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {siteConfig.social.facebook && (
                <a 
                    href={siteConfig.social.facebook} 
                    target="_blank" 
                    className="hover:text-facebook transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-foreground transition-colors">Início</Link></li>
              <li><Link href="/admin" className="hover:text-foreground transition-colors">Área Administrativa</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3 text-sm flex flex-col items-center md:items-start">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé Inferior Centralizado */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col items-center justify-center text-xs text-center">
          <p>&copy; {currentYear} {siteConfig.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}