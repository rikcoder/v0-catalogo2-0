// lib/site-config.ts

export const siteConfig = {
  name: "RA Broker",
  description: "Encontre o imóvel dos seus sonhos em Porteirinha e região.",
  url: "https://catalogo.rabroker.com.br/",
  
  // CAMINHO DA LOGO: Coloque seu arquivo na pasta 'public'
  // Exemplo: se o arquivo for 'public/logo-ra.png', coloque '/logo-ra.png' aqui.
  // Se deixar vazio (""), o site vai mostrar o ícone de prédio padrão.
  logoUrl: "/logo-icon.svg", 
  
  contact: {
    whatsapp: "5538998969795", 
    phone: "(38) 99114-9718",
    email: "ricardoaaguiarbroker@gmail.com",
    address: "Praça Cel. Odilon Coelho, 400 - Centro, Porteirinha - MG, 39520-000, Brasil"
  },

  social: {
    instagram: "https://www.instagram.com/ricardoaguiar_broker",
    whatsapp: "https://wa.me/5538998969795",
    facebook: "https://facebook.com/ricardoaguiarbroker",
    youtube: "https://youtube.com/@seu_canal",
    linkedin: "https://linkedin.com/in/seu_perfil"
  },

  nav: [
    { title: "Início", href: "/" },
    { title: "Imóveis", href: "/imoveis" },
  ]
}