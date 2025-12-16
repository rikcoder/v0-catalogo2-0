"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
// CORREÇÃO 1: Importar do local correto e incluir FilterOptions
import type { Property, FilterOptions } from "@/lib/types" 
import { Header } from "@/components/header"
import { Filters } from "@/components/filters"
import { PropertyCard } from "@/components/property-card"
import { searchProperties } from "@/lib/search-utils"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  
  // CORREÇÃO 2: Tipagem explicita para o estado dos filtros
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    propertyType: "all",
    neighborhood: "",
    category: "all",
  })

  useEffect(() => {
    async function fetchProperties() {
      try {
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        
        const data = snapshot.docs.map((doc) => {
          const d = doc.data()

          // Normalização segura
          let typeNormalized: "sale" | "rent" = "sale"
          if (Array.isArray(d.propertyType)) {
            typeNormalized = d.propertyType[0] as "sale" | "rent"
          } else if (typeof d.propertyType === "string") {
            typeNormalized = d.propertyType as "sale" | "rent"
          }

          return {
            id: doc.id,
            location: d.location || "",
            neighborhood: d.neighborhood || "",
            street: d.street || "",
            city: d.city || "",
            number: d.number || "",
            price: Number(d.price) || 0,
            priceSuffix: d.priceSuffix || "",
            financeable: !!d.financeable,
            propertyType: typeNormalized,
            status: d.status || "available",
            coverPhoto: d.coverPhoto || "",
            photos: d.photos || [],
            videoUrl: d.videoUrl || "",
            category: d.category || "other",
            description: d.description || "",
            bedrooms: Number(d.bedrooms) || 0,
            bathrooms: Number(d.bathrooms) || 0,
            area: Number(d.area) || 0,
            areaUnit: d.areaUnit || "m²",
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          } as Property
        })

        // 🟢 AQUI ENTRA A MELHORIA — sem tocar no resto
        const sortedData = data.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1
          if (a.status !== "available" && b.status === "available") return 1
          return b.createdAt.getTime() - a.createdAt.getTime()
        })

        setProperties(sortedData)

      } catch (error) {
        console.error("Erro ao carregar imóveis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Extrair bairros únicos para o filtro
  const neighborhoods = useMemo(() => {
    const unique = new Set(properties.map(p => p.neighborhood).filter(Boolean))
    return Array.from(unique).sort() as string[]
  }, [properties])

  // Lógica de Filtragem (Client-Side)
  const filteredProperties = useMemo(() => {
    let result = properties

    // 1. Busca por Texto (Inteligente)
    if (filters.search) {
      result = searchProperties(result, filters.search)
    }

    // 2. Filtros Exatos
    return result.filter(p => {
        // Tipo
        if (filters.propertyType !== "all" && p.propertyType !== filters.propertyType) return false
        
        // Preço
        if (filters.minPrice && p.price < filters.minPrice) return false
        if (filters.maxPrice && p.price > filters.maxPrice) return false
        
        // NOVO FILTRO DE CATEGORIA
        if (filters.category && filters.category !== "all" && p.category !== filters.category) return false

        // Quartos
        if (filters.bedrooms && p.bedrooms < filters.bedrooms) return false
        
        // Bairro
        if (filters.neighborhood && filters.neighborhood !== "all" && p.neighborhood !== filters.neighborhood) return false

        return true
    })
  }, [properties, filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header /> 

      <main className="pb-20">
        <Filters 
            filters={filters} 
            onFiltersChange={setFilters} 
            neighborhoods={neighborhoods} 
        />

        <div className="container mx-auto px-4 mt-2">
            <div className="mb-4 text-muted-foreground text-sm">
                {filteredProperties.length} imóveis encontrados
            </div>

            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">Nenhum imóvel encontrado.</p>
                    <button 
                        onClick={() => setFilters({ 
                          search: "", 
                          minPrice: null, 
                          maxPrice: null, 
                          bedrooms: null, 
                          propertyType: "all", 
                          neighborhood: "",
                          category: "all"
                        })}
                        className="mt-4 text-primary hover:underline"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
        </div>
      </main>
    </div>
  )
}