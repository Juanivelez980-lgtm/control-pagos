import { parseFechaISO } from './format'

/** Hoy a medianoche local (para comparar solo por fecha). */
export function hoyLocal() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

/** Último día del mes (28-31). */
function ultimoDiaDelMes(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/** Devuelve el Date del vencimiento para un día dado dentro de un mes,
 *  recortando al último día si el mes es más corto (ej: día 31 en febrero). */
export function vencimientoEnMes(dia, year, month) {
  const ult = ultimoDiaDelMes(year, month)
  return new Date(year, month, Math.min(dia, ult))
}

/** Diferencia en días enteros entre dos fechas (b - a). */
export function diffDias(a, b) {
  const MS = 1000 * 60 * 60 * 24
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((db - da) / MS)
}

/** ¿El pago cae en el mismo mes/año que la fecha de referencia? */
function mismoMes(fechaISO, ref) {
  const d = parseFechaISO(fechaISO)
  if (!d) return false
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

/**
 * Calcula el estado de un servicio respecto a su vencimiento.
 *
 * Estados posibles:
 *  - 'sin-fecha'  : el servicio no tiene día de vencimiento configurado
 *  - 'pagado'     : ya hay un pago registrado para el ciclo de este mes
 *  - 'vencido'    : el vencimiento de este mes ya pasó y no está pagado
 *  - 'por-vencer' : faltan 7 días o menos para el vencimiento
 *  - 'normal'     : faltan más de 7 días
 *
 * Devuelve también el vencimiento relevante y los días restantes.
 */
export function estadoServicio(servicio, pagosDelServicio, hoy = hoyLocal()) {
  if (servicio.diaVencimiento == null || servicio.diaVencimiento === '') {
    const ultimoPago = ultimoPagoDe(pagosDelServicio)
    return {
      estado: 'sin-fecha',
      vencimiento: null,
      diasRestantes: null,
      ultimoPago,
    }
  }

  const dia = Number(servicio.diaVencimiento)
  const vMesActual = vencimientoEnMes(dia, hoy.getFullYear(), hoy.getMonth())
  const pagadoEsteMes = pagosDelServicio.some((p) => mismoMes(p.fechaPago, vMesActual))
  const ultimoPago = ultimoPagoDe(pagosDelServicio)

  if (pagadoEsteMes) {
    // Ya está cubierto este mes: el próximo vencimiento real es el del mes que viene.
    const sig = vencimientoEnMes(dia, hoy.getFullYear(), hoy.getMonth() + 1)
    return {
      estado: 'pagado',
      vencimiento: sig,
      diasRestantes: diffDias(hoy, sig),
      ultimoPago,
    }
  }

  const dias = diffDias(hoy, vMesActual)
  if (dias < 0) {
    return { estado: 'vencido', vencimiento: vMesActual, diasRestantes: dias, ultimoPago }
  }
  if (dias <= 7) {
    return { estado: 'por-vencer', vencimiento: vMesActual, diasRestantes: dias, ultimoPago }
  }
  return { estado: 'normal', vencimiento: vMesActual, diasRestantes: dias, ultimoPago }
}

function ultimoPagoDe(pagos) {
  if (!pagos || pagos.length === 0) return null
  return [...pagos].sort((a, b) => (a.fechaPago < b.fechaPago ? 1 : -1))[0]
}

/** Texto humano para los días restantes/vencidos. */
export function textoDias(estado, dias) {
  if (estado === 'sin-fecha') return 'Sin vencimiento'
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  if (dias > 1) return `Faltan ${dias} días`
  if (dias === -1) return 'Venció ayer'
  return `Venció hace ${Math.abs(dias)} días`
}

/** Metadatos de color/etiqueta por estado. */
export const ESTADOS = {
  pagado: { label: 'Pagado', color: 'var(--color-ok)', bg: 'var(--color-ok-dim)' },
  'por-vencer': { label: 'Por vencer', color: 'var(--color-warn)', bg: 'var(--color-warn-dim)' },
  vencido: { label: 'Vencido', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
  normal: { label: 'Al día', color: 'var(--color-muted)', bg: 'var(--color-surface-3)' },
  'sin-fecha': { label: 'Sin fecha', color: 'var(--color-faint)', bg: 'var(--color-surface-3)' },
}
