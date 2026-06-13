/** Valida que un texto sea una URL http(s) razonable. Vacío = válido (opcional). */
export function esURLValida(valor) {
  if (!valor || !valor.trim()) return true
  let v = valor.trim()
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v
  try {
    const u = new URL(v)
    return !!u.hostname && u.hostname.includes('.')
  } catch {
    return false
  }
}

/** Normaliza una URL agregando https:// si falta el protocolo. */
export function normalizarURL(valor) {
  if (!valor || !valor.trim()) return ''
  const v = valor.trim()
  if (!/^https?:\/\//i.test(v)) return 'https://' + v
  return v
}

/** Convierte texto de monto ("1.234,56" o "1234.56") a número, o null. */
export function parseMonto(valor) {
  if (valor == null || valor === '') return null
  if (typeof valor === 'number') return valor
  // Quita separadores de miles (.) y usa . como decimal
  const limpio = String(valor).trim().replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}
