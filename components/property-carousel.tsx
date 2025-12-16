"use client"

import { useState, TouchEvent } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PropertyCarouselProps {
  photos: string[]
  videoUrl?: string
}

export function PropertyCarousel({ photos, videoUrl }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Estados para o Swipe (Toque)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 50

  // --- LÓGICA NOVA PARA VÍDEO ---
  const totalSlides = photos.length + (videoUrl ? 1 : 0)
  const isVideoSlide = videoUrl && currentIndex === 0

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  }

  // Funções de Navegação (Atualizadas para usar totalSlides)
  const next = () => setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  const prev = () => setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  // --- Lógica de Preloading (Otimização de Velocidade) ---
  // Calcula quais são os índices da próxima e da anterior imagem
  const nextIndex = (currentIndex + 1) % photos.length
  const prevIndex = (currentIndex - 1 + photos.length) % photos.length

  // Lógica do Swipe
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) next()
    if (isRightSwipe) prev()
  }

  if (!photos.length) return <div className="text-gray-500">Sem fotos</div>

  return (
    <div 
        className="relative w-full h-full flex items-center justify-center bg-black touch-pan-y"
        // Eventos de toque adicionados ao container principal
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      {/* SE FOR VÍDEO, MOSTRA IFRAME. SE NÃO, MOSTRA IMAGEM */}
      {isVideoSlide ? (
        <div className="w-full h-full flex items-center justify-center p-0 md:p-10">
           {getEmbedUrl(videoUrl!) ? (
              <iframe 
                className="w-full h-full max-h-[85vh] aspect-video" 
                src={getEmbedUrl(videoUrl!) ?? undefined}
                title="YouTube video" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
           ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Play className="h-12 w-12 mb-2"/>
                <span>Vídeo indisponível</span>
              </div>
           )}
        </div>
      ) : (
        <Image 
          src={photos[currentIndex]} 
          alt={`Foto ${currentIndex + 1}`} 
          className="max-h-[85vh] max-w-full object-contain select-none pointer-events-none"
          width={1920} 
          height={1080}
          priority={true}
          quality={85}
        />
      )}
      
      {/* --- PRELOADER INVISÍVEL --- */}
      {/* Isso força o navegador a baixar as imagens vizinhas em cache agora */}
      <div className="hidden">
         <img src={photos[nextIndex]} alt="preload next" />
         <img src={photos[prevIndex]} alt="preload prev" />
      </div>

      {/* Contador */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {totalSlides}
      </div>

      {photos.length > 1 && (
        <>
          {/* Botões de Navegação (Visíveis apenas em telas médias/grandes md:flex) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 md:left-4 bg-black/30 text-white hover:bg-black/50 rounded-full hidden md:flex" 
            onClick={(e) => {
                e.stopPropagation()
                prev()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 md:right-4 bg-black/30 text-white hover:bg-black/50 rounded-full hidden md:flex" 
            onClick={(e) => {
                e.stopPropagation()
                next()
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}
    </div>
  )
}