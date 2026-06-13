import { useEffect } from 'react'
import Icon from '../Icon'

/**
 * Bottom sheet modal: aparece deslizándose desde abajo. Se cierra tocando el
 * backdrop o el botón X. Bloquea el scroll del fondo mientras está abierto.
 */
export default function Sheet({ abierto, onClose, titulo, children, footer }) {
  useEffect(() => {
    if (abierto) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onClose])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[92dvh] flex-col rounded-t-[1.75rem] border-t border-border bg-surface animate-sheet-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-3.5">
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border-strong" />
          <h2 className="text-[18px] font-semibold tracking-tight text-text">{titulo}</h2>
          <button
            onClick={onClose}
            className="-mr-1.5 flex h-9 w-9 items-center justify-center rounded-full text-muted active:bg-surface-2"
            aria-label="Cerrar"
          >
            <Icon name="x" size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-2">{children}</div>
        {footer && (
          <div className="safe-bottom border-t border-border bg-surface px-5 pb-3 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/** Diálogo de confirmación centrado (para acciones destructivas). */
export function ConfirmDialog({
  abierto,
  onClose,
  onConfirm,
  titulo,
  texto,
  confirmar = 'Confirmar',
  peligro = false,
}) {
  useEffect(() => {
    if (abierto) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [abierto])

  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-surface p-6 animate-scale-in">
        <h3 className="text-[18px] font-semibold text-text">{titulo}</h3>
        {texto && <p className="mt-2 text-[14px] leading-relaxed text-muted">{texto}</p>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="h-12 flex-1 rounded-2xl bg-surface-3 font-semibold text-text active:bg-border-strong"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`h-12 flex-1 rounded-2xl font-semibold active:opacity-80 ${
              peligro ? 'bg-danger-dim text-danger' : 'bg-brand text-white'
            }`}
          >
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
