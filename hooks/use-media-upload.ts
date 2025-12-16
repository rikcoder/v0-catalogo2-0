"use client"

import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
// Importação condicional para evitar erro de SSR se necessário, mas direto geralmente funciona
import imageCompression from "browser-image-compression"

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState("")

  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    setUploading(true)
    const urls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(`Processando ${i + 1}/${files.length}...`)

        let fileToUpload = file
        
        // Compressão leve
        if (file.type.startsWith("image/")) {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            }
            fileToUpload = await imageCompression(file, options)
          } catch (e) {
            console.warn("Erro na compressão, enviando original", e)
          }
        }

        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
        const storageRef = ref(storage, `properties/${timestamp}_${safeName}`)
        
        setProgress(`Enviando ${i + 1}/${files.length}...`)
        const snapshot = await uploadBytes(storageRef, fileToUpload)
        const url = await getDownloadURL(snapshot.ref)
        urls.push(url)
      }
    } catch (error) {
      console.error("Erro no upload:", error)
      throw error
    } finally {
      setUploading(false)
      setProgress("")
    }

    return urls
  }

  return { uploadPhotos, uploading, progress }
}