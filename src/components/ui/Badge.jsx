// Chip/badge de estado. Usa colores via CSS custom props (estilos inline) para
// poder pasar cualquier color de estado o categoría.

export default function Badge({ color, bg, children, dot = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  )
}
