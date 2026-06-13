import Icon from '../Icon'

export default function EmptyState({ icon = 'inbox', titulo, texto, accion }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-14 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-muted">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="text-[17px] font-semibold text-text">{titulo}</h3>
      {texto && <p className="mt-1.5 max-w-[16rem] text-[14px] leading-relaxed text-muted">{texto}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
