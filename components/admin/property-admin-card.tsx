"use client"

import Image from "next/image"
import { Bed, Bath, Maximize, MapPin, Play, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Property } from "@/lib/types"

interface PropertyAdminCardProps {
  property: Property
  onEdit: (property: Property) => void
  onDelete: (id: string) => void
}

export function PropertyAdminCard({ property, onEdit, onDelete }: PropertyAdminCardProps) {

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
    return `${Number(property.area).toLocaleString("pt-BR")} ${unit}`
  }

  return (
    <Card className="p-0 overflow-hidden border-border bg-card transition-all flex flex-col h-full">
      <div className="relative">
        {/* Imagem (Sem clique de modal para o admin) */}
        <div className="relative block aspect-[4/3] w-full overflow-hidden group">
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

        {/* Content - Badges (Seguindo sua estrutura exata) */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
                className={
                  property.status !== 'available'
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : property.propertyType === "sale" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-chart-2 text-primary-foreground"
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
        <div className="flex flex-col gap-3 px-4 flex-grow">
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

          {/* Descrição com Rolagem (Scroll) */}
          <div className="h-22 overflow-y-auto rounded-md bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {property.description || "Sem descrição."}
          </div>

          {/* Ações de Admin: Editar e Excluir (Layout idêntico ao Wpp/Share) */}
          <div className="flex items-center justify-between pt-2 pb-4 gap-2 mt-auto">
            <Button
              className="flex-1 hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => onEdit(property)}
            >
               <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-input hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50 transition-colors"
              title="Excluir Imóvel"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}