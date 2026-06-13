import { useState, lazy, Suspense } from 'react'
import { useData } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import BottomNav from './components/BottomNav'
import Inicio from './screens/Inicio'
import Servicios from './screens/Servicios'
import Registrar from './screens/Registrar'

// El Historial trae recharts (pesado); lo cargamos sólo al abrir esa pestaña.
const Historial = lazy(() => import('./screens/Historial'))

function Contenido() {
  const { cargando } = useData()
  const [tab, setTab] = useState('inicio')
  const [preseleccion, setPreseleccion] = useState(null)

  // Ir a "Registrar" con un servicio ya elegido (desde Inicio o el detalle).
  function registrarPagoDe(servicioId) {
    setPreseleccion(servicioId)
    setTab('registrar')
  }

  if (cargando) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-bg">
      <main key={tab} className="animate-fade-in">
        {tab === 'inicio' && (
          <Inicio onRegistrarPago={registrarPagoDe} onIrAServicios={() => setTab('servicios')} />
        )}
        {tab === 'servicios' && <Servicios onRegistrarPago={registrarPagoDe} />}
        {tab === 'registrar' && (
          <Registrar
            preseleccion={preseleccion}
            onConsumirPreseleccion={() => setPreseleccion(null)}
            onIrAServicios={() => setTab('servicios')}
          />
        )}
        {tab === 'historial' && (
          <Suspense
            fallback={
              <div className="flex min-h-dvh items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-brand" />
              </div>
            }
          >
            <Historial />
          </Suspense>
        )}
      </main>

      <BottomNav activo={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Contenido />
    </ToastProvider>
  )
}
