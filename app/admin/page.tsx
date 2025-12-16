"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Property } from "@/lib/types"
import { AuthGuard } from "@/components/admin/auth-guard"
import { EnhancedPropertyForm } from "@/components/admin/enhanced-property-form"
import { SiteSettingsForm } from "@/components/admin/site-settings"
import { PropertyAdminCard } from "@/components/admin/property-admin-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Plus, LogOut, Loader2, Settings, Home, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchProperties } from "@/lib/search-utils"
import Image from "next/image"
import { siteConfig } from "@/lib/site-config"

export default function AdminPage() {
  const { logout } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [activeTab, setActiveTab] = useState("properties")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAdminProperties, setFilteredAdminProperties] = useState<Property[]>([])

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredAdminProperties(searchProperties(properties, searchTerm))
    } else {
      setFilteredAdminProperties(properties)
    }
  }, [properties, searchTerm])

const fetchProperties = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      const propertiesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Normalização do Tipo (Venda/Aluguel)
        let typeNormalized: "sale" | "rent" = "sale";
        if (Array.isArray(data.propertyType)) {
            typeNormalized = data.propertyType[0] as "sale" | "rent" || "sale";
        } else if (typeof data.propertyType === 'string') {
            typeNormalized = data.propertyType as "sale" | "rent";
        }

        return {
            id: doc.id,
            ...data,
            // Normalização
            propertyType: typeNormalized,
            // AQUI: Se não tiver categoria, usa 'other' para não classificar errado
            category: data.category || "other", 
            areaUnit: data.areaUnit || "m²",
            priceSuffix: data.priceSuffix || "",
            
            // Datas
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        }
      }) as Property[] // Assegura que segue o tipo Property do types.ts
      
      // 🟢 ORDENAÇÃO: Disponíveis primeiro, vendidos/devolvidos/locados depois
      const sortedData = propertiesData.sort((a, b) => {
        if (a.status === "available" && b.status !== "available") return -1;
        if (a.status !== "available" && b.status === "available") return 1;
        
        // Se ambos são do mesmo grupo, ordenar por data (recente primeiro)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setProperties(sortedData);

    } catch (error) {
      console.error("Erro ao buscar propriedades:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (propertyData: Omit<Property, "id">) => {
    try {
      // Limpeza de dados
      const cleanData = JSON.parse(JSON.stringify(propertyData))
      
      if (editingProperty && editingProperty.id) {
        await updateDoc(doc(db, "properties", editingProperty.id), cleanData)
      } else {
        await addDoc(collection(db, "properties"), cleanData)
      }
      await fetchProperties()
      setShowForm(false)
      setEditingProperty(null)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar.")
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleDelete = async (propertyId: string) => {
    if (confirm("Tem certeza que deseja excluir este imóvel permanentemente?")) {
      try {
        await deleteDoc(doc(db, "properties", propertyId))
        await fetchProperties()
      } catch (error) {
        console.error("Erro ao excluir:", error)
        alert("Erro ao excluir.")
      }
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        
        {/* Header Admin */}
        <header className="sticky top-0 z-30 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="relative h-10 w-10 overflow-hidden">
                  <Image 
                    src={siteConfig.logoUrl} 
                    alt={siteConfig.name} 
                    fill 
                    className="object-conteiner"
                  />
                </div>     
                <span className="font-bold text-lg hidden md:block">Painel Administrativo</span>
            </div>
            <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground hover:bg-secondary">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList className="bg-card border border-border p-1">
                  <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-secundary-foreground">
                    <Home className="h-4 w-4 mr-2" /> Imóveis
                  </TabsTrigger>
                  {/*<TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-secundary-foreground">
                    <Settings className="h-4 w-4 mr-2" /> Configurações
                  </TabsTrigger>*/}
                </TabsList>

                {!showForm && activeTab === "properties" && (
                    <Button onClick={() => { setEditingProperty(null); setShowForm(true) }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" /> Novo Imóvel
                    </Button>
                )}
            </div>

            <TabsContent value="properties" className="space-y-6">
              {showForm ? (
                <EnhancedPropertyForm
                  property={editingProperty || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => { setShowForm(false); setEditingProperty(null) }}
                />
              ) : (
                <>
                  {/* Barra de Busca Admin */}
                  <div className="relative w-full max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por endereço, bairro ou valor..."
                      className="bg-card border-border text-foreground pl-10 h-11"
                    />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredAdminProperties.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/50">
                      <p className="text-muted-foreground text-lg">Nenhum imóvel encontrado.</p>
                    </div>
                  ) : (
                    // AQUI A CORREÇÃO DO GRID (4 colunas)
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAdminProperties.map((property) => (
                        <PropertyAdminCard 
                            key={property.id} 
                            property={property} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <SiteSettingsForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}