// lib/types.ts

export interface SiteSettings {
  id?: string
  siteName: string
  logoUrl?: string
  logoSize?: "small" | "medium" | "large"
  socialMedia: {
    facebook?: string
    instagram?: string
    whatsapp?: string
    youtube?: string
    linkedin?: string
  }
  locations: {
    neighborhoods: string[]
    streets: string[]
    cities: string[]
  }
}

export interface Property {
  id: string
  location: string
  
  // Campos detalhados (Opcionais para compatibilidade com dados antigos)
  neighborhood?: string
  street?: string
  city?: string
  number?: string
  
  price: number
  priceSuffix?: string
  financeable: boolean
  propertyType: "sale" | "rent"
  status: "available" | "sold" | "rented"
  
  coverPhoto: string
  photos: string[]
  videoUrl?: string
  category: "house" | "apartment" | "land" | "commercial" | "rural" | "other"
  description: string
  bedrooms: number
  bathrooms: number
  area: number
  areaUnit: "m²" | "ha" // Obrigatório no código novo, mas trataremos fallbacks
  
  createdAt: Date
  updatedAt: Date
}

export interface FilterOptions {
  search: string
  minPrice: number | null
  maxPrice: number | null
  bedrooms: number | null
  propertyType: "all" | "sale" | "rent"
  category: string
  neighborhood: string
}