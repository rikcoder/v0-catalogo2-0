export async function fetchSettings() {
  // Retorna configurações padrão por enquanto
  return {
    locations: {
      neighborhoods: [],
      streets: [],
      cities: []
    }
  }
}