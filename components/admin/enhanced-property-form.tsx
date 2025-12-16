"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Loader2, UploadCloud, AlertCircle } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import type { Property } from "@/lib/types"
// Ajuste do import (removida a barra dupla)
import { useMediaUpload } from "@/hooks/use-media-upload" 

interface EnhancedPropertyFormProps {
  property?: Property
  onSubmit: (property: Omit<Property, "id">) => Promise<void>
  onCancel: () => void
}

export function EnhancedPropertyForm({ property, onSubmit, onCancel }: EnhancedPropertyFormProps) {
  // Estado inicial tipado para evitar erros de undefined
  const [formData, setFormData] = useState({
    location: property?.location || "",
    neighborhood: property?.neighborhood || "",
    street: property?.street || "",
    number: property?.number || "",
    city: property?.city || "",
    price: property?.price || 0,
    priceSuffix: property?.priceSuffix || "",
    financeable: property?.financeable || false,
    propertyType: property?.propertyType || "sale",
    status: property?.status || "available",
    description: property?.description || "",
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    area: property?.area || 0,
    areaUnit: property?.areaUnit || "m²",
    videoUrl: property?.videoUrl || "",
    category: property?.category || "other",
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(property?.photos || [])
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0)
  
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (property?.coverPhoto && property.photos) {
      const index = property.photos.indexOf(property.coverPhoto)
      if (index >= 0) setCoverPhotoIndex(index)
    }
  }, [property])

  const uploadPhotosToFirebase = async (): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < photos.length; i++) {
      setUploadProgress(`Enviando foto ${i + 1} de ${photos.length}...`)
      const file = photos[i]
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
      const storageRef = ref(storage, `properties/${timestamp}_${safeName}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      urls.push(url)
    }
    return urls
  }

  // Função para formatar moeda enquanto digita (R$ 0,00)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "")
    
    // Converte para número e divide por 100 para ter os centavos
    const numberValue = Number(value) / 100
    
    setFormData({ ...formData, price: numberValue })
  }

  // Helper visual para o valor do input
  const displayPrice = formData.price 
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.price)
    : ""

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove não dígitos
    const value = e.target.value.replace(/\D/g, "")
    setFormData({ ...formData, area: Number(value) })
  }
  
  // Visual da área (com separador de milhar)
  const displayArea = formData.area > 0
    ? new Intl.NumberFormat("pt-BR").format(formData.area)
    : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      let finalPhotos = [...existingPhotos]
      if (photos.length > 0) {
        const newUrls = await uploadPhotosToFirebase()
        finalPhotos = [...finalPhotos, ...newUrls]
      }

      if (finalPhotos.length === 0) throw new Error("Adicione pelo menos uma foto.")

      const safeCoverIndex = coverPhotoIndex < finalPhotos.length ? coverPhotoIndex : 0
      const displayLocation = formData.location || `${formData.neighborhood}, ${formData.city}`

      const propertyData: Omit<Property, "id"> = {
        ...formData,
        location: displayLocation,
        price: Number(formData.price),
        priceSuffix: formData.priceSuffix,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        propertyType: formData.propertyType as "sale" | "rent",
        status: formData.status as "available" | "sold" | "rented",
        areaUnit: formData.areaUnit as "m²" | "ha",
        videoUrl: formData.videoUrl,
        category: formData.category as any,
        
        photos: finalPhotos,
        coverPhoto: finalPhotos[safeCoverIndex],
        createdAt: property?.createdAt || new Date(),
        updatedAt: new Date()
      }

      await onSubmit(propertyData)

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Erro ao salvar.")
    } finally {
      setIsSaving(false)
      setUploadProgress("")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)])
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">{property ? "Editar Imóvel" : "Novo Imóvel"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
             <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive">
               <AlertCircle className="h-4 w-4"/>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          {/* UPLOAD DE FOTOS */}
          <div className="space-y-4 border-b border-border pb-6">
            <Label className="text-muted-foreground">Fotos</Label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {/* Existentes */}
              {existingPhotos.map((url, idx) => (
                <div key={`exist-${idx}`} className="relative aspect-square group rounded-md overflow-hidden border border-border">
                  <img src={url} className="w-full h-full object-cover"/>
                  <button type="button" onClick={() => setExistingPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                  <button type="button" onClick={() => setCoverPhotoIndex(idx)} className={`absolute bottom-1 left-1 text-[10px] px-2 py-0.5 rounded ${coverPhotoIndex === idx ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {coverPhotoIndex === idx ? "Capa" : "Definir Capa"}
                  </button>
                </div>
              ))}
              {/* Novas */}
              {photos.map((file, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-md overflow-hidden border border-primary/50">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover"/>
                  <button type="button" onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"><X size={12}/></button>
                  <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">Nova</span>
                </div>
              ))}
              {/* Botão */}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors">
                <UploadCloud className="text-muted-foreground mb-2"/>
                <span className="text-xs text-muted-foreground">Adicionar</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Bairro</Label>
              <Input 
                value={formData.neighborhood} 
                onChange={e => setFormData({...formData, neighborhood: e.target.value})} 
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" 
                placeholder="Ex: Centro"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Cidade</Label>
              <Input 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground" 
                placeholder="Ex: Porteirinha"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-muted-foreground">Endereço/Rua (Opcional)</Label>
              <Input 
                value={formData.street} 
                onChange={e => setFormData({...formData, street: e.target.value})} 
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* DETALHES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* PREÇO + DETALHE (Dividindo o espaço de 2 colunas em 1+1) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Valor (R$)</Label>
              <Input 
                type="text" 
                value={displayPrice} 
                onChange={handlePriceChange} 
                className="bg-secondary/50 border-border text-foreground text-lg font-bold placeholder:text-muted-foreground"
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Detalhe (opcional)</Label>
              <Input 
                value={formData.priceSuffix} 
                onChange={e => setFormData({...formData, priceSuffix: e.target.value})} 
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                placeholder="ex: cada, o hectare"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tipo</Label>
              <Select value={formData.propertyType} onValueChange={v => setFormData({...formData, propertyType: v as any})}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end pb-3">
              <div className="flex items-center space-x-2">
                <Switch checked={formData.financeable} onCheckedChange={c => setFormData({...formData, financeable: c})}/>
                <Label className="text-muted-foreground">Financiável</Label>
              </div>
            </div>
          </div>

          {/* CARACTERISTICAS */}
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label className="text-muted-foreground">Quartos</Label>
                <Input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} className="bg-secondary/50 border-border text-foreground"/>
             </div>
             <div className="space-y-2">
                <Label className="text-muted-foreground">Banheiros</Label>
                <Input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} className="bg-secondary/50 border-border text-foreground"/>
             </div>
             <div className="space-y-2">
               <Label className="text-muted-foreground">Área</Label>
               <div className="flex gap-2">
                <Input 
                    type="text"
                    value={displayArea} 
                    onChange={handleAreaChange} 
                    className="bg-secondary/50 border-border text-foreground w-full"
                    placeholder="0"
                 />
                 <Select value={formData.areaUnit} onValueChange={(v) => setFormData({ ...formData, areaUnit: v as Property["areaUnit"] })}>
                    <SelectTrigger className="w-24 bg-secondary/50 border-border text-foreground"><SelectValue/></SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="m²">m²</SelectItem>
                        <SelectItem value="ha">ha</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
             </div>
          </div>

          {/* VIDEO URL */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Vídeo (Link do YouTube)</Label>
            <Input 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                placeholder="https://youtube.com/..."
            />
          </div>

          {/* CATEGORIA DO IMÓVEL */}
          <div className="space-y-2">
              <Label className="text-muted-foreground">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={v => setFormData({...formData, category: v as any})}
              >
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="land">Lote / Terreno</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="rural">Rural / Chácara</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
          </div>

          {/* STATUS */}
          <div className="space-y-2">
              <Label className="text-muted-foreground">Status do Imóvel</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as any})}>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Alugado</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Descrição</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-secondary/50 border-border text-foreground min-h-[100px]"/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground hover:bg-secondary">Cancelar</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {uploadProgress || "Salvando..."}</> : "Salvar Imóvel"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}