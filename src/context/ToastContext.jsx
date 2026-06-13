import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Icon from '../components/Icon'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (mensaje, tipo = 'ok') => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, mensaje, tipo }])
      setTimeout(() => dismiss(id), 2600)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] safe-top flex flex-col items-center gap-2 px-4 pt-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-border bg-surface-2/95 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur animate-slide-up"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                color:
                  t.tipo === 'error' ? 'var(--color-danger)' : 'var(--color-ok)',
                backgroundColor:
                  t.tipo === 'error'
                    ? 'var(--color-danger-dim)'
                    : 'var(--color-ok-dim)',
              }}
            >
              <Icon name={t.tipo === 'error' ? 'x' : 'check'} size={15} strokeWidth={2.6} />
            </span>
            <span className="text-[14px] font-medium text-text">{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
