# Mis Pagos — Control de Facturas

PWA mobile-first para controlar y trackear los pagos de facturas y servicios.
Todo corre en el celular, **sin servidor ni login**: los datos se guardan en el
propio dispositivo con IndexedDB y persisten entre sesiones.

## Stack

- **React + Vite**
- **TailwindCSS v4** (tema dark)
- **IndexedDB** vía la librería `idb`
- **recharts** para el gráfico de gastos
- **vite-plugin-pwa** (instalable + offline)

## Correr en la compu

```bash
cd control-pagos
npm install      # solo la primera vez
npm run dev
```

Abrí la URL que muestra la terminal (por defecto http://localhost:5173).

Para probar la versión optimizada (con service worker activo):

```bash
npm run build
npm run preview
```

## Instalar en el celular

La PWA es instalable. Para que el celular la vea, tiene que estar servida por
**https** o por `localhost`. Dos caminos:

### Opción A — Misma red WiFi (rápido para probar)

1. En la compu: `npm run dev -- --host`
2. La terminal muestra una dirección **Network** (ej: `http://192.168.0.10:5173`).
3. Abrí esa dirección en el navegador del celular (misma WiFi).
   > Nota: por http puro algunos navegadores no ofrecen "Instalar". Para la
   > experiencia completa de instalación usá la Opción B.

### Opción B — Publicada (recomendada para usarla en serio)

Subí la carpeta `dist/` (resultado de `npm run build`) a cualquier hosting
estático con https: **Netlify, Vercel o GitHub Pages**. Con la URL https abierta
en el celular:

- **Android (Chrome):** menú ⋮ → *Instalar app* / *Agregar a pantalla principal*.
- **iPhone (Safari):** botón Compartir → *Agregar a pantalla de inicio*.

Queda como una app más, a pantalla completa y funcionando offline.

## Estructura

```
src/
├── db/database.js          Capa de datos (IndexedDB con idb)
├── context/                Estado global (datos + toasts)
├── constants/categorias.js Categorías de servicios
├── utils/                  Formato AR, fechas/vencimientos, CSV, validación
├── components/             UI reutilizable (Sheet, Button, Card, Icon…)
└── screens/                Inicio · Servicios · Registrar · Historial
```

## Regenerar los íconos

Los íconos PWA se generan desde `scripts/gen-icons.mjs`:

```bash
node scripts/gen-icons.mjs
```
