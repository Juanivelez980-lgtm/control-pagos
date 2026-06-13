import Icon from './Icon'
import Badge from './ui/Badge'
import CategoriaIcon from './CategoriaIcon'
import { ESTADOS, textoDias } from '../utils/fechas'
import { formatMoneda, formatFecha } from '../utils/format'

/**
 * Card de un servicio. Muestra categoría, nombre, estado de vencimiento y
 * monto estimado. Tap abre el detalle. Si tiene link de pago, muestra el botón.
 */
export default function ServicioCard({ servicio, onTap }) {
  const e = servicio._estado
  const meta = ESTADOS[e.estado]
  const inactivo = !servicio.activo

  return (
    <button
      onClick={onTap}
      className={`w-full rounded-3xl border border-border bg-surface p-4 text-left transition-all duration-150 active:scale-[0.985] active:bg-surface-2 ${
        inactivo ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-center gap-3.5">
        <CategoriaIcon categoria={servicio.categoria} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold tracking-tight text-text">
              {servicio.nombre}
            </h3>
            {inactivo && (
              <span className="shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-faint">
                Inactivo
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            {!inactivo && (
              <Badge color={meta.color} bg={meta.bg} dot>
                {meta.label}
              </Badge>
            )}
            <span className="truncate text-[13px] text-muted">
              {e.estado === 'sin-fecha'
                ? 'Sin día de vencimiento'
                : textoDias(e.estado, e.diasRestantes)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {servicio.montoEstimado != null && (
            <span className="tnum text-[15px] font-semibold text-text">
              {formatMoneda(servicio.montoEstimado)}
            </span>
          )}
          <Icon name="chevronRight" size={18} className="text-faint" />
        </div>
      </div>

      {!inactivo && e.vencimiento && e.estado !== 'sin-fecha' && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/70 pt-2.5 text-[12.5px] text-faint">
          <Icon name="calendar" size={14} />
          <span>
            {e.estado === 'pagado' ? 'Próximo vence' : 'Vence'} el{' '}
            {formatFecha(e.vencimiento)}
          </span>
        </div>
      )}
    </button>
  )
}
