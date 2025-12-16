"use client"

import type { Property } from "@/lib/types"
import { PropertyCard } from "./property-card"

interface PropertyGridProps {
  properties: Property[]
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">Nenhum imóvel encontrado com os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
