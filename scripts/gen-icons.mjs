import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

// Logo: fondo con gradiente índigo + un "wallet" blanco con check.
// `pad` controla cuánto respira el ícono dentro del lienzo (maskable necesita más).
function svg({ size = 512, pad = 0.16, bg = true } = {}) {
  const r = Math.round(size * 0.235) // radio del cuadrado redondeado
  const m = size * pad
  const inner = size - m * 2
  // Geometría del wallet, relativa al área interna
  const x = m
  const y = m + inner * 0.12
  const w = inner
  const h = inner * 0.74
  const rad = inner * 0.16
  const flap = y + h * 0.42
  const dotR = inner * 0.07

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  ${bg ? `<rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>` : ''}
  <g fill="none" stroke="#ffffff" stroke-width="${size * 0.052}" stroke-linejoin="round" stroke-linecap="round">
    <path d="M ${x + rad} ${y}
             H ${x + w - rad}
             a ${rad} ${rad} 0 0 1 ${rad} ${rad}
             V ${y + h - rad}
             a ${rad} ${rad} 0 0 1 ${-rad} ${rad}
             H ${x + rad}
             a ${rad} ${rad} 0 0 1 ${-rad} ${-rad}
             V ${y + rad}
             a ${rad} ${rad} 0 0 1 ${rad} ${-rad} Z"/>
    <path d="M ${x} ${flap} H ${x + w}"/>
  </g>
  <circle cx="${x + w * 0.74}" cy="${flap + (y + h - flap) / 2}" r="${dotR}" fill="#ffffff"/>
</svg>`
}

async function png(opts, out) {
  const buf = Buffer.from(svg(opts))
  await sharp(buf).png().toFile(`public/${out}`)
  console.log('->', out)
}

await png({ size: 192, pad: 0.16 }, 'icon-192.png')
await png({ size: 512, pad: 0.16 }, 'icon-512.png')
await png({ size: 512, pad: 0.26 }, 'icon-512-maskable.png')
await png({ size: 180, pad: 0.14 }, 'apple-touch-icon.png')

// Favicon SVG (escalable)
writeFileSync('public/favicon.svg', svg({ size: 64, pad: 0.12 }))
console.log('-> favicon.svg')
