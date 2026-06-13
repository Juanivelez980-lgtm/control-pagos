import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './context/DataContext.jsx'

// Service worker: se actualiza solo en segundo plano (autoUpdate).
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>,
)
