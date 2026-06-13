import { estadoServicio, hoyLocal } from './fechas'
import { parseFechaISO } from './format'
import { getCategoria } from '../constants/categorias'

/** Agrupa pagos por servicioId para no recalcular en cada iteración. */
export function pagosPorServicio(pagos) {
  const mapa = new Map()
  for (const p of pagos) {
    if (!mapa.has(p.servicioId)) mapa.set(p.servicioId, [])
    mapa.get(p.servicioId).push(p)
  }
  return mapa
}

/** Enriquece cada servicio con su estado de vencimiento calculado. */
export function serviciosConEstado(servicios, pagos, hoy = hoyLocal()) {
  const porServicio = pagosPorServicio(pagos)
  return servicios.map((s) => ({
    ...s,
    _estado: estadoServicio(s, porServicio.get(s.id) ?? [], hoy),
  }))
}

const ORDEN_ESTADO = { vencido: 0, 'por-vencer': 1, normal: 2, 'sin-fecha': 3, pagado: 4 }

/** Servicios activos ordenados por urgencia (vencidos primero, luego por fecha). */
export function proximosVencimientos(serviciosConE) {
  return serviciosConE
    .filter((s) => s.activo && s._estado.estado !== 'pagado' && s._estado.estado !== 'sin-fecha')
    .sort((a, b) => {
      const oa = ORDEN_ESTADO[a._estado.estado] ?? 9
      const ob = ORDEN_ESTADO[b._estado.estado] ?? 9
      if (oa !== ob) return oa - ob
      return (a._estado.diasRestantes ?? 0) - (b._estado.diasRestantes ?? 0)
    })
}

/** Pagos enriquecidos con nombre y categoría del servicio, orden más reciente primero. */
export function pagosEnriquecidos(pagos, servicios) {
  const mapa = new Map(servicios.map((s) => [s.id, s]))
  return [...pagos]
    .map((p) => {
      const s = mapa.get(p.servicioId)
      return {
        ...p,
        servicioNombre: s ? s.nombre : 'Servicio eliminado',
        categoria: s ? s.categoria : '—',
        servicioActivo: s ? s.activo : false,
      }
    })
    .sort((a, b) => {
      if (a.fechaPago !== b.fechaPago) return a.fechaPago < b.fechaPago ? 1 : -1
      return (b.createdAt ?? '') < (a.createdAt ?? '') ? -1 : 1
    })
}

/** ¿La fecha ISO cae en el mes/año de ref? */
function enMes(fechaISO, ref) {
  const d = parseFechaISO(fechaISO)
  if (!d) return false
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

/** Total pagado en el mes de `ref`. */
export function totalDelMes(pagos, ref = hoyLocal()) {
  return pagos
    .filter((p) => enMes(p.fechaPago, ref))
    .reduce((acc, p) => acc + Number(p.montoPagado || 0), 0)
}

/** Cantidad de pagos en el mes de `ref`. */
export function cantidadDelMes(pagos, ref = hoyLocal()) {
  return pagos.filter((p) => enMes(p.fechaPago, ref)).length
}

/** Desglose por categoría en el mes de `ref`: [{categoria, total, color}]. */
export function desglosePorCategoria(pagos, servicios, ref = hoyLocal()) {
  const mapaServ = new Map(servicios.map((s) => [s.id, s]))
  const acum = new Map()
  for (const p of pagos) {
    if (!enMes(p.fechaPago, ref)) continue
    const serv = mapaServ.get(p.servicioId)
    const cat = serv ? serv.categoria : 'Otros'
    acum.set(cat, (acum.get(cat) || 0) + Number(p.montoPagado || 0))
  }
  return [...acum.entries()]
    .map(([categoria, total]) => ({
      categoria,
      total,
      color: getCategoria(categoria).color,
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Gasto total por mes para los últimos N meses (incluye el actual).
 * Devuelve [{ key, label, total, date }] del más viejo al más nuevo.
 */
export function gastoPorMes(pagos, n = 6, ref = hoyLocal()) {
  const resultado = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    const total = pagos
      .filter((p) => enMes(p.fechaPago, d))
      .reduce((acc, p) => acc + Number(p.montoPagado || 0), 0)
    resultado.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      date: d,
      total,
    })
  }
  return resultado
}

/** Resumen de estados por categoría para las cards rápidas del dashboard. */
export function resumenPorCategoria(serviciosConE) {
  const mapa = new Map()
  for (const s of serviciosConE) {
    if (!s.activo) continue
    const cat = s.categoria
    if (!mapa.has(cat)) {
      mapa.set(cat, { categoria: cat, total: 0, vencidos: 0, porVencer: 0, pagados: 0 })
    }
    const r = mapa.get(cat)
    r.total++
    const e = s._estado.estado
    if (e === 'vencido') r.vencidos++
    else if (e === 'por-vencer') r.porVencer++
    else if (e === 'pagado') r.pagados++
  }
  return [...mapa.values()]
}
