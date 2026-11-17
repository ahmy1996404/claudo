import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Claudo: a cozy rainy cafe. You sit by the window: the city outside is a
// blur of warm lights through the rain, drops gather and run down the glass,
// string lights hang along the top, a pendant lamp glows over a candle and a
// steaming mug, a plant trails, and a cat sleeps on a shelf by a little radio. Light is a grey afternoon; dark is a rainy night.
// All of it lives in the top third and the very edges; the middle and the
// foot stay clear for the words and the message box.
const { theme, problems } = makeColors({
  label: 'Claudo',
  roles: { accent: '#4a86b5', danger: '#c83a3a', success: '#4f9a5a', warning: '#c98a1a', pro: '#9a5a9e' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#efe7de',
        'surface-1': '#f4eee7',
        'surface-2': '#faf6f1',
        'text-primary': '#261f1a',
        'text-secondary': '#4e4239',
        'text-muted': '#66584d',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#17120f',
        'surface-1': '#1e1814',
        'surface-2': '#261f1a',
        'surface-3': '#2b231d',
        'text-primary': '#f3ebe2',
        'text-secondary': '#d2c4b6',
        'text-muted': '#ad9e90',
      },
    },
  },
})

const VIEW_END = 420 // where the window view has faded into the page
const RAIN_H = 340 // the band the rain falls through
const FRAME = 16 // the window frame's thickness

let seed = 59
function rand(): number {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const n = (v: number) => v.toFixed(0)

// Everything added for the livelier scene draws from its own sequence, so the
// rest keeps its shapes.
let seed2 = 211
function rand2(): number {
  seed2 = (seed2 * 16807) % 2147483647
  return seed2 / 2147483647
}

// Lightning: a jagged bolt behind the city and a flash that lights the sky.
function bolt(x: number, cls: string): string {
  const pts: string[] = [`${x},0`]
  const branch: string[] = []
  let bx = x
  let by = 0
  while (by < 235) {
    bx += (rand2() - 0.5) * 46
    by += 14 + rand2() * 22
    pts.push(`${n(bx)},${n(Math.min(by, 240))}`)
    if (branch.length === 0 && by > 70 && by < 140) {
      branch.push(`${n(bx)},${n(by)}`, `${n(bx + 34)},${n(by + 26)}`, `${n(bx + 30)},${n(by + 52)}`, `${n(bx + 52)},${n(by + 70)}`)
    }
  }
  return (
    `<rect class="skyflash ${cls}" x="0" y="0" width="1600" height="330" fill="url(#flashgrad)"/>` +
    `<g class="bolt ${cls}" filter="url(#boltglow)"><polyline points="${pts.join(' ')}"/><polyline class="branch" points="${branch.join(' ')}"/></g>`
  )
}

// Cars on the wet street: headlights one way, taillights the other, each with
// a smear of reflection on the road.
function cars(): string {
  const out: string[] = []
  for (let k = 0; k < 8; k++) {
    const toLeft = k % 2 === 0
    const y = toLeft ? 300 : 312
    const fill = toLeft ? 'url(#bkD)' : 'url(#bkB)'
    const beam = toLeft ? `<ellipse cx="-34" cy="${y}" rx="44" ry="5" fill="url(#bkD)" opacity=".45"/>` : ''
    out.push(
      `<g class="car ${toLeft ? 'go-l' : 'go-r'}" style="animation-duration:${(7 + rand2() * 6).toFixed(1)}s;animation-delay:-${(rand2() * 14).toFixed(1)}s">` +
        beam +
        `<circle cx="0" cy="${y}" r="7" fill="${fill}"/><circle cx="20" cy="${y}" r="7" fill="${fill}"/>` +
        `<ellipse cx="0" cy="${y + 14}" rx="3" ry="11" fill="${fill}" opacity=".5"/><ellipse cx="20" cy="${y + 14}" rx="3" ry="11" fill="${fill}" opacity=".5"/>` +
        `</g>`,
    )
  }
  return out.join('')
}

// People hurrying past with umbrellas.
function walkers(): string {
  const specs: Array<[string, boolean, number]> = [
    ['u1', true, 46],
    ['u2', false, 58],
    ['u3', true, 70],
  ]
  return specs
    .map(([tone, toRight, dur], i) => {
      const fig =
        `<g class="bob">` +
        `<line class="leg" x1="0" y1="304" x2="-3" y2="320" style="transform-origin:0px 304px"/>` +
        `<line class="leg leg2" x1="0" y1="304" x2="3" y2="320" style="transform-origin:0px 304px"/>` +
        `<rect class="body" x="-6" y="282" width="12" height="24" rx="5"/>` +
        `<circle class="body" cx="0" cy="279" r="5"/>` +
        `<line class="handle" x1="1" y1="270" x2="2" y2="292"/>` +
        `<path class="${tone}" d="M-23,271 Q0,244 23,271 Q17,267 11.5,271 Q6,267 0,271 Q-6,267 -11.5,271 Q-17,267 -23,271 Z"/>` +
        `</g>`
      return `<g class="walk ${toRight ? 'go-r' : 'go-l'}" style="animation-duration:${dur}s;animation-delay:-${(i * 17 + rand2() * 10).toFixed(1)}s"><g transform="translate(0 -160) scale(1.5)">${fig}</g></g>`
    })
    .join('')
}

// Drops hitting the glass: a quick ring and a bead.
function hits(): string {
  const out: string[] = []
  for (let i = 0; i < 26; i++) {
    const x = 40 + rand2() * 1520
    const y = 30 + rand2() * 260
    out.push(
      `<g class="hit" style="animation-duration:${(2.2 + rand2() * 2.8).toFixed(1)}s;animation-delay:-${(rand2() * 5).toFixed(1)}s"><circle class="ring" cx="${n(x)}" cy="${n(y)}" r="7"/><circle class="drop" cx="${n(x)}" cy="${n(y)}" r="2"/></g>`,
    )
  }
  return out.join('')
}

// Distant buildings, soft through the wet glass, a few windows lit.
function city(): string {
  const blocks: string[] = []
  const lit: string[] = []
  let x = -20
  while (x < 1620) {
    const w = 50 + rand() * 90
    const h = 50 + rand() * 120
    const top = 300 - h
    blocks.push(`<rect x="${n(x)}" y="${n(top)}" width="${n(w)}" height="${n(h + 60)}"/>`)
    for (let wy = top + 10; wy < 290; wy += 16) {
      for (let wx = x + 8; wx < x + w - 10; wx += 14) {
        if (rand() < 0.18) {
          lit.push(`<rect x="${n(wx)}" y="${n(wy)}" width="7" height="8"/>`)
        }
      }
    }
    x += w + 6 + rand() * 30
  }
  return `<g class="bldg">${blocks.join('')}</g><g class="bwin">${lit.join('')}</g>`
}

// Out-of-focus lights: street lamps, car lights, signs. Soft discs that
// breathe and drift a little.
function bokeh(): string {
  const tones = ['bkA', 'bkA', 'bkA', 'bkB', 'bkC', 'bkD']
  const out: string[] = []
  while (out.length < 26) {
    const x = rand() * 1600
    const y = 30 + rand() * 300
    // Fewer and smaller toward the middle of the top band.
    const central = x > 520 && x < 1080
    if (central && rand() < 0.5) continue
    const r = (central ? 8 : 12) + rand() * (central ? 18 : 34)
    const tone = tones[Math.floor(rand() * tones.length)] ?? 'bkA'
    out.push(
      `<circle class="bk" cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${tone})" style="animation-duration:${(5 + rand() * 6).toFixed(1)}s;animation-delay:-${(rand() * 10).toFixed(1)}s"/>`,
    )
  }
  return out.join('')
}

// Rain beyond the glass: one tile of streaks, drawn twice, sliding down.
function rainTile(count: number, base: number, vary: number): string {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const x = rand() * 1700 - 50
    const y = rand() * RAIN_H
    const len = base + rand() * vary
    out.push(`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x - len * 0.18)}" y2="${n(y + len)}"/>`)
  }
  return out.join('')
}

