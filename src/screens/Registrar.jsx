import { useEffect, useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import ScreenHeader from '../components/ScreenHeader'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Icon from '../components/Icon'
import CategoriaIcon from '../components/CategoriaIcon'
import { CATEGORIAS } from '../constants/categorias'
import { toISODate, formatMoneda, formatFecha } from '../utils/format'
import { esURLValida, normalizarURL, parseMonto } from '../utils/validacion'

export default function Registrar({ preseleccion, onConsumirPreseleccion, onIrAServicios }) {
  const { servicios, crearPago } = useData()
  const toast = useToast()

  const activos = useMemo(
    () => servicios.filter((s) => s.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [servicios],
  )

  const [servicioId, setServicioId] = useState('')
  const [fecha, setFecha] = useState(() => toISODate(new Date()))
  const [monto, setMonto] = useState('')
  const [link, setLink] = useState('')
  const [nota, setNota] = useState('')
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)

  const servicioSel = activos.find((s) => s.id === servicioId)

  // Preseleccionar servicio cuando se entra desde el detalle
  useEffect(() => {
    if (preseleccion) {
      setServicioId(preseleccion)
      const serv = servicios.find((s) => s.id === preseleccion)
      if (serv?.montoEstimado != null) setMonto(String(serv.montoEstimado))
      onConsumirPreseleccion?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preseleccion])

  function onCambiarServicio(e) {
    const id = e.target.value
    setServicioId(id)
    setErrores((er) => ({ ...er, servicioId: null }))
    // Sugerir el monto estimado si el campo está vacío
    const serv = activos.find((s) => s.id === id)
    if (serv?.montoEstimado != null && !monto) setMonto(String(serv.montoEstimado))
  }

  function validar() {
    const er = {}
    if (!servicioId) er.servicioId = 'Elegí un servicio'
    if (!fecha) er.fecha = 'Indicá la fecha de pago'
    const m = parseMonto(monto)
    if (m == null || m <= 0) er.monto = 'Ingresá un monto válido'
    if (!esURLValida(link)) er.link = 'El link no parece válido'
    setErrores(er)
    return Object.keys(er).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await crearPago({
        servicioId,
        fechaPago: fecha,
        montoPagado: parseMonto(monto),
        linkComprobante: normalizarURL(link),
        nota: nota.trim(),
      })
      setExito(true)
      setTimeout(() => {
        setExito(false)
        // Reset
        setServicioId('')
        setMonto('')
        setLink('')
        setNota('')
        setFecha(toISODate(new Date()))
        setErrores({})
      }, 1500)
    } catch {
      toast('No se pudo guardar el pago', 'error')
    } finally {
      setGuardando(false)
    }
  }

  if (activos.length === 0) {
    return (
      <div className="pb-28">
        <ScreenHeader titulo="Registrar pago" />
        <div className="px-4 pt-6">
          <EmptyState
            icon="wallet"
            titulo="Primero creá un servicio"
            texto="Para registrar un pago necesitás tener al menos un servicio activo cargado."
            accion={
              <Button onClick={onIrAServicios}>
                <Icon name="list" size={18} />
                Ir a Servicios
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-28">
      <ScreenHeader titulo="Registrar pago" subtitulo="Anotá un pago que ya hiciste" />

      <form onSubmit={submit} className="space-y-4 px-4 pt-3">
        <Field label="Servicio" error={errores.servicioId}>
          <Select value={servicioId} onChange={onCambiarServicio} error={errores.servicioId}>
            <option value="" disabled>
              Elegí un servicio…
            </option>
            {CATEGORIAS.map((cat) => {
              const delGrupo = activos.filter((s) => s.categoria === cat.id)
              if (delGrupo.length === 0) return null
              return (
                <optgroup key={cat.id} label={cat.label}>
                  {delGrupo.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </Select>
        </Field>

        {servicioSel && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 animate-fade-in">
            <CategoriaIcon categoria={servicioSel.categoria} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-text">{servicioSel.nombre}</p>
              {servicioSel.montoEstimado != null && (
                <p className="text-[13px] text-muted">
                  Estimado: <span className="tnum">{formatMoneda(servicioSel.montoEstimado)}</span>
                </p>
              )}
            </div>
            {servicioSel.linkPago && (
              <a
                href={servicioSel.linkPago}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-xl bg-surface-3 px-3 text-[13px] font-medium text-brand-soft active:opacity-80"
              >
                Pagar <Icon name="external" size={15} />
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de pago" error={errores.fecha}>
            <Input
              type="date"
              value={fecha}
              max={toISODate(new Date())}
              onChange={(e) => setFecha(e.target.value)}
              error={errores.fecha}
              className="tnum"
            />
          </Field>
          <Field label="Monto pagado" error={errores.monto}>
            <Input
              inputMode="decimal"
              placeholder="0"
              prefix="$"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              error={errores.monto}
            />
          </Field>
        </div>

        <Field label="Link de comprobante" hint="opcional" error={errores.link}>
          <Input
            inputMode="url"
            placeholder="Pegá el link del comprobante"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            error={errores.link}
            autoCapitalize="none"
            autoComplete="off"
          />
        </Field>

        <Field label="Nota" hint="opcional">
          <Textarea
            placeholder="Nº de trámite, observaciones…"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </Field>

        <Button variant="primary" size="lg" full type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar pago'}
        </Button>
      </form>

      {/* Overlay de confirmación */}
      {exito && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ok-dim animate-pop">
              <Icon name="check" size={52} strokeWidth={3} style={{ color: 'var(--color-ok)' }} />
            </div>
            <p className="mt-5 text-[18px] font-semibold text-text">¡Pago registrado!</p>
            {servicioSel && (
              <p className="mt-1 text-[14px] text-muted">
                {servicioSel.nombre} · {formatMoneda(parseMonto(monto) || 0)}
              </p>
            )}
            <p className="mt-0.5 text-[13px] text-faint">{formatFecha(fecha)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
