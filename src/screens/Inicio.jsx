import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import ScreenHeader from '../components/ScreenHeader'
import CategoriaIcon from '../components/CategoriaIcon'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/Icon'
import { getCategoria } from '../constants/categorias'
import { ESTADOS, textoDias, hoyLocal } from '../utils/fechas'
import { formatMonedaCompacta, formatMoneda, formatMesAnio } from '../utils/format'
import {
  serviciosConEstado,
  proximosVencimientos,
  totalDelMes,
  cantidadDelMes,
  resumenPorCategoria,
} from '../utils/derivados'

export default function Inicio({ onRegistrarPago, onIrAServicios }) {
  const { servicios, pagos } = useData()
  const hoy = hoyLocal()

  const conEstado = useMemo(() => serviciosConEstado(servicios, pagos, hoy), [servicios, pagos, hoy])
  const proximos = useMemo(() => proximosVencimientos(conEstado), [conEstado])
  const total = useMemo(() => totalDelMes(pagos, hoy), [pagos, hoy])
  const cantMes = useMemo(() => cantidadDelMes(pagos, hoy), [pagos, hoy])
  const resumenCat = useMemo(() => resumenPorCategoria(conEstado), [conEstado])

  const vencidos = proximos.filter((s) => s._estado.estado === 'vencido').length
  const porVencer = proximos.filter((s) => s._estado.estado === 'por-vencer').length

  const sinDatos = servicios.length === 0 && pagos.length === 0

  return (
    <div className="pb-28">
      <ScreenHeader titulo="Inicio" subtitulo={capitalizar(formatMesAnio(hoy))} />

      {sinDatos ? (
        <div className="px-4 pt-6">
          <EmptyState
            icon="sparkle"
            titulo="¡Bienvenido!"
            texto="Empezá cargando tus servicios para llevar el control de todos tus pagos en un solo lugar."
            accion={
              <Button onClick={onIrAServicios}>
                <Icon name="plus" size={18} strokeWidth={2.4} />
                Cargar mi primer servicio
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-5 px-4 pt-3">
          {/* Hero: total del mes */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-2 to-surface p-5 animate-slide-up">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
              style={{ background: 'radial-gradient(circle, var(--color-brand) 0%, transparent 70%)' }}
            />
            <div className="flex items-center gap-2 text-muted">
              <Icon name="wallet" size={17} />
              <span className="text-[13.5px] font-medium">Pagado este mes</span>
            </div>
            <p className="tnum mt-2 text-[42px] font-bold leading-none tracking-tight text-text">
              {formatMonedaCompacta(total)}
            </p>
            <p className="mt-2 text-[13.5px] text-muted">
              {cantMes === 0
                ? 'Todavía no registraste pagos este mes'
                : `${cantMes} ${cantMes === 1 ? 'pago registrado' : 'pagos registrados'} en ${formatMesAnio(hoy).split(' ')[0]}`}
            </p>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 gap-3">
            <StatPill
              valor={porVencer}
              label={porVencer === 1 ? 'Por vencer' : 'Por vencer'}
              color="var(--color-warn)"
              bg="var(--color-warn-dim)"
              icon="clock"
            />
            <StatPill
              valor={vencidos}
              label={vencidos === 1 ? 'Vencido' : 'Vencidos'}
              color="var(--color-danger)"
              bg="var(--color-danger-dim)"
              icon="bolt"
            />
          </div>

          {/* Próximos vencimientos */}
          <section>
            <div className="mb-2.5 flex items-center justify-between px-1">
              <h2 className="text-[16px] font-semibold tracking-tight text-text">
                Próximos vencimientos
              </h2>
              {proximos.length > 5 && (
                <span className="text-[13px] text-faint">{proximos.length} en total</span>
              )}
            </div>

            {proximos.length === 0 ? (
              <div className="flex items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ok-dim text-ok">
                  <Icon name="checkCircle" size={24} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-text">¡Todo al día!</p>
                  <p className="text-[13px] text-muted">No tenés vencimientos pendientes.</p>
                </div>
              </div>
            ) : (
              <div className="stagger space-y-2.5">
                {proximos.slice(0, 5).map((s) => (
                  <VencimientoItem key={s.id} servicio={s} onPagar={() => onRegistrarPago(s.id)} />
                ))}
              </div>
            )}
          </section>

          {/* Estado por categoría */}
          {resumenCat.length > 0 && (
            <section>
              <h2 className="mb-2.5 px-1 text-[16px] font-semibold tracking-tight text-text">
                Por categoría
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {resumenCat.map((r) => (
                  <CategoriaCard key={r.categoria} resumen={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function StatPill({ valor, label, color, bg, icon }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4 animate-slide-up">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ color, backgroundColor: bg }}
      >
        <Icon name={icon} size={19} />
      </span>
      <p className="tnum mt-3 text-[28px] font-bold leading-none text-text">{valor}</p>
      <p className="mt-1 text-[13px] text-muted">{label}</p>
    </div>
  )
}

function VencimientoItem({ servicio, onPagar }) {
  const e = servicio._estado
  const meta = ESTADOS[e.estado]
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-3.5">
      <CategoriaIcon categoria={servicio.categoria} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-tight text-text">
          {servicio.nombre}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge color={meta.color} bg={meta.bg} dot>
            {textoDias(e.estado, e.diasRestantes)}
          </Badge>
          {servicio.montoEstimado != null && (
            <span className="tnum text-[12.5px] text-faint">
              {formatMoneda(servicio.montoEstimado)}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onPagar}
        className="flex h-9 shrink-0 items-center gap-1 rounded-xl bg-brand px-3 text-[13px] font-semibold text-white shadow-md shadow-brand/25 active:scale-95"
      >
        Pagar
      </button>
    </div>
  )
}

function CategoriaCard({ resumen }) {
  const cat = getCategoria(resumen.categoria)
  const alDia = resumen.vencidos === 0 && resumen.porVencer === 0
  return (
    <div className="rounded-3xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <CategoriaIcon categoria={resumen.categoria} size={38} />
        <span className="tnum text-[13px] font-medium text-faint">
          {resumen.total} {resumen.total === 1 ? 'serv.' : 'serv.'}
        </span>
      </div>
      <p className="mt-3 truncate text-[14px] font-semibold tracking-tight text-text">{cat.label}</p>
      <p className="mt-0.5 text-[12.5px]" style={{ color: alDia ? 'var(--color-ok)' : meta(resumen) }}>
        {estadoTexto(resumen)}
      </p>
    </div>
  )
}

function meta(r) {
  if (r.vencidos > 0) return 'var(--color-danger)'
  if (r.porVencer > 0) return 'var(--color-warn)'
  return 'var(--color-ok)'
}

function estadoTexto(r) {
  if (r.vencidos > 0) return `${r.vencidos} ${r.vencidos === 1 ? 'vencido' : 'vencidos'}`
  if (r.porVencer > 0) return `${r.porVencer} por vencer`
  return 'Todo al día'
}

function capitalizar(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