// Drops resting on the glass: a darker body and a bright fleck.
function droplets(): string {
  const out: string[] = []
  while (out.length < 120) {
    const x = rand() * 1600
    const y = rand() * 600
    const edge = x < 160 || x > 1440
    // In the top band anywhere; lower down only at the edges.
    if (y > 300 && !edge) continue
    if (y > 300 && rand() < (y - 300) / 300) continue
    const r = 1.2 + rand() * 3.4
    out.push(
      `<g><circle class="drop" cx="${n(x)}" cy="${n(y)}" r="${r.toFixed(1)}"/><circle class="fleck" cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.35).toFixed(1)}"/></g>`,
    )
  }
  return out.join('')
}

// Drops that gather weight and run down the glass, leaving a trail.
function runs(): string {
  const out: string[] = []
  for (let k = 0; k < 30; k++) {
    let x = 30 + rand() * 1540
    const edge = x < 160 || x > 1440
    if (!edge && rand() < 0.35) x = rand() < 0.5 ? 40 + rand() * 110 : 1450 + rand() * 110
    const isEdge = x < 160 || x > 1440
    const start = 10 + rand() * 120
    const dist = isEdge ? 300 + rand() * 220 : 150 + rand() * 120
    const r = 2.4 + rand() * 1.6
    out.push(
      `<g class="run" style="--d:${n(dist)}px;--w:${((rand() - 0.5) * 10).toFixed(1)}px;animation-duration:${(6 + rand() * 7).toFixed(1)}s;animation-delay:-${(rand() * 18).toFixed(1)}s">` +
        `<rect class="trail" x="${(x - r * 0.45).toFixed(1)}" y="${n(start - 46)}" width="${(r * 0.9).toFixed(1)}" height="46" rx="${(r * 0.45).toFixed(1)}" fill="url(#trail)"/>` +
        `<circle class="drop" cx="${n(x)}" cy="${n(start)}" r="${r.toFixed(1)}"/>` +
        `<circle class="fleck" cx="${(x - r * 0.35).toFixed(1)}" cy="${(start - r * 0.35).toFixed(1)}" r="${(r * 0.38).toFixed(1)}"/></g>`,
    )
  }
  return out.join('')
}

