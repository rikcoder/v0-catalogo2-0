"use client"

import { useState } from "react"
import { Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import type { FilterOptions } from "@/lib/types"

interface FiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  neighborhoods: string[]
}

export function Filters({ filters, onFiltersChange, neighborhoods }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // 1. Conta quantos filtros estão ativos para mostrar no botão
  const activeCount = [
    filters.minPrice, 
    filters.maxPrice, 
    filters.bedrooms, 
    filters.propertyType !== "all", 
    filters.category && filters.category !== "all",
    filters.neighborhood
  ].filter(Boolean).length

  // 2. Formata valor numérico para "R$ 1.000,00" visualmente
  const formatCurrencyDisplay = (value: number | null) => {
    if (!value) return ""
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  // 3. Trata a digitação do preço (remove R$, pontos e vírgulas)
  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numericValue = value.replace(/\D/g, "")
    const number = Number(numericValue) / 100
    setLocalFilters({ ...localFilters, [field]: number || null })
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      search: "",
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      propertyType: "all",
      category: "all",
      neighborhood: "",
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFiltersCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.propertyType !== "all" ? filters.propertyType : null,
    filters.neighborhood,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {/* Linha superior: Search + Filter (inline) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search bar - sempre visível - ocupa todo o espaço restante */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por endereço, bairro..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="min-h-[44px] pl-10 bg-secondary/50 border-border text-foreground w-full"
          />
        </div>

        {/* Botão de Filtros Avançados (Drawer) com LIMPAR interno */}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 border-border bg-secondary/50 hover:bg-secondary hover:text-secundary-foreground flex items-center justify-between px-3"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="inline">Filtros</span>

                {/* NOVO: Contador de filtros ativos (pequeno badge) */}
                {activeCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </div>

              {activeCount > 0 ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearFilters()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      handleClearFilters()
                    }
                  }}
                  className="ml-3 px-2 py-1 text-xs rounded-md border border-border bg-transparent hover:bg-primary-foreground/10 text-foreground"
                  aria-label="Limpar filtros"
                  title="Limpar filtros"
                >
                  Limpar
                </span>
              ) : (
                // espaço reservado para manter padding e alinhamento quando não há filtros
                <span className="ml-3 w-0" aria-hidden />
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="bg-card">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle className="text-foreground">Filtrar Imóveis</DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col gap-6 p-4">
              {/* Property Type */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Tipo</Label>
                <Select
                  value={localFilters.propertyType}
                  onValueChange={(value: "all" | "sale" | "rent") =>
                    setLocalFilters({ ...localFilters, propertyType: value })
                  }
                >
                  <SelectTrigger className="min-h-[44px] bg-secondary/50 border-border text-foreground">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="rent">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Faixa de Preço</Label>
                <div className="flex gap-2">
                  <Input
                    inputMode="numeric"
                    placeholder="Mínimo"
                    value={localFilters.minPrice ? formatCurrencyDisplay(localFilters.minPrice) : ""}
                    onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                    className="min-h-[44px] bg-secondary/50 border-border text-foreground"
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="Máximo"
                    value={localFilters.maxPrice ? formatCurrencyDisplay(localFilters.maxPrice) : ""}
                    onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                    className="min-h-[44px] bg-secondary/50 border-border text-foreground"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Quartos</Label>
                <Select
                  value={localFilters.bedrooms?.toString() ?? "any"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      bedrooms: value === "any" ? null : Number(value),
                    })
                  }
                >
                  <SelectTrigger className="min-h-[44px] bg-secondary/50 border-border text-foreground">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="any">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Neighborhood */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Bairro</Label>
                <Select
                  value={localFilters.neighborhood || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      neighborhood: value === "all" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="min-h-[44px] bg-secondary/50 border-border text-foreground">
                    <SelectValue placeholder="Todos os bairros" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos os bairros</SelectItem>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DrawerFooter className="border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="min-h-[44px] flex-1 border-none text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
                <Button onClick={handleApplyFilters} className="min-h-[44px] flex-1 bg-primary text-primary-foreground">
                  Aplicar Filtros
                </Button>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" className="min-h-[44px] border bg-transparent hover:bg-primary-foreground/90 hover:text-secundary-foreground">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
