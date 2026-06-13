import { useState } from 'react'
import { Field, Input, Select, Label } from './ui/Field'
import Button from './ui/Button'
import { CATEGORIAS } from '../constants/categorias'
import { esURLValida, normalizarURL, parseMonto } from '../utils/validacion'

const VACIO = {
  nombre: '',
  categoria: CATEGORIAS[0].id,
  montoEstimado: '',
  diaVencimiento: '',
  linkPago: '',
  identificador: '',
  activo: true,
}

/** Formulario para crear o editar un servicio. `servicio` null = crear. */
export default function ServicioForm({ servicio, onGuardar, onClose }) {
  const [form, setForm] = useState(() =>
    servicio
      ? {
          nombre: servicio.nombre ?? '',
          categoria: servicio.categoria ?? CATEGORIAS[0].id,
          montoEstimado: servicio.montoEstimado ?? '',
          diaVencimiento: servicio.diaVencimiento ?? '',
          linkPago: servicio.linkPago ?? '',
          identificador: servicio.identificador ?? '',
          activo: servicio.activo ?? true,
        }
      : VACIO,
  )
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const set = (campo) => (e) => {
    const valor = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [campo]: valor }))
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: null }))
  }

  function validar() {
    const er = {}
    if (!form.nombre.trim()) er.nombre = 'Poné un nombre para el servicio'

    if (form.montoEstimado !== '' && form.montoEstimado != null) {
      const m = parseMonto(form.montoEstimado)
      if (m == null || m < 0) er.montoEstimado = 'Ingresá un monto válido'
    }

    if (form.diaVencimiento !== '' && form.diaVencimiento != null) {
      const d = Number(form.diaVencimiento)
      if (!Number.isInteger(d) || d < 1 || d > 31)
        er.diaVencimiento = 'Debe ser un día entre 1 y 31'
    }

    if (!esURLValida(form.linkPago)) er.linkPago = 'El link no parece válido'

    setErrores(er)
    return Object.keys(er).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      const m = parseMonto(form.montoEstimado)
      await onGuardar({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        montoEstimado: m,
        diaVencimiento:
          form.diaVencimiento === '' || form.diaVencimiento == null
            ? null
            : Number(form.diaVencimiento),
        linkPago: normalizarURL(form.linkPago),
        identificador: form.identificador.trim(),
        activo: form.activo,
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 pb-4">
      <Field label="Nombre" error={errores.nombre} htmlFor="nombre">
        <Input
          id="nombre"
          placeholder="Ej: Luz - Edemsa"
          value={form.nombre}
          onChange={set('nombre')}
          error={errores.nombre}
          autoComplete="off"
        />
      </Field>

      <Field label="Categoría" htmlFor="categoria">
        <Select id="categoria" value={form.categoria} onChange={set('categoria')}>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Monto estimado" hint="opcional" error={errores.montoEstimado}>
          <Input
            inputMode="decimal"
            placeholder="0"
            prefix="$"
            value={form.montoEstimado}
            onChange={set('montoEstimado')}
            error={errores.montoEstimado}
          />
        </Field>
        <Field label="Día de venc." hint="1-31" error={errores.diaVencimiento}>
          <Input
            inputMode="numeric"
            placeholder="Ej: 10"
            value={form.diaVencimiento}
            onChange={set('diaVencimiento')}
            error={errores.diaVencimiento}
          />
        </Field>
      </div>

      <Field label="Link de pago" hint="opcional" error={errores.linkPago}>
        <Input
          inputMode="url"
          placeholder="www.edemsa.com"
          value={form.linkPago}
          onChange={set('linkPago')}
          error={errores.linkPago}
          autoCapitalize="none"
          autoComplete="off"
        />
      </Field>

      <Field label="Identificador" hint="nro cliente / padrón — opcional">
        <Input
          placeholder="Ej: Nº de cuenta 0012345"
          value={form.identificador}
          onChange={set('identificador')}
          autoComplete="off"
        />
      </Field>

      {/* Toggle activo */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3.5">
        <div>
          <Label>Servicio activo</Label>
          <p className="text-[13px] text-faint">Los inactivos no aparecen en vencimientos</p>
        </div>
        <button
          type="button"
          onClick={() => set('activo')(!form.activo)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
            form.activo ? 'bg-brand' : 'bg-surface-3'
          }`}
          role="switch"
          aria-checked={form.activo}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
              form.activo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" size="lg" onClick={onClose} type="button" className="flex-1">
          Cancelar
        </Button>
        <Button variant="primary" size="lg" type="submit" className="flex-[1.4]" disabled={guardando}>
          {guardando ? 'Guardando…' : servicio ? 'Guardar cambios' : 'Crear servicio'}
        </Button>
      </div>
    </form>
  )
}
