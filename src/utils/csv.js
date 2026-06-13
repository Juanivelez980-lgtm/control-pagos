import { formatFecha } from './format'

function escapar(valor) {
  const s = String(valor ?? '')
  if (/[";\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * Exporta el historial de pagos a CSV (separador ; para que Excel-AR lo abra bien).
 * Recibe los pagos ya enriquecidos con nombre de servicio y categoría.
 */
export function pagosACSV(pagos) {
  const cabeceras = [
    'Fecha de pago',
    'Servicio',
    'Categoría',
    'Monto pagado',
    'Nota',
    'Link comprobante',
  ]
  const filas = pagos.map((p) =>
    [
      formatFecha(p.fechaPago),
      p.servicioNombre,
      p.categoria,
      // Monto con coma decimal, sin separador de miles, para que Excel-AR lo lea como número
      Number(p.montoPagado).toFixed(2).replace('.', ','),
      p.nota,
      p.linkComprobante,
    ]
      .map(escapar)
      .join(';'),
  )
  return [cabeceras.join(';'), ...filas].join('\n')
}

/** Dispara la descarga de un CSV en el navegador. */
export function descargarCSV(contenido, nombreArchivo) {
  // BOM para que Excel reconozca UTF-8 (acentos)
  const blob = new Blob(['﻿' + contenido], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
