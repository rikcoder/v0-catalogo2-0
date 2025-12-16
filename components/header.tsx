"use client"

import Link from "next/link"
import { Building2, Settings, Phone, Instagram, Facebook, Menu, MessageCircle, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet" // SheetTitle adicionado para acessibilidade
import { useState, useEffect } from "react"
import Image from "next/image"


export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  // Scroll-to-top: mostra o botão quando o usuário rola para baixo
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 500) // ajuste o threshold se quiser
    }

    // listener
    window.addEventListener("scroll", onScroll, { passive: true })
    // verifica no mount (caso o usuário já esteja rolado)
    onScroll()

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity">
          {/* Lógica da Logo: Se for SVG/PNG usa Image, senão usa Ícone */}
          {siteConfig.logoUrl ? (
             <div className="relative h-10 w-10 overflow-hidden">
                <Image 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.name} 
                  fill 
                  className="object-conteiner"
                />
             </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
               <Building2 className="h-6 w-6" />
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none text-foreground">{siteConfig.name}</span>
            <span className="text-xs text-muted-foreground">CRECI 8899-J</span>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/admin" className="text-muted-foreground p-2 hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          
          {/* Redes Sociais Desktop */}
          <div className="flex items-center gap-3 border-l border-border pl-6 ml-2">
             {siteConfig.social.instagram && (
                <a 
                  href={siteConfig.social.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-instagram transition-colors"
                  title="Instagram"
                >
                    <Instagram className="h-5 w-5" />
                </a>
             )}
             {siteConfig.social.facebook && (
                <a 
                  href={siteConfig.social.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-facebook transition-colors"
                  title="Facebook"
                >
                    <Facebook className="h-5 w-5" />
                </a>
             )}
             {siteConfig.social.whatsapp && (
                <a 
                  href={siteConfig.social.whatsapp} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-whatsapp transition-colors"
                  title="Canal WhatsApp"
                >
                    <MessageCircle className="h-5 w-5" />
                </a>
             )}
          </div>

          <Button 
            className="font-semibold text-primary-foreground shadow-sm"
            onClick={() =>
            window.open(
              `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                "Olá! Vim pelo site e gostaria de mais informações."
              )}`,
              "_blank"
            )
          }
          >
            <Phone className="h-4 w-4 mr-2" />
            Fale Conosco
          </Button>
        </nav>

        {/* Menu Mobile */}
        <div className="flex items-center gap-2 md:hidden">
            <Link href="/admin" className="text-muted-foreground p-2 hover:text-foreground transition-colors">
                <Settings className="h-5 w-5" />
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="bg-card border-border">
                    <SheetTitle className="text-left text-lg mt-4 ml-4  font-bold text-foreground mb-4">Menu</SheetTitle>
                    
                    <div className="flex flex-col gap-6 mt-4">
                        <Link href="/" onClick={() => setIsOpen(false)} className="flex justify-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
                           Início
                        </Link>
                        
                        <div className="h-px bg-border my-2" />
                        
                        <div className="flex gap-4 justify-center">
                            {siteConfig.social.instagram && (
                                <a href={siteConfig.social.instagram} target="_blank" className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-instagram border-2 border-transparent hover:border-instagram transition-colors">
                                    <Instagram className="h-6 w-6" />
                                </a>
                            )}
                             {siteConfig.social.facebook && (
                                <a href={siteConfig.social.facebook} target="_blank" className="p-3 bg-secondary rounded-full text-muted-foreground hover:text-facebook border-2 border-transparent hover:border-facebook transition-colors">
                                    <Facebook className="h-6 w-6" />
                                </a>
                            )}
                            <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" className="p-3 bg-secondary border-2 border-transparent rounded-full text-muted-foreground hover:text-whatsapp hover:border-whatsapp transition-colors">
                                <Phone className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
      {/* Botão SUBIR AO TOPO - minimalista e harmonizado com o header */}
      {showScrollTop && (
        <div className="fixed left-1/2 -translate-x-1/2 top-[calc(4rem+1rem)] z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Subir ao topo"
            className="bg-card border border-border text-foreground shadow-lg rounded-full p-2 hover:scale-105 transition-transform"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  )
}