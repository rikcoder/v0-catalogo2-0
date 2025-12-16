"use client"

import { useState } from "react"
import Image from "next/image"
import { Bed, Bath, Maximize, Share2, MapPin, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PropertyCarousel } from "@/components/property-carousel" // Usaremos o carrossel que já criamos antes
import type { Property } from "@/lib/types"
import { toast } from "sonner"
import { siteConfig } from "@/lib/site-config"


interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Lógica de exibição da área (Hectares vs Metros)
  const formatArea = () => {
    const unit = property.areaUnit === "ha" ? "ha" : "m²"
    // Adiciona .toLocaleString para formatar 3000 -> 3.000
    return `${Number(property.area).toLocaleString("pt-BR")} ${unit}`
  }

  // ... (Mantenha os imports e o formatPrice como estão)

  // Função nova para o WhatsApp
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/imovel/${property.id}`
    
    // Monta a mensagem bonita com quebras de linha
    const message = `Olá! Tenho interesse neste imóvel:
📍 ${property.location}
${property.neighborhood ? `Bairro: ${property.neighborhood}` : ''}
💰 ${formatPrice(property.price)}

Link: ${url}`

    // Abre o WhatsApp
    window.open(`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Função atualizada para Compartilhar (Nativo + Cópia)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/imovel/${property.id}`
    const shareData = {
      title: `Imóvel em ${property.city}`,
      text: `Confira este imóvel: ${property.location} - ${formatPrice(property.price)}`,
      url: url,
    }

    // Tenta usar o compartilhamento nativo do celular
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return // Se deu certo, para por aqui
      } catch (err) {
        console.log('Usuário fechou o compartilhamento ou erro:', err)
      }
    }

    // Fallback: Se for PC ou der erro, copia o link (Sua lógica original mantida)
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado!")
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      toast.success("Link copiado!")
    }
  }

  return (
    <>
      <Card className="p-0 overflow-hidden border-border bg-card transition-all">
        <div className="relative">
          {/* Botão Invisível que abre o Modal */}
          <div 
            className="relative block aspect-[4/3] w-full overflow-hidden cursor-pointer group"
            onClick={() => setIsViewerOpen(true)}
          >
            <Image
              src={property.coverPhoto || "/placeholder.svg"}
              alt={property.location}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay de Contagem de Fotos */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {property.photos.length} fotos
              {property.videoUrl && (
                <span className="ml-1 flex items-center gap-1 border-l border-white/30 pl-1">
                  <Play className="h-3 w-3" /> vídeo
                </span>
              )}
            </div>

            {/* Overlay de Status (Vendido/Alugado) */}
            {property.status !== "available" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <span className="text-xl font-bold text-white border-2 border-white px-4 py-1 rounded uppercase tracking-widest">
                  {property.status === "sold" ? "Vendido" : "Alugado"}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 p-4">
            {/* Badges Flutuantes */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                className={
                  property.status !== 'available'
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" // Se vendido/alugado = Vermelho
                    : property.propertyType === "sale" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-chart-2 text-primary-foreground" // Se disponível = Verde ou Azul (sua classe original)
                }
              >
                {property.status !== 'available' 
                  ? (property.status === 'sold' ? "Vendido" : "Alugado")
                  : (property.propertyType === "sale" ? "Venda" : "Aluguel")
                }
              </Badge>
              
              {property.financeable && property.status === 'available' && (
                <Badge variant="secondary" className="bg-chart-5 text-primary-foreground hover:bg-chart-5">
                  Financiável
                </Badge>
              )}
            </div>
          </div>

          {/* Conteúdo do Card */}
          <div className="flex flex-col gap-3 px-4">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
              {/* Lógica para mostrar "/ cada", "/ ha" ou "/ mês" */}
              {property.priceSuffix ? (
                 <span className="text-sm text-secundary font-normal lowercase"> / {property.priceSuffix}</span>
              ) : (
                 property.propertyType === 'rent' && <span className="text-sm text-secundary font-normal">/mês</span>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-secundary h-10">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secundary" />
              <span className="line-clamp-2">{property.location}</span>
            </div>

            {/* Ícones de Características */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3 mt-1">
              <div className="flex items-center gap-1.5" title="Quartos">
                <Bed className="h-4 w-4 text-secundary" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Banheiros">
                <Bath className="h-4 w-4 text-secundary" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Área">
                <Maximize className="h-4 w-4 text-secundary" />
                <span>{formatArea()}</span>
              </div>
            </div>

            {/* Descrição com Rolagem (Scroll) - Seu pedido específico */}
            <div className="h-22 overflow-y-auto rounded-md bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {property.description || "Sem descrição."}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-2 pb-4 gap-2">
              <Button
                // Mantendo EXATAMENTE suas classes visuais
                className="flex-1 hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={handleWhatsApp} // Chama a nova função
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare} // Chama a nova função híbrida (Nativo + Copy)
                // Mantendo EXATAMENTE suas classes visuais
                className="border-border hover:bg-primary-foreground hover:text-white ml-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lightbox (Visualizador) - Reutilizando Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[100vw] h-[100vh] bg-black border-none p-0 rounded-none flex items-center justify-center">
            <DialogTitle className="sr-only">Galeria de Fotos</DialogTitle>

            {/* Aqui entra o carrossel que já otimizamos antes */}
            <div className="w-full h-full flex items-center justify-center">
                <PropertyCarousel photos={property.photos} videoUrl={property.videoUrl || undefined} />
            </div>
        </DialogContent>
      </Dialog>
    </>
  )
}