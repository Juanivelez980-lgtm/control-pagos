import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Cell,
  Tooltip,
} from 'recharts'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import ScreenHeader from '../components/ScreenHeader'
import CategoriaIcon from '../components/CategoriaIcon'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'
import Sheet, { ConfirmDialog } from '../components/ui/Sheet'
import { getCategoria, CATEGORIAS } from '../constants/categorias'
import {
  pagosEnriquecidos,
  gastoPorMes,
  desglosePorCategoria,
  totalDelMes,
} from '../utils/derivados'
import {
  formatMoneda,
  formatMonedaCompacta,
  formatFecha,
  formatMesCorto,
  formatMesAnio,
  parseFechaISO,
} from '../utils/format'
import { hoyLocal } from '../utils/fechas'
import { pagosACSV, descargarCSV } from '../utils/csv'

export default function Historial() {
  const { servicios, pagos, eliminarPago } = useData()
  const toast = useToast()
  const hoy = hoyLocal()

  const [filtroServicio, setFiltroServicio] = useState('todos')
  const [filtroCat, setFiltroCat] = useState('todas')
  const [detalle, setDetalle] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  const enriquecidos = useMemo(() => pagosEnriquecidos(pagos, servicios), [pagos, servicios])
  const porMes = useMemo(() => gastoPorMes(pagos, 6, hoy), [pagos, hoy])
  const desglose = useMemo(() => desglosePorCategoria(pagos, servicios, hoy), [pagos, servicios, hoy])
  const totalMes = useMemo(() => totalDelMes(pagos, hoy), [pagos, hoy])

  const filtrados = useMemo(() => {
    return enriquecidos
      .filter((p) => (filtroServicio === 'todos' ? true : p.servicioId === filtroServicio))
      .filter((p) => (filtroCat === 'todas' ? true : p.categoria === filtroCat))
  }, [enriquecidos, filtroServicio, filtroCat])

  const totalFiltrado = useMemo(
    () => filtrados.reduce((acc, p) => acc + Number(p.montoPagado || 0), 0),
    [filtrados],
  )

  const datosGrafico = porMes.map((m, i) => ({
    name: formatMesCorto(m.date),
    total: m.total,
    esActual: i === porMes.length - 1,
  }))
  const hayGasto = porMes.some((m) => m.total > 0)

  function exportar() {
    if (filtrados.length === 0) {
      toast('No hay pagos para exportar', 'error')
      return
    }
    const csv = pagosACSV(filtrados)
    const fecha = hoy.toISOString().slice(0, 10)
    descargarCSV(csv, `pagos-${fecha}.csv`)
    toast('CSV descargado')
  }

  async function confirmarEliminar() {
    if (!aEliminar) return
    await eliminarPago(aEliminar.id)
    toast('Pago eliminado')
    setDetalle(null)
    setAEliminar(null)
  }

  if (pagos.length === 0) {
    return (
      <div className="pb-28">
        <ScreenHeader titulo="Historial" />
        <div className="px-4 pt-6">
          <EmptyState
            icon="chart"
            titulo="Sin pagos todavía"
            texto="Cuando registres tu primer pago vas a ver acá el historial y los análisis de gasto."
          />
        </div>
      </div>
    )
  }

  const maxDesglose = Math.max(...desglose.map((d) => d.total), 1)

  return (
    <div className="pb-28">
      <ScreenHeader
        titulo="Historial"
        subtitulo="Análisis y registro de pagos"
        accion={
          <Button size="sm" variant="secondary" onClick={exportar}>
            <Icon name="download" size={17} />
            CSV
          </Button>
        }
      />

      <div className="space-y-5 px-4 pt-3">
        {/* Gráfico de gasto por mes */}
        <section className="rounded-3xl border border-border bg-surface p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-text">
              Gasto últimos 6 meses
            </h2>
          </div>
          {hayGasto ? (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico} margin={{ top: 14, right: 4, left: 4, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-faint)', fontSize: 11 }}
                    dy={6}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface-2)', radius: 8 }}
                    content={<TooltipMes />}
                  />
                  <Bar dataKey="total" radius={[7, 7, 7, 7]} maxBarSize={34}>
                    {datosGrafico.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.esActual ? 'var(--color-brand)' : 'var(--color-surface-3)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-[13.5px] text-faint">
              Todavía no hay datos suficientes para el gráfico.
            </p>
          )}
        </section>

        {/* Desglose por categoría del mes */}
        <section className="rounded-3xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-text">
              {capitalizar(formatMesAnio(hoy).split(' ')[0])} por categoría
            </h2>
            <span className="tnum text-[14px] font-bold text-text">
              {formatMonedaCompacta(totalMes)}
            </span>
          </div>
          {desglose.length === 0 ? (
            <p className="py-4 text-center text-[13.5px] text-faint">
              No registraste pagos este mes.
            </p>
          ) : (
            <div className="space-y-3">
              {desglose.map((d) => {
                const cat = getCategoria(d.categoria)
                const pct = Math.round((d.total / totalMes) * 100)
                return (
                  <div key={d.categoria}>
                    <div className="mb-1.5 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-muted">{cat.label}</span>
                      <span className="tnum text-text">
                        {formatMoneda(d.total)}{' '}
                        <span className="text-faint">· {pct}%</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(d.total / maxDesglose) * 100}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Filtros */}
        <div className="space-y-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
            <Chip activo={filtroCat === 'todas'} onClick={() => setFiltroCat('todas')}>
              Todas
            </Chip>
            {CATEGORIAS.map((c) => (
              <Chip
                key={c.id}
                activo={filtroCat === c.id}
                color={c.color}
                onClick={() => setFiltroCat(c.id)}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          <div className="relative">
            <select
              value={filtroServicio}
              onChange={(e) => setFiltroServicio(e.target.value)}
              className="h-11 w-full appearance-none rounded-2xl border border-border bg-surface-2 pl-4 pr-10 text-[14px] text-text focus:border-brand focus:outline-none"
            >
              <option value="todos">Todos los servicios</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>

        {/* Lista de pagos */}
        <section>
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-text">
              {filtrados.length} {filtrados.length === 1 ? 'pago' : 'pagos'}
            </h2>
            <span className="tnum text-[14px] font-semibold text-muted">
              {formatMoneda(totalFiltrado)}
            </span>
          </div>

          {filtrados.length === 0 ? (
            <p className="rounded-3xl border border-border bg-surface px-4 py-6 text-center text-[13.5px] text-faint">
              No hay pagos que coincidan con los filtros.
            </p>
          ) : (
            <div className="space-y-2.5">
              {agruparPorMes(filtrados).map(([mesLabel, items]) => (
                <div key={mesLabel}>
                  <p className="mb-1.5 mt-3 px-1 text-[12px] font-semibold uppercase tracking-wide text-faint first:mt-0">
                    {capitalizar(mesLabel)}
                  </p>
                  <div className="space-y-2.5">
                    {items.map((p) => (
                      <PagoRow key={p.id} pago={p} onTap={() => setDetalle(p)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Detalle de pago */}
      <Sheet abierto={!!detalle} onClose={() => setDetalle(null)} titulo="Detalle del pago">
        {detalle && (
          <PagoDetalle
            pago={detalle}
            onEliminar={() => setAEliminar(detalle)}
          />
        )}
      </Sheet>

      <ConfirmDialog
        abierto={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={confirmarEliminar}
        titulo="¿Eliminar pago?"
        texto="Se quitará este pago del historial. Esta acción no se puede deshacer."
        confirmar="Eliminar"
        peligro
      />
    </div>
  )
}

/* ------------------------------ Subcomponentes ------------------------------ */

function PagoRow({ pago, onTap }) {
  return (
    <button
      onClick={onTap}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition-all active:scale-[0.985] active:bg-surface-2"
    >
      <CategoriaIcon categoria={pago.categoria} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-semibold tracking-tight text-text">
          {pago.servicioNombre}
        </p>
        <p className="text-[12.5px] text-faint">{formatFecha(pago.fechaPago)}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="tnum text-[15px] font-semibold text-text">
          {formatMoneda(pago.montoPagado)}
        </span>
        <Icon name="chevronRight" size={16} className="text-faint" />
      </div>
    </button>
  )
}

function PagoDetalle({ pago, onEliminar }) {
  const cat = getCategoria(pago.categoria)
  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-3.5">
        <CategoriaIcon categoria={pago.categoria} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[19px] font-bold tracking-tight text-text">
            {pago.servicioNombre}
          </h3>
          <span className="text-[13px]" style={{ color: cat.color }}>
            {cat.label}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface-2 p-5 text-center">
        <p className="text-[13px] text-muted">Monto pagado</p>
        <p className="tnum mt-1 text-[34px] font-bold leading-none text-text">
          {formatMoneda(pago.montoPagado)}
        </p>
        <p className="mt-2 text-[13.5px] text-faint">{formatFecha(pago.fechaPago)}</p>
      </div>

      {pago.nota && (
        <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
            <Icon name="note" size={14} /> Nota
          </p>
          <p className="text-[14px] leading-relaxed text-text">{pago.nota}</p>
        </div>
      )}

      {pago.linkComprobante && (
        <a href={pago.linkComprobante} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" size="lg" full>
            <Icon name="link" size={18} />
            Ver comprobante
          </Button>
        </a>
      )}

      <button
        onClick={onEliminar}
        className="flex w-full items-center justify-center gap-2 py-2 text-[14px] font-medium text-danger active:opacity-70"
      >
        <Icon name="trash" size={17} />
        Eliminar pago
      </button>
    </div>
  )
}

function TooltipMes({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-border bg-surface-3 px-3 py-2 shadow-xl">
      <p className="tnum text-[13px] font-semibold text-text">
        {formatMoneda(payload[0].value)}
      </p>
    </div>
  )
}

function Chip({ activo, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
        activo
          ? 'border-transparent bg-surface-3 text-text'
          : 'border-border bg-transparent text-muted active:bg-surface-2'
      }`}
      style={activo && color ? { color, backgroundColor: `${color}20` } : undefined}
    >
      {children}
    </button>
  )
}

function agruparPorMes(pagos) {
  const grupos = new Map()
  for (const p of pagos) {
    const d = parseFechaISO(p.fechaPago)
    const key = d ? `${d.getFullYear()}-${d.getMonth()}` : 'otros'
    const label = d ? formatMesAnio(d) : 'Otros'
    if (!grupos.has(key)) grupos.set(key, { label, items: [] })
    grupos.get(key).items.push(p)
  }
  return [...grupos.values()].map((g) => [g.label, g.items])
}

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