// A trailing pothos, hanging beside the right shelf, its vines swaying.
function plant(): string {
  const px = 1220
  const py = 96
  const vines: string[] = []
  const specs: Array<[number, number, number]> = [
    [-46, 190, 0],
    [-18, 250, 2],
    [12, 215, 4],
    [40, 170, 1],
    [58, 120, 3],
  ]
  for (const [dx, len, delay] of specs) {
    const sx = px + dx * 0.5
    const sy = py + 18
    const ex = px + dx
    const ey = sy + len
    const d = `M${n(sx)},${n(sy)} Q${n(sx + dx * 0.9)},${n(sy + len * 0.5)} ${n(ex)},${n(ey)}`
    const leaves: string[] = []
    for (let t = 0.12; t < 1; t += 0.14) {
      // A point on the vine (quadratic Bézier).
      const qx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * (sx + dx * 0.9) + t * t * ex
      const qy = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * (sy + len * 0.5) + t * t * ey
      const side = Math.round(t * 10) % 2 === 0 ? 1 : -1
      const lx = qx + side * 9
      const rot = side * (30 + rand() * 25)
      leaves.push(
        `<ellipse class="${rand() < 0.5 ? 'leaf' : 'leaf2'}" cx="${n(lx)}" cy="${n(qy)}" rx="9" ry="5.5" transform="rotate(${n(rot)} ${n(lx)} ${n(qy)})"/>`,
      )
    }
    vines.push(
      `<g class="vine" style="transform-origin:${n(sx)}px ${n(sy)}px;animation-delay:-${delay}s"><path class="stem" d="${d}"/>${leaves.join('')}</g>`,
    )
  }
  const cords = `<line class="cord" x1="${px}" y1="0" x2="${px - 26}" y2="${py}"/><line class="cord" x1="${px}" y1="0" x2="${px + 26}" y2="${py}"/>`
  const pot = `<path class="pot" d="M${px - 30},${py} L${px + 30},${py} L${px + 22},${py + 30} Q${px},${py + 36} ${px - 22},${py + 30} Z"/><rect class="potrim" x="${px - 32}" y="${py - 4}" width="64" height="7" rx="3"/>`
  return `${cords}${vines.join('')}${pot}`
}

// A little shelf under the lamp: books, a candle and a steaming mug.
function shelf(): string {
  const y = 262
  const books =
    `<rect class="book1" x="70" y="${y - 30}" width="14" height="30" rx="1"/>` +
    `<rect class="book2" x="86" y="${y - 36}" width="12" height="36" rx="1"/>` +
    `<rect class="book3" x="100" y="${y - 26}" width="16" height="26" rx="1" transform="rotate(8 108 ${y})"/>`
  const mx = 200
  const mug =
    `<path class="mug" d="M${mx - 20},${y - 34} L${mx + 20},${y - 34} L${mx + 18},${y - 3} Q${mx},${y + 1} ${mx - 18},${y - 3} Z"/>` +
    `<path class="mug-handle" d="M${mx + 19},${y - 27} q15,2 13,13 q-2,9 -14,7"/>` +
    `<rect class="mug-band" x="${mx - 19}" y="${y - 22}" width="38" height="5"/>`
  const steam = [0, 1, 2]
    .map(
      i =>
        `<path class="steam" d="M${mx - 8 + i * 8},${y - 40} c-8,-10 8,-18 0,-28 c-8,-10 8,-18 0,-28 c-8,-10 8,-18 0,-26" style="animation-delay:-${(i * 1.3).toFixed(1)}s"/>`,
    )
    .join('')
  const candle =
    `<circle cx="145" cy="${y - 32}" r="38" fill="url(#candleglow)" class="cglow"/>` +
    `<rect class="holder" x="133" y="${y - 6}" width="24" height="6" rx="2"/>` +
    `<rect class="wax" x="139" y="${y - 26}" width="12" height="20" rx="2"/>` +
    `<line class="wick" x1="145" y1="${y - 26}" x2="145" y2="${y - 29}"/>` +
    `<ellipse class="flame" cx="145" cy="${y - 34}" rx="3.4" ry="7"/>`
  return `<rect class="plank" x="${FRAME}" y="${y}" width="270" height="9" rx="2"/><rect class="plank-edge" x="${FRAME}" y="${y + 9}" width="270" height="3"/>${books}${candle}${mug}${steam}`
}

// String lights draped in swags along the top of the window.
function stringLights(): string {
  const anchors = [FRAME, 416, 816, 1216, 1600 - FRAME]
  const y0 = 22
  const sag = 26
  const wires: string[] = []
  const bulbs: string[] = []
  let k = 0
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i] ?? 0
    const b = anchors[i + 1] ?? 0
    const cx = (a + b) / 2
    const cy = y0 + sag * 2
    wires.push(`M${a},${y0} Q${n(cx)},${cy} ${b},${y0}`)
    for (let t = 1 / 9; t < 0.99; t += 1 / 9) {
      const qx = (1 - t) * (1 - t) * a + 2 * (1 - t) * t * cx + t * t * b
      const qy = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y0
      const tone = ['b1', 'b2', 'b3'][k % 3] ?? 'b1'
      bulbs.push(
        `<g class="twinkle" style="animation-delay:${(k * 0.18).toFixed(2)}s"><circle cx="${n(qx)}" cy="${n(qy + 7)}" r="10" fill="url(#bulbglow)"/><line class="wire" x1="${n(qx)}" y1="${n(qy)}" x2="${n(qx)}" y2="${n(qy + 4)}"/><circle class="${tone}" cx="${n(qx)}" cy="${n(qy + 7)}" r="3.2"/></g>`,
      )
      k++
    }
  }
  return `<path class="wire" d="${wires.join(' ')}"/>${bulbs.join('')}`
}

