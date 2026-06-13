import Icon from './Icon'
import { getCategoria } from '../constants/categorias'

/** Ícono de categoría con su color, dentro de un cuadrado redondeado teñido. */
export default function CategoriaIcon({ categoria, size = 44 }) {
  const cat = getCategoria(categoria)
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        backgroundColor: `${cat.color}1f`,
        color: cat.color,
      }}
    >
      <Icon name={cat.icon} size={Math.round(size * 0.5)} />
    </span>
  )
}
