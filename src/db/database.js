import { openDB } from 'idb'

const DB_NAME = 'mis-pagos-db'
const DB_VERSION = 1

export const STORE_SERVICIOS = 'servicios'
export const STORE_PAGOS = 'pagos'

let _dbPromise = null

function getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_SERVICIOS)) {
          const servicios = db.createObjectStore(STORE_SERVICIOS, {
            keyPath: 'id',
          })
          servicios.createIndex('activo', 'activo')
          servicios.createIndex('categoria', 'categoria')
        }
        if (!db.objectStoreNames.contains(STORE_PAGOS)) {
          const pagos = db.createObjectStore(STORE_PAGOS, { keyPath: 'id' })
          pagos.createIndex('servicioId', 'servicioId')
          pagos.createIndex('fechaPago', 'fechaPago')
        }
      },
    })
  }
  return _dbPromise
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback simple
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/* ============================ SERVICIOS ============================ */

export async function getServicios() {
  const db = await getDB()
  return db.getAll(STORE_SERVICIOS)
}

export async function getServicio(id) {
  const db = await getDB()
  return db.get(STORE_SERVICIOS, id)
}

export async function addServicio(data) {
  const db = await getDB()
  const servicio = {
    id: uuid(),
    nombre: data.nombre,
    categoria: data.categoria,
    montoEstimado: data.montoEstimado ?? null,
    diaVencimiento: data.diaVencimiento ?? null,
    linkPago: data.linkPago ?? '',
    identificador: data.identificador ?? '',
    activo: data.activo ?? true,
    createdAt: new Date().toISOString(),
  }
  await db.put(STORE_SERVICIOS, servicio)
  return servicio
}

export async function updateServicio(id, patch) {
  const db = await getDB()
  const actual = await db.get(STORE_SERVICIOS, id)
  if (!actual) throw new Error('Servicio no encontrado')
  const actualizado = { ...actual, ...patch, id }
  await db.put(STORE_SERVICIOS, actualizado)
  return actualizado
}

export async function deleteServicio(id) {
  const db = await getDB()
  const tx = db.transaction([STORE_SERVICIOS, STORE_PAGOS], 'readwrite')
  await tx.objectStore(STORE_SERVICIOS).delete(id)
  // Borra también los pagos asociados
  const idx = tx.objectStore(STORE_PAGOS).index('servicioId')
  let cursor = await idx.openCursor(id)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

/* ============================== PAGOS ============================== */

export async function getPagos() {
  const db = await getDB()
  return db.getAll(STORE_PAGOS)
}

export async function addPago(data) {
  const db = await getDB()
  const pago = {
    id: uuid(),
    servicioId: data.servicioId,
    fechaPago: data.fechaPago, // ISO date string "YYYY-MM-DD"
    montoPagado: data.montoPagado,
    linkComprobante: data.linkComprobante ?? '',
    estado: 'pagado',
    nota: data.nota ?? '',
    createdAt: new Date().toISOString(),
  }
  await db.put(STORE_PAGOS, pago)
  return pago
}

export async function updatePago(id, patch) {
  const db = await getDB()
  const actual = await db.get(STORE_PAGOS, id)
  if (!actual) throw new Error('Pago no encontrado')
  const actualizado = { ...actual, ...patch, id }
  await db.put(STORE_PAGOS, actualizado)
  return actualizado
}

export async function deletePago(id) {
  const db = await getDB()
  await db.delete(STORE_PAGOS, id)
}

/* ===================== UTIL / DATOS DE EJEMPLO ===================== */

export async function contarRegistros() {
  const db = await getDB()
  const [s, p] = await Promise.all([
    db.count(STORE_SERVICIOS),
    db.count(STORE_PAGOS),
  ])
  return { servicios: s, pagos: p }
}
