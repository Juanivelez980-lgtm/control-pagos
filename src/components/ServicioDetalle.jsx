import Icon from './Icon'
import Badge from './ui/Badge'
import Button from './ui/Button'
import CategoriaIcon from './CategoriaIcon'
import { getCategoria } from '../constants/categorias'
import { ESTADOS, textoDias } from '../utils/fechas'
import { formatMoneda, formatFecha } from '../utils/format'

function Dato({ label, children, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[14px] text-muted">{label}</span>
      <span className={`text-[14px] font-medium text-text ${mono ? 'tnum' : ''}`}>{children}</span>
    </div>
  )
}

export default function ServicioDetalle({
  servicio,
  pagosDelServicio,
  onEditar,
  onEliminar,
  onToggleActivo,
  onRegistrarPago,
}) {
  const e = servicio._estado
  const meta = ESTADOS[e.estado]
  const cat = getCategoria(servicio.categoria)
  const ultimos = [...pagosDelServicio]
    .sort((a, b) => (a.fechaPago < b.fechaPago ? 1 : -1))
    .slice(0, 3)

  return (
    <div className="space-y-5 pb-4">
      {/* Cabecera */}
      <div className="flex items-center gap-3.5">
        <CategoriaIcon categoria={servicio.categoria} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[19px] font-bold tracking-tight text-text">
            {servicio.nombre}
          </h3>
          <span className="text-[13px]" style={{ color: cat.color }}>
            {cat.label}
          </span>
        </div>
      </div>

      {/* Estado */}
      {servicio.activo ? (
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ backgroundColor: meta.bg }}
        >
          <Badge color={meta.color} bg="transparent" dot className="px-0">
            {meta.label}
          </Badge>
          <span className="text-[13.5px] font-medium" style={{ color: meta.color }}>
            {e.estado === 'sin-fecha' ? 'Sin vencimiento' : textoDias(e.estado, e.diasRestantes)}
          </span>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-2 px-4 py-3 text-[13.5px] text-faint">
          Este servicio está inactivo.
        </div>
      )}

      {/* Botón ir a pagar */}
      {servicio.linkPago && (
        <a href={servicio.linkPago} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" size="lg" full>
            <Icon name="external" size={19} />
            Ir a pagar
          </Button>
        </a>
      )}

      {/* Datos */}
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface-2 px-4">
        {servicio.montoEstimado != null && (
          <Dato label="Monto estimado" mono>
            {formatMoneda(servicio.montoEstimado)}
          </Dato>
        )}
        {servicio.diaVencimiento != null && (
          <Dato label="Día de vencimiento">{servicio.diaVencimiento} de cada mes</Dato>
        )}
        {e.vencimiento && e.estado !== 'sin-fecha' && (
          <Dato label="Próximo vencimiento" mono>
            {formatFecha(e.vencimiento)}
          </Dato>
        )}
        {servicio.identificador && <Dato label="Identificador">{servicio.identificador}</Dato>}
        {servicio.montoEstimado == null &&
          servicio.diaVencimiento == null &&
          !servicio.identificador && (
            <p className="py-3 text-center text-[13px] text-faint">Sin datos adicionales</p>
          )}
      </div>

      {/* Últimos pagos */}
      <div>
        <h4 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-faint">
          Últimos pagos
        </h4>
        {ultimos.length === 0 ? (
          <p className="rounded-2xl bg-surface-2 px-4 py-3.5 text-[13.5px] text-faint">
            Todavía no registraste pagos de este servicio.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface-2 px-4">
            {ultimos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <span className="text-[14px] text-muted">{formatFecha(p.fechaPago)}</span>
                <span className="tnum text-[14px] font-semibold text-text">
                  {formatMoneda(p.montoPagado)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acción principal */}
      <Button variant="primary" size="lg" full onClick={onRegistrarPago}>
        <Icon name="wallet" size={19} />
        Registrar un pago
      </Button>

      {/* Acciones secundarias */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onEditar}>
          <Icon name="edit" size={18} />
          Editar
        </Button>
        <Button variant="secondary" onClick={onToggleActivo}>
          <Icon name="power" size={18} />
          {servicio.activo ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
      <button
        onClick={onEliminar}
        className="flex w-full items-center justify-center gap-2 py-2 text-[14px] font-medium text-danger active:opacity-70"
      >
        <Icon name="trash" size={17} />
        Eliminar servicio
      </button>
    </div>
  )
}
