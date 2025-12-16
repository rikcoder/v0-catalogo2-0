export function searchProperties(properties: any[], searchTerm: string) {
  if (!searchTerm) return properties
  
  // Remove acentos e deixa minúsculo para facilitar a busca
  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const term = normalize(searchTerm)
  
  return properties.filter(property => {
    // Traduz categorias para o português para permitir a busca
    const categoryMap: Record<string, string> = {
      house: "casa sobrado residencial",
      apartment: "apartamento ape flat",
      land: "lote terreno",
      commercial: "comercial loja sala galpao",
      rural: "rural chácara fazenda sítio",
      other: "outro imóvel"
    }

    const categoryTerms = categoryMap[property.category] || ""

    // Monta o "texto pesquisável" juntando tudo
    const searchString = normalize(`
      ${property.neighborhood || ''} 
      ${property.city || ''} 
      ${property.street || ''} 
      ${property.location || ''}
      ${property.description || ''}
      ${categoryTerms}
    `)
    
    return searchString.includes(term)
  })
}