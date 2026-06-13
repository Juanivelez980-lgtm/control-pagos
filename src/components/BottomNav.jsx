import Icon from './Icon'

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: 'home' },
  { id: 'servicios', label: 'Servicios', icon: 'list' },
  { id: 'registrar', label: 'Registrar', icon: 'plus', destacado: true },
  { id: 'historial', label: 'Historial', icon: 'chart' },
]

export default function BottomNav({ activo, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom border-t border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {TABS.map((tab) => {
          const activa = activo === tab.id
          if (tab.destacado) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-1 flex-col items-center justify-center gap-1 pb-1.5"
                aria-label={tab.label}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 active:scale-90 ${
                    activa
                      ? 'bg-brand text-white shadow-lg shadow-brand/40'
                      : 'bg-brand text-white shadow-lg shadow-brand/30'
                  }`}
                >
                  <Icon name="plus" size={26} strokeWidth={2.4} />
                </span>
              </button>
            )
          }
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="group flex flex-1 flex-col items-center justify-center gap-1 pb-1.5 pt-1"
              aria-label={tab.label}
              aria-current={activa ? 'page' : undefined}
            >
              <span
                className={`flex h-7 items-center transition-colors duration-200 ${
                  activa ? 'text-brand-soft' : 'text-faint'
                }`}
              >
                <Icon name={tab.icon} size={23} strokeWidth={activa ? 2.2 : 1.9} />
              </span>
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                  activa ? 'text-brand-soft' : 'text-faint'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
