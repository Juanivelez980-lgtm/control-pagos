// Categorías de servicios. El orden define cómo aparecen en selects y resúmenes.
export const CATEGORIAS = [
  {
    id: 'Servicios públicos',
    label: 'Servicios públicos',
    color: '#fbbf24', // ámbar
    icon: 'bolt',
  },
  {
    id: 'Impuestos',
    label: 'Impuestos',
    color: '#f87171', // rojo
    icon: 'building',
  },
  {
    id: 'Internet/Telefonía',
    label: 'Internet / Telefonía',
    color: '#38bdf8', // celeste
    icon: 'wifi',
  },
  {
    id: 'Tarjetas/Préstamos',
    label: 'Tarjetas / Préstamos',
    color: '#a78bfa', // violeta
    icon: 'card',
  },
]

export const CATEGORIA_IDS = CATEGORIAS.map((c) => c.id)

export function getCategoria(id) {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]
}
