import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import ScreenHeader from '../components/ScreenHeader'
import ServicioCard from '../components/ServicioCard'
import ServicioForm from '../components/ServicioForm'
import ServicioDetalle from '../components/ServicioDetalle'
import Sheet, { ConfirmDialog } from '../components/ui/Sheet'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'
import { CATEGORIAS } from '../constants/categorias'
import { serviciosConEstado, pagosPorServicio } from '../utils/derivados'

export default function Servicios({ onRegistrarPago }) {
  const { servicios, pagos, crearServicio, editarServicio, eliminarServicio } = useData()
  const toast = useToast()

  const [filtroCat, setFiltroCat] = useState('todas')
  const [verInactivos, setVerInactivos] = useState(false)

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState(null) // servicio a editar
  const [detalleId, setDetalleId] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  const conEstado = useMemo(() => serviciosConEstado(servicios, pagos), [servicios, pagos])
  const porServicio = useMemo(() => pagosPorServicio(pagos), [pagos])

  const visibles = useMemo(() => {
    return conEstado
      .filter((s) => (verInactivos ? true : s.activo))
      .filter((s) => (filtroCat === 'todas' ? true : s.categoria === filtroCat))
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1
        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }, [conEstado, filtroCat, verInactivos])

  const detalle = detalleId ? conEstado.find((s) => s.id === detalleId) : null

  function abrirCrear() {
    setEditando(null)
    setFormAbierto(true)
  }
  function abrirEditar(servicio) {
    setEditando(servicio)
    setDetalleId(null)
    setFormAbierto(true)
  }

  async function guardar(data) {
    if (editando) {
      await editarServicio(editando.id, data)
      toast('Servicio actualizado')
    } else {
      await crearServicio(data)
      toast('Servicio creado')
    }
    setFormAbierto(false)
    setEditando(null)
  }

  async function toggleActivo(servicio) {
    await editarServicio(servicio.id, { activo: !servicio.activo })
    toast(servicio.activo ? 'Servicio desactivado' : 'Servicio activado')
  }

  async function confirmarEliminar() {
    if (!aEliminar) return
    await eliminarServicio(aEliminar.id)
    toast('Servicio eliminado')
    setDetalleId(null)
    setAEliminar(null)
  }

  const totalActivos = conEstado.filter((s) => s.activo).length

  return (
    <div className="pb-28">
      <ScreenHeader
        titulo="Servicios"
        subtitulo={`${totalActivos} ${totalActivos === 1 ? 'servicio activo' : 'servicios activos'}`}
        accion={
          <Button size="sm" onClick={abrirCrear}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Nuevo
          </Button>
        }
      />

      {/* Filtros por categoría */}
      {servicios.length > 0 && (
        <div className="no-scrollbar -mx-1 mt-1 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip activo={filtroCat === 'todas'} onClick={() => setFiltroCat('todas')}>
            Todas
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip
              key={c.id}
              activo={filtroCat === c.id}
              color={c.color}
              onClick={() => setFiltroCat(c.id)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      )}

      <div className="px-4 pt-3">
        {visibles.length === 0 ? (
          servicios.length === 0 ? (
            <EmptyState
              icon="list"
              titulo="Todavía no hay servicios"
              texto="Agregá los servicios que pagás todos los meses (luz, gas, internet…) para empezar a controlarlos."
              accion={
                <Button onClick={abrirCrear}>
                  <Icon name="plus" size={18} strokeWidth={2.4} />
                  Agregar primer servicio
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon="search"
              titulo="Nada por acá"
              texto="No hay servicios que coincidan con el filtro."
            />
          )
        ) : (
          <div className="stagger space-y-3">
            {visibles.map((s) => (
              <ServicioCard key={s.id} servicio={s} onTap={() => setDetalleId(s.id)} />
            ))}
          </div>
        )}

        {/* Mostrar inactivos */}
        {conEstado.some((s) => !s.activo) && (
          <button
            onClick={() => setVerInactivos((v) => !v)}
            className="mx-auto mt-5 flex items-center gap-1.5 px-4 py-2 text-[13.5px] font-medium text-muted active:opacity-70"
          >
            {verInactivos ? 'Ocultar inactivos' : 'Ver servicios inactivos'}
            <Icon name={verInactivos ? 'chevronDown' : 'chevronRight'} size={16} />
          </button>
        )}
      </div>

      {/* Sheet: crear / editar */}
      <Sheet
        abierto={formAbierto}
        onClose={() => {
          setFormAbierto(false)
          setEditando(null)
        }}
        titulo={editando ? 'Editar servicio' : 'Nuevo servicio'}
      >
        <ServicioForm
          servicio={editando}
          onGuardar={guardar}
          onClose={() => {
            setFormAbierto(false)
            setEditando(null)
          }}
        />
      </Sheet>

      {/* Sheet: detalle */}
      <Sheet abierto={!!detalle} onClose={() => setDetalleId(null)} titulo="Detalle del servicio">
        {detalle && (
          <ServicioDetalle
            servicio={detalle}
            pagosDelServicio={porServicio.get(detalle.id) ?? []}
            onEditar={() => abrirEditar(detalle)}
            onToggleActivo={() => {
              toggleActivo(detalle)
            }}
            onEliminar={() => setAEliminar(detalle)}
            onRegistrarPago={() => {
              const id = detalle.id
              setDetalleId(null)
              onRegistrarPago(id)
            }}
          />
        )}
      </Sheet>

      <ConfirmDialog
        abierto={!!aEliminar}
        onClose={() => setAEliminar(null)}
        onConfirm={confirmarEliminar}
        titulo="¿Eliminar servicio?"
        texto={`Se eliminará "${aEliminar?.nombre}" y todos sus pagos registrados. Esta acción no se puede deshacer.`}
        confirmar="Eliminar"
        peligro
      />
    </div>
  )
}

function Chip({ activo, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
        activo
          ? 'border-transparent bg-surface-3 text-text'
          : 'border-border bg-transparent text-muted active:bg-surface-2'
      }`}
      style={activo && color ? { color, backgroundColor: `${color}20` } : undefined}
    >
      {children}
    </button>
  )
}
