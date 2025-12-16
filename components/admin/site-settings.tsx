"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/site-config"

export function SiteSettingsForm() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Configurações do Site</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-400 space-y-4">
        <p>As configurações de contato e redes sociais são gerenciadas via código para maior performance.</p>
        
        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <p><span className="font-bold text-white">WhatsApp:</span> {siteConfig.contact.whatsapp}</p>
            <p><span className="font-bold text-white">Instagram:</span> {siteConfig.social.instagram}</p>
        </div>

        <p className="text-sm text-gray-500">Para alterar, edite o arquivo <code>lib/site-config.ts</code>.</p>
      </CardContent>
    </Card>
  )
}