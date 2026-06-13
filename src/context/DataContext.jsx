import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as db from '../db/database'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [servicios, setServicios] = useState([])
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const [s, p] = await Promise.all([db.getServicios(), db.getPagos()])
        if (!vivo) return
        setServicios(s)
        setPagos(p)
      } catch (e) {
        console.error('Error cargando datos', e)
      } finally {
        if (vivo) setCargando(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [])

  /* ----------------------------- Servicios ----------------------------- */

  const crearServicio = useCallback(async (data) => {
    const nuevo = await db.addServicio(data)
    setServicios((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const editarServicio = useCallback(async (id, patch) => {
    const actualizado = await db.updateServicio(id, patch)
    setServicios((prev) => prev.map((s) => (s.id === id ? actualizado : s)))
    return actualizado
  }, [])

  const eliminarServicio = useCallback(async (id) => {
    await db.deleteServicio(id)
    setServicios((prev) => prev.filter((s) => s.id !== id))
    setPagos((prev) => prev.filter((p) => p.servicioId !== id))
  }, [])

  /* ------------------------------- Pagos ------------------------------- */

  const crearPago = useCallback(async (data) => {
    const nuevo = await db.addPago(data)
    setPagos((prev) => [...prev, nuevo])
    return nuevo
  }, [])

  const editarPago = useCallback(async (id, patch) => {
    const actualizado = await db.updatePago(id, patch)
    setPagos((prev) => prev.map((p) => (p.id === id ? actualizado : p)))
    return actualizado
  }, [])

  const eliminarPago = useCallback(async (id) => {
    await db.deletePago(id)
    setPagos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const value = {
    servicios,
    pagos,
    cargando,
    crearServicio,
    editarServicio,
    eliminarServicio,
    crearPago,
    editarPago,
    eliminarPago,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