// A second shelf on the right: a jar of coffee beans, a little radio humming
// to itself, a succulent and a sleeping cat.
function rightShelf(): string {
  const y = 262
  const x0 = 1314
  const plank = `<rect class="plank" x="${x0}" y="${y}" width="${1600 - FRAME - x0}" height="9" rx="2"/><rect class="plank-edge" x="${x0}" y="${y + 9}" width="${1600 - FRAME - x0}" height="3"/>`
  const beans: string[] = []
  for (let i = 0; i < 16; i++) {
    const bx = 1330 + rand() * 22
    const by = y - 4 - rand() * 26
    beans.push(`<ellipse class="bean" cx="${n(bx)}" cy="${n(by)}" rx="3" ry="2" transform="rotate(${n(rand() * 180)} ${n(bx)} ${n(by)})"/>`)
  }
  const jar =
    `<rect class="jar" x="1326" y="${y - 38}" width="30" height="38" rx="5"/>${beans.join('')}` +
    `<rect class="lid" x="1324" y="${y - 44}" width="34" height="7" rx="2"/>` +
    `<rect class="glint" x="1330" y="${y - 33}" width="3" height="22" rx="1.5"/>`
  const radio =
    `<line class="antenna" x1="1440" y1="${y - 34}" x2="1462" y2="${y - 70}"/>` +
    `<rect class="radio" x="1370" y="${y - 34}" width="76" height="34" rx="6"/>` +
    `<circle class="grille" cx="1392" cy="${y - 17}" r="11"/>` +
    `<circle class="grille-ring" cx="1392" cy="${y - 17}" r="6"/>` +
    `<rect class="dial" x="1412" y="${y - 27}" width="26" height="8" rx="2"/>` +
    `<line class="needle" x1="1422" y1="${y - 27}" x2="1422" y2="${y - 19}"/>` +
    `<circle class="knob" cx="1418" cy="${y - 9}" r="3.2"/><circle class="knob" cx="1432" cy="${y - 9}" r="3.2"/>`
  const notes = [0, 1, 2, 3]
    .map(
      i =>
        `<g class="note" style="--dx:${i % 2 === 0 ? 18 : -14}px;animation-delay:-${(i * 1.1).toFixed(1)}s"><circle cx="${1386 + (i % 2) * 14}" cy="${y - 44}" r="2.6"/><line x1="${1388.4 + (i % 2) * 14}" y1="${y - 44}" x2="${1388.4 + (i % 2) * 14}" y2="${y - 56}"/></g>`,
    )
    .join('')
  const succulent =
    [-50, -20, 0, 20, 50]
      .map(a => `<ellipse class="succ" cx="1476" cy="${y - 20}" rx="4.5" ry="11" transform="rotate(${a} 1476 ${y - 12})"/>`)
      .join('') + `<path class="spot" d="M1463,${y - 14} L1489,${y - 14} L1486,${y} L1466,${y} Z"/>`
  // The cat: curled up asleep, tail wrapped round, breathing slowly.
  const cx = 1540
  const cat =
    `<g class="breath" style="transform-origin:${cx}px ${y}px">` +
    `<ellipse class="cat" cx="${cx}" cy="${y - 14}" rx="34" ry="14"/>` +
    `<path class="stripe" d="M${cx - 6},${y - 27} q4,6 0,11 M${cx + 6},${y - 27} q4,6 0,11 M${cx + 18},${y - 24} q3,5 0,9"/>` +
    `</g>` +
    `<g class="ear" style="transform-origin:${cx - 26}px ${y - 16}px"><path class="cat" d="M${cx - 34},${y - 22} l-4,-14 l10,7 Z M${cx - 20},${y - 23} l5,-13 l4,12 Z"/>` +
    `<path class="ear-in" d="M${cx - 34},${y - 24} l-2,-8 l5,4 Z M${cx - 18},${y - 25} l3,-7 l2,6 Z"/></g>` +
    `<circle class="cat" cx="${cx - 26}" cy="${y - 13}" r="12"/>` +
    `<path class="eye" d="M${cx - 34},${y - 14} q3,2 6,0 M${cx - 24},${y - 14} q3,2 6,0"/>` +
    `<g class="tailflick" style="transform-origin:${cx + 32}px ${y - 8}px"><path class="tail" d="M${cx + 32},${y - 8} Q${cx + 40},${y + 1} ${cx + 6},${y - 1} Q${cx - 20},${y - 2} ${cx - 30},${y - 3}"/></g>`
  return `${plank}${jar}${radio}${notes}${succulent}${cat}`
}

