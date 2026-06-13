// Encabezado de pantalla con título grande y acción opcional a la derecha.
export default function ScreenHeader({ titulo, subtitulo, accion }) {
  return (
    <div className="safe-top px-5 pb-2 pt-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-text">{titulo}</h1>
          {subtitulo && <p className="mt-0.5 text-[14px] text-muted">{subtitulo}</p>}
        </div>
        {accion}
      </div>
    </div>
  )
}
