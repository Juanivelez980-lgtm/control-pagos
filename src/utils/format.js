// Formateo argentino: moneda ARS ($1.234.567,89) y fechas (dd/mm/aaaa).

const monedaFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const monedaCompactaFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** $1.234.567,89 */
export function formatMoneda(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '$0,00'
  return monedaFmt.format(n)
}

/** $1.234.568 (sin centavos, para números grandes destacados) */
export function formatMonedaCompacta(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '$0'
  return monedaCompactaFmt.format(n)
}

/** Solo el número con separadores, sin símbolo: 1.234.567,89 */
export function formatNumero(valor) {
  const n = Number(valor)
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/* ============================== FECHAS ============================== */

const diasSemana = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]

const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const mesesCorto = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

/** Convierte "YYYY-MM-DD" a un Date local (sin corrimiento de zona horaria). */
export function parseFechaISO(iso) {
  if (!iso) return null
  if (iso instanceof Date) return iso
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Date -> "YYYY-MM-DD" (local) */
export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** dd/mm/aaaa */
export function formatFecha(iso) {
  const d = parseFechaISO(iso)
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${m}/${d.getFullYear()}`
}

/** "12 de junio" */
export function formatFechaLarga(iso) {
  const d = parseFechaISO(iso)
  if (!d) return ''
  return `${d.getDate()} de ${meses[d.getMonth()]}`
}

/** "vie 12 jun" */
export function formatFechaCorta(iso) {
  const d = parseFechaISO(iso)
  if (!d) return ''
  const dia = diasSemana[d.getDay()].slice(0, 3)
  return `${dia} ${d.getDate()} ${mesesCorto[d.getMonth()]}`
}

/** "junio 2026" */
export function formatMesAnio(date) {
  const d = date instanceof Date ? date : parseFechaISO(date)
  if (!d) return ''
  return `${meses[d.getMonth()]} ${d.getFullYear()}`
}

/** "jun 26" (compacto para ejes de gráficos) */
export function formatMesCorto(date) {
  const d = date instanceof Date ? date : parseFechaISO(date)
  if (!d) return ''
  return `${mesesCorto[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

export { meses, mesesCorto, diasSemana }