// A pendant lamp hanging over the shelf, its glow breathing softly.
function lamp(): string {
  const x = 210
  const y = 118
  return (
    `<g class="swing" style="transform-origin:${x}px 0px">` +
    `<line class="cord" x1="${x}" y1="0" x2="${x}" y2="${y - 20}"/>` +
    `<polygon class="cone" points="${x - 32},${y + 8} ${x + 32},${y + 8} ${x + 150},${y + 150} ${x - 150},${y + 150}" fill="url(#cone)"/>` +
    `<path class="shade" d="M${x - 8},${y - 22} L${x + 8},${y - 22} L${x + 36},${y + 8} L${x - 36},${y + 8} Z"/>` +
    `<ellipse class="bulb" cx="${x}" cy="${y + 9}" rx="13" ry="6"/>` +
    `</g>`
  )
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
    <stop class="k0" offset="0"/><stop class="k1" offset="0.22"/><stop class="k2" offset="0.32"/><stop class="k3" offset="${(VIEW_END / 1000).toFixed(2)}"/><stop class="k3" offset="1"/>
  </linearGradient>
  <radialGradient id="bkA"><stop class="cA" offset="0" stop-opacity=".9"/><stop class="cA" offset=".55" stop-opacity=".55"/><stop class="cA" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="bkB"><stop class="cB" offset="0" stop-opacity=".9"/><stop class="cB" offset=".55" stop-opacity=".55"/><stop class="cB" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="bkC"><stop class="cC" offset="0" stop-opacity=".9"/><stop class="cC" offset=".55" stop-opacity=".55"/><stop class="cC" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="bkD"><stop class="cD" offset="0" stop-opacity=".9"/><stop class="cD" offset=".55" stop-opacity=".55"/><stop class="cD" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow" cx="210" cy="150" r="440" gradientUnits="userSpaceOnUse">
    <stop class="g0" offset="0" stop-opacity=".85"/><stop class="g0" offset=".4" stop-opacity=".32"/><stop class="g0" offset="1" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop class="g0" offset="0" stop-opacity=".55"/><stop class="g0" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1"><stop class="tr" offset="0" stop-opacity="0"/><stop class="tr" offset="1" stop-opacity=".55"/></linearGradient>
  <linearGradient id="viewfade" x1="0" y1="0" x2="0" y2="${VIEW_END}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="viewmask"><rect x="0" y="0" width="1600" height="${VIEW_END}" fill="url(#viewfade)"/></mask>
  <linearGradient id="stilefade" x1="0" y1="0" x2="0" y2="1"><stop class="wd" offset="0"/><stop class="wd" offset=".65" stop-opacity=".9"/><stop class="wd" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="barfade" x1="0" y1="0" x2="0" y2="1"><stop class="wd" offset="0"/><stop class="wd" offset="1" stop-opacity="0"/></linearGradient>
  <radialGradient id="candleglow"><stop class="g0" offset="0" stop-opacity=".6"/><stop class="g0" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="bulbglow"><stop class="g0" offset="0" stop-opacity=".55"/><stop class="g0" offset="1" stop-opacity="0"/></radialGradient>
  <linearGradient id="fogL" x1="0" y1="0" x2="1" y2="0"><stop class="fg" offset="0" stop-opacity=".9"/><stop class="fg" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="fogR" x1="1" y1="0" x2="0" y2="0"><stop class="fg" offset="0" stop-opacity=".9"/><stop class="fg" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="fogT" x1="0" y1="0" x2="0" y2="1"><stop class="fg" offset="0" stop-opacity=".9"/><stop class="fg" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="flashgrad" x1="0" y1="0" x2="0" y2="1"><stop class="fl" offset="0"/><stop class="fl" offset=".7" stop-opacity=".5"/><stop class="fl" offset="1" stop-opacity="0"/></linearGradient>
  <filter id="boltglow" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="3.5"/></filter>
</defs>
<style>
  /* Light: a grey, rainy afternoon. */
  .k0{stop-color:#a9b6c1}.k1{stop-color:#c6ced3}.k2{stop-color:#dcdcd8}.k3{stop-color:#efe7de}
  .bldg{fill:#7d8d9b;opacity:.6}.bwin{fill:#ffe0a0;opacity:.75}
  .cA{stop-color:#ffc870}.cB{stop-color:#ff8a78}.cC{stop-color:#9fd8de}.cD{stop-color:#fff6e0}
  .bk{--bklo:.5;--bkhi:.8}
  .rain{stroke:#ffffff;stroke-width:1.2;opacity:.6}
  .drop{fill:#7d8b95;opacity:.32}.fleck{fill:#ffffff;opacity:.85}
  .tr{stop-color:#ffffff}
  .wd{stop-color:#a87b52}
  .sill{fill:#8f6744}
  @media (prefers-color-scheme: dark){.sill{fill:#4a3220}}
  .g0{stop-color:#ffcf7a}
  .glowfill{--glo:.6;--ghi:.8}
  .cord{stroke:#4a3a2e;stroke-width:1.5}
  .shade{fill:#2f4a43}.bulb{fill:#fff2c8}
  .plank{fill:#9b6f48}.plank-edge{fill:#6f4c30}
  .book1{fill:#b5543c}.book2{fill:#3f6e8c}.book3{fill:#d0a64a}
  .mug{fill:#f3efe8}.mug-handle{fill:none;stroke:#f3efe8;stroke-width:5;stroke-linecap:round}.mug-band{fill:#4a86b5}
  .steam{fill:none;stroke:#ffffff;stroke-width:3;stroke-linecap:round;opacity:0}
  .stem{fill:none;stroke:#4f7a3a;stroke-width:2}
  .leaf{fill:#5d9a46}.leaf2{fill:#7fb35a}
  .pot{fill:#c46e4a}.potrim{fill:#a95a3a}
  .rain.far{stroke-width:.7;opacity:.28}
  .warm{fill:#ffb35a;opacity:.08}
  .fogs{opacity:.6}.fg{stop-color:#ffffff}
  .fl{stop-color:#ffffff}
  .skyflash{opacity:0;fill-opacity:.5}
  .bolt{opacity:0;fill:none;stroke:#ffffff;stroke-width:2.6;stroke-linejoin:round}.branch{stroke-width:1.5}
  .u1{fill:#e0574a}.u2{fill:#f2bf3f}.u3{fill:#2fb0ad}
  .body{fill:#4f5865}.leg{stroke:#4f5865;stroke-width:3;stroke-linecap:round}.handle{stroke:#3a3a3a;stroke-width:1.5}
  .ring{fill:none;stroke:#ffffff;stroke-width:1.4}
  .holder{fill:#8a6a4a}.wax{fill:#f5ecdc}.wick{stroke:#3a2a1e;stroke-width:1.2}.flame{fill:#ffc456}
  .wire{fill:none;stroke:#5a4a3e;stroke-width:1.2}
  .b1{fill:#ffd27a}.b2{fill:#ffa27a}.b3{fill:#fff0c4}
  .jar{fill:#d6e6e8;opacity:.75}.lid{fill:#8a6a4a}.bean{fill:#6b4228}.glint{fill:#ffffff;opacity:.6}
  .radio{fill:#c9693f}.grille{fill:#4a362a}.grille-ring{fill:none;stroke:#7a5a46;stroke-width:1.5}
  .dial{fill:#f3e2c0}.needle{stroke:#c83a3a;stroke-width:1.5}.knob{fill:#f3e2c0}.antenna{stroke:#6a5a50;stroke-width:1.5}
  .note{fill:#6a5a50;stroke:#6a5a50;stroke-width:1.4;opacity:0}
  .succ{fill:#79ad62}.spot{fill:#d9c4a8}
  .cat{fill:#8c7f77}.stripe{fill:none;stroke:#6c615a;stroke-width:2.4;stroke-linecap:round}
  .ear-in{fill:#d9a8a0}.eye{fill:none;stroke:#3a302b;stroke-width:1.4;stroke-linecap:round}
  .tail{fill:none;stroke:#8c7f77;stroke-width:8;stroke-linecap:round}

  /* Motion, all of it slow. */
  .bk{transform-box:fill-box;transform-origin:center;animation-name:bk;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
  @keyframes bk{0%,100%{opacity:var(--bklo,.35);transform:translate(0,0) scale(1)}50%{opacity:var(--bkhi,.6);transform:translate(16px,-5px) scale(1.12)}}
  .rainfall{animation:fall .8s linear infinite}
  .rainfall.slow{animation-duration:1.4s}
  .gust{animation:gust 11s ease-in-out infinite}
  @keyframes gust{0%,100%{opacity:.7;transform:translateX(0)}40%{opacity:1;transform:translateX(-30px)}55%{opacity:.85;transform:translateX(-8px)}}
  @keyframes fall{from{transform:translate(0,0)}to{transform:translate(-${Math.round(RAIN_H * 0.18)}px,${RAIN_H}px)}}
  .run{animation-name:run;animation-iteration-count:infinite;animation-timing-function:linear}
  @keyframes run{
    0%{transform:translate(0px,0px);opacity:0}
    6%{opacity:1}
    30%{transform:translate(0px,calc(var(--d) * .12))}
    38%{transform:translate(var(--w),calc(var(--d) * .18))}
    70%{transform:translate(var(--w),calc(var(--d) * .6))}
    78%{transform:translate(0px,calc(var(--d) * .68))}
    96%{transform:translate(0px,var(--d));opacity:1}
    100%{transform:translate(0px,var(--d));opacity:0}
  }
  .swing{animation:swing 7s ease-in-out infinite}
  @keyframes swing{0%,100%{transform:rotate(-1.8deg)}50%{transform:rotate(1.8deg)}}
  .glowfill{animation:breathe 8s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:var(--glo,.5)}50%{opacity:var(--ghi,.65)}}
  .steam{animation:steam 4s ease-out infinite}
  @keyframes steam{0%{transform:translateY(10px) scaleX(.7);opacity:0}25%{opacity:var(--st,.7)}100%{transform:translateY(-44px) scaleX(1.6) skewX(10deg);opacity:0}}
  .vine{animation:vine 7s ease-in-out infinite}
  @keyframes vine{0%,100%{transform:rotate(-3.5deg)}50%{transform:rotate(3.5deg)}}
  .flame{transform-box:fill-box;transform-origin:50% 100%;animation:flame 1.3s ease-in-out infinite}
  @keyframes flame{0%,100%{transform:scale(1,1)}30%{transform:scale(.88,1.08) skewX(2deg)}60%{transform:scale(1.05,.94) skewX(-2deg)}}
  .cglow{animation:cglow 3.2s ease-in-out infinite}
  @keyframes cglow{0%,100%{opacity:.85}40%{opacity:1}70%{opacity:.75}}
  .twinkle{animation:twinkle 5.8s ease-in-out infinite}
  @keyframes twinkle{0%,100%{opacity:.5}8%{opacity:1}22%{opacity:.5}}
  .breath{animation:breath 5.5s ease-in-out infinite}
  @keyframes breath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.05)}}
  .note{animation:note 4.4s ease-out infinite}
  @keyframes note{0%{transform:translate(0,4px) rotate(0);opacity:0}15%{opacity:.9}50%{transform:translate(calc(var(--dx) * .5),-22px) rotate(-12deg)}100%{transform:translate(var(--dx),-48px) rotate(10deg);opacity:0}}
  .s1{animation:strike 13s linear infinite}
  .s2{animation:strike 21s linear infinite;animation-delay:-8s}
  @keyframes strike{0%,86%{opacity:0}86.4%{opacity:1}87%{opacity:.1}87.6%{opacity:.9}88.8%,100%{opacity:0}}
  .go-l{animation-name:go-l;animation-timing-function:linear;animation-iteration-count:infinite}
  .go-r{animation-name:go-r;animation-timing-function:linear;animation-iteration-count:infinite}
  @keyframes go-l{from{transform:translateX(1720px)}to{transform:translateX(-120px)}}
  @keyframes go-r{from{transform:translateX(-120px)}to{transform:translateX(1720px)}}
  .bob{animation:bob .9s ease-in-out infinite}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}
  .leg{animation:stride .9s ease-in-out infinite}
  .leg2{animation-delay:-.45s}
  @keyframes stride{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
  .hit{animation-name:hit;animation-timing-function:ease-out;animation-iteration-count:infinite;transform-box:fill-box;transform-origin:center}
  @keyframes hit{0%{opacity:0;transform:scale(.2)}8%{opacity:1}35%{transform:scale(1);opacity:.6}100%{transform:scale(1.15);opacity:0}}
  .tailflick{animation:tail 6s ease-in-out infinite}
  @keyframes tail{0%,62%,100%{transform:rotate(0)}68%{transform:rotate(-14deg)}74%{transform:rotate(8deg)}80%{transform:rotate(-6deg)}86%{transform:rotate(0)}}
  .ear{animation:ear 7.5s ease-in-out infinite}
  @keyframes ear{0%,88%,100%{transform:rotate(0)}90%{transform:rotate(-9deg)}92%{transform:rotate(4deg)}94%{transform:rotate(0)}}
  .grille-ring{transform-box:fill-box;transform-origin:center;animation:beat .55s ease-in-out infinite}
  @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  .needle{animation:needle 5s ease-in-out infinite}
  @keyframes needle{0%,100%{transform:translateX(0)}50%{transform:translateX(12px)}}

  @media (prefers-color-scheme: dark){
    /* Dark: a rainy night. */
    .k0{stop-color:#0d1420}.k1{stop-color:#172231}.k2{stop-color:#1a1a20}.k3{stop-color:#17120f}
    .bldg{fill:#0a1019;opacity:.85}.bwin{fill:#ffc56b;opacity:.55}
    .cA{stop-color:#ffb347}.cB{stop-color:#ff5f6d}.cC{stop-color:#4fd1c5}.cD{stop-color:#fff1d0}
    .bk{--bklo:.4;--bkhi:.8}
    .rain{stroke:#c3d2e6;opacity:.42}
    .drop{fill:#04070c;opacity:.45}.fleck{fill:#ffd9a0;opacity:.8}
    .tr{stop-color:#ffd9a0}
    .wd{stop-color:#4a3220}
    .g0{stop-color:#ffb24d}
    .glowfill{--glo:.7;--ghi:.9}
    .cord{stroke:#0a0705}
    .shade{fill:#1d2e2a}.bulb{fill:#ffe1a0}
    .plank{fill:#3b2817}.plank-edge{fill:#24170d}
    .book1{fill:#7a3426}.book2{fill:#2a4a5e}.book3{fill:#8d6f2e}
    .mug{fill:#e8dccb}.mug-handle{stroke:#e8dccb}
    .steam{--st:.55}
    .stem{stroke:#2f4a24}
    .leaf{fill:#33582a}.leaf2{fill:#46723a}
    .pot{fill:#7a3f28}.potrim{fill:#5e2f1d}
    .rain.far{opacity:.18}
    .warm{fill:#ff9a3c;opacity:.07}
    .fogs{opacity:.3}.fg{stop-color:#8f9aab}
    .fl{stop-color:#cdd9ff}
    .skyflash{fill-opacity:.65}
    .u1{fill:#c8473c}.u2{fill:#d9a531}.u3{fill:#22918f}
    .body{fill:#0b0f16}.leg{stroke:#0b0f16}.handle{stroke:#0b0f16}
    .ring{stroke:#ffd9a0}
    .holder{fill:#3b2817}.wax{fill:#e0d2bb}.flame{fill:#ffb347}
    .wire{stroke:#120c08}
    .jar{fill:#5d7a84;opacity:.45}.lid{fill:#3b2817}.bean{fill:#3a2414}.glint{opacity:.35}
    .radio{fill:#7a3f28}.grille{fill:#24170d}.grille-ring{stroke:#4a3220}
    .dial{fill:#ffcf7a}.knob{fill:#d9c4a0}.antenna{stroke:#3a2a20}
    .note{fill:#ffcf7a;stroke:#ffcf7a}
    .succ{fill:#3e6b34}.spot{fill:#6b5a48}
    .cat{fill:#625650}.stripe{stroke:#463d39}.ear-in{fill:#7a5a56}.eye{stroke:#1a1412}
    .tail{stroke:#625650}
  }
  /* Narrower boxes crop the sides: slide the corner pieces in and shrink them,
     each from its own corner, so the lamp, the shelves and the plant stay in view. */
  .lc{transform-origin:0 0}.rc{transform-origin:1600px 0}
  @media (max-aspect-ratio: 4/3){.lc{transform:translateX(250px) scale(.95)}.rc{transform:translateX(-250px) scale(.95)}}
  @media (max-aspect-ratio: 11/10){.lc{transform:translateX(375px) scale(.85)}.rc{transform:translateX(-375px) scale(.85)}}
  @media (max-aspect-ratio: 17/20){.lc{transform:translateX(500px) scale(.7)}.rc{transform:translateX(-500px) scale(.7)}}
  /* Too narrow for both corners and the hanging plant: let the plant go. */
  @media (max-aspect-ratio: 17/20){.hang{display:none}}
  @media (max-aspect-ratio: 3/5){.lc{transform:translateX(600px) scale(.6)}.rc{transform:translateX(-600px) scale(.6)}}
  @media (prefers-reduced-motion: reduce){
    .bk,.rainfall,.run,.swing,.glowfill,.steam,.vine,.flame,.cglow,.twinkle,.breath,.note,.gust,.s1,.s2,.go-l,.go-r,.bob,.leg,.hit,.tailflick,.ear,.grille-ring,.needle{animation:none}
    .rainfall,.run,.steam,.note,.skyflash,.bolt,.car,.walk,.hit{display:none}
  }
</style>
<rect width="1600" height="1000" fill="url(#sky)"/>
<g mask="url(#viewmask)">
  ${bolt(1150, "s1")}${bolt(420, "s2")}
  <g filter="url(#soft)">${city()}</g>
  ${cars()}
  ${walkers()}
  <g>${bokeh()}</g>
  <g class="rain far"><g class="rainfall slow"><g>${rainTile(140, 6, 7)}</g><g transform="translate(${Math.round(RAIN_H * 0.18)} -${RAIN_H})">${rainTile(140, 6, 7)}</g></g></g>
  <g class="gust"><g class="rain"><g class="rainfall"><g>${rainTile(210, 12, 16)}</g><g transform="translate(${Math.round(RAIN_H * 0.18)} -${RAIN_H})">${rainTile(210, 12, 16)}</g></g></g></g>
  <rect class="warm" x="0" y="0" width="1600" height="${VIEW_END}"/>
</g>
<g class="lc"><rect class="glowfill" x="0" y="0" width="900" height="${VIEW_END + 60}" fill="url(#glow)"/></g>
<g mask="url(#viewmask)">${droplets()}${hits()}</g>
<g>${runs()}</g>
<g class="fogs" mask="url(#viewmask)">
  <rect x="0" y="0" width="220" height="${VIEW_END}" fill="url(#fogL)"/>
  <rect x="1380" y="0" width="220" height="${VIEW_END}" fill="url(#fogR)"/>
  <rect x="0" y="0" width="1600" height="80" fill="url(#fogT)"/>
</g>
<rect x="0" y="0" width="1600" height="${FRAME}" class="sill"/>
<rect x="0" y="0" width="${FRAME}" height="700" fill="url(#stilefade)"/>
<rect x="${1600 - FRAME}" y="0" width="${FRAME}" height="700" fill="url(#stilefade)"/>
<rect x="0" y="176" width="1600" height="7" fill="url(#barfade)" opacity=".75"/>
<rect x="531" y="${FRAME}" width="7" height="300" fill="url(#barfade)" opacity=".7"/>
<rect x="1062" y="${FRAME}" width="7" height="300" fill="url(#barfade)" opacity=".7"/>
<g class="lc">${shelf()}${lamp()}</g>
${stringLights()}
<g class="rc">${rightShelf()}<g class="hang">${plant()}</g></g>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'claudo-cafe', glass: { blur: 18, opacity: 0.74 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'claudo-cafe') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="A rainy cafe window along the top: lightning over the city, cars and people with umbrellas passing in the rain, blurred warm lights, drops running down the glass, string lights, a glowing pendant lamp over a candle and a steaming mug, a trailing plant, and a cat asleep on a shelf beside a little radio"
        isInteractive
      />
    )
  })
}
