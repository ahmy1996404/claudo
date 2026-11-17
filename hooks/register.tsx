import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Claudo: realistic deep space, dark. A black hole bends the light of its own
// accretion disk over and under its shadow, among nebulae with dark dust lanes
// in a dense, fine starfield. Light mode is the same sky seen from the top of the
// atmosphere, fading through its blue glow into the page; dark mode is near
// black. All of it lives in the top third and the very edges.
const { theme, problems } = makeColors({
  label: 'Claudo',
  roles: { accent: '#7b86ff', danger: '#e5484d', success: '#3fb37f', warning: '#e3a33b', pro: '#c77dff' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#ecedf2',
        'surface-1': '#f2f3f7',
        'surface-2': '#f8f8fb',
        'text-primary': '#15161f',
        'text-secondary': '#3d3f52',
        'text-muted': '#55576c',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#07070c',
        'surface-1': '#0d0d14',
        'surface-2': '#12121a',
        'surface-3': '#16161f',
        'text-primary': '#ececf3',
        'text-secondary': '#c3c2d2',
        'text-muted': '#9c9bb0',
      },
    },
  },
})

const VIEW_END = 460 // where space has faded into the page

// A seeded generator, so the sky comes out the same every time.
let seed = 424242
function rand(): number {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
// Roughly bell-shaped, centred on 0, spread about 0.5.
const g = () => rand() + rand() + rand() - 1.5
const n = (v: number) => v.toFixed(0)
const d = (v: number) => v.toFixed(1)
const o2 = (v: number) => v.toFixed(2).replace(/^0/, '')
const pick = (list: string[]) => list[Math.floor(rand() * list.length)] ?? list[0] ?? ''

type Cloud = {
  cx: number
  cy: number
  sx: number
  sy: number
  rot: number
  count: number
  colors: string[]
  rMin: number
  rMax: number
  oMin: number
  oMax: number
}

// A nebula is many soft, overlapping glows, each a stretched radial gradient.
function cloud(c: Cloud): string {
  const groups: Record<string, string> = {}
  const cos = Math.cos(c.rot)
  const sin = Math.sin(c.rot)
  for (let i = 0; i < c.count; i++) {
    const u = g() * c.sx
    const v = g() * c.sy
    const x = c.cx + u * cos - v * sin
    const y = c.cy + u * sin + v * cos
    const r = c.rMin + Math.pow(rand(), 1.6) * (c.rMax - c.rMin)
    const ry = r * (0.35 + rand() * 0.55)
    const a = (c.rot * 180) / Math.PI + (rand() - 0.5) * 50
    const o = c.oMin + rand() * (c.oMax - c.oMin)
    const col = pick(c.colors)
    groups[col] = (groups[col] ?? '') + `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r)}" ry="${n(ry)}" opacity="${o2(o)}" transform="rotate(${n(a)} ${n(x)} ${n(y)})"/>`
  }
  return Object.entries(groups).map(([k, v]) => `<g fill="url(#${k})">${v}</g>`).join('')
}

// Fine stars, sorted into a few colors; many crowd along the Milky Way's band.
function starDust(count: number, rMin: number, rMax: number, oMin: number, oMax: number, tiled = false): string {
  const groups: Record<string, string> = { sw: '', sb: '', sy: '', so: '' }
  for (let i = 0; i < count; i++) {
    let x: number
    let y: number
    if (tiled) {
      x = rand() * 1600
      y = rand() < 0.4 ? 205 + Math.sin((x / 1600) * Math.PI * 2) * 40 + g() * 70 : rand() * (VIEW_END - 20)
    } else if (rand() < 0.42) {
      const u = (rand() - 0.5) * 1800
      x = 800 + u
      y = 205 - u * 0.18 + g() * 70
    } else {
      x = rand() * 1600
      y = rand() * (VIEW_END - 20)
    }
    const t = rand()
    const key = t < 0.55 ? 'sw' : t < 0.78 ? 'sb' : t < 0.92 ? 'sy' : 'so'
    groups[key] += `<circle cx="${n(x)}" cy="${n(y)}" r="${o2(rMin + rand() * (rMax - rMin))}" opacity="${o2(oMin + rand() * (oMax - oMin))}"/>`
  }
  return Object.entries(groups).map(([k, v]) => `<g class="${k}">${v}</g>`).join('')
}

function twinklers(count: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * 1600
    const y = rand() * (VIEW_END - 60)
    out += `<circle class="${pick(['sw', 'sb', 'sw', 'sy'])} tw" cx="${n(x)}" cy="${n(y)}" r="${d(0.8 + rand() * 0.6)}" style="animation-delay:-${d(rand() * 8)}s;animation-duration:${d(3 + rand() * 5)}s"/>`
  }
  return out
}

// Stars that slowly brighten, glow, then fade right out, each on its own clock.
function flareStars(count: number): string {
  let out = ''
  let placed = 0
  while (placed < count) {
    const x = rand() * 1600
    const y = 12 + rand() * 360
    if (Math.abs(x - 800) < 280 && y < 270) {
      continue // keep clear of the black hole
    }
    const big = placed % 3 === 0
    const s = big ? 1 + rand() * 0.5 : 0.55 + rand() * 0.4
    const glow = pick(['sgw', 'sgw', 'sgy', 'sgo'])
    out += `<g transform="translate(${n(x)} ${n(y)}) scale(${d(s)})"><g class="flare" style="animation-duration:${d(7 + rand() * 9)}s;animation-delay:-${d(rand() * 16)}s"><circle r="9" fill="url(#${glow})"/>${big ? '<path class="spk" d="M-22 0 L0 -.5 L22 0 L0 .5Z M0 -22 L.5 0 L0 22 L-.5 0Z"/>' : ''}<circle class="score" r="1.3"/></g></g>`
    placed++
  }
  return out
}

// A bright star: a soft glow, a hard core and four tapered diffraction spikes.
function brightStar(x: number, y: number, s: number, glow: string, i: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="btw" style="animation-delay:-${d(i * 1.7)}s;animation-duration:${d(5 + (i % 4) * 1.5)}s">
  <circle r="14" fill="url(#${glow})"/>
  <path class="spk" d="M-30 0 L0 -.6 L30 0 L0 .6Z M0 -30 L.6 0 L0 30 L-.6 0Z"/>
  <circle class="score" r="1.5"/></g></g>`
}

function galaxy(x: number, y: number, rot: number, s: number): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity=".85">
  <ellipse rx="48" ry="12" fill="url(#gxd)"/><ellipse rx="18" ry="5" fill="url(#gxc)"/>
  <ellipse rx="40" ry="1.6" cy="1.8" class="lane"/></g>`
}

// The black hole's disk: many thin rings, hottest and brightest inside, and
// brighter on the left, the side turning toward us.
function disk(): string {
  let out = ''
  for (let i = 0; i < 24; i++) {
    const t = i / 23
    const rx = 72 + t * 180
    const w = 1 + (1 - t) * 2.6 + rand() * 1.1
    const o = (1 - t * 0.7) * (0.55 + rand() * 0.45)
    const grad = t < 0.25 ? 'dh' : t < 0.6 ? 'dm' : 'dc'
    out += `<ellipse rx="${d(rx)}" ry="${d(rx * 0.11)}" stroke="url(#${grad})" stroke-width="${d(w)}" opacity="${o.toFixed(2)}"/>`
  }
  out += '<ellipse class="flow" rx="200" ry="22" stroke-width="1.6" stroke-dasharray="60 40 20 90"/>'
  out += '<ellipse class="flow fl2" rx="140" ry="15.4" stroke-width="1.4" stroke-dasharray="60 40 20 90"/>'
  out += '<ellipse class="flow fl3" rx="96" ry="10.6" stroke-width="1.2" stroke-dasharray="60 40 20 90"/>'
  return out
}

function blackHole(): string {
  const dk = disk()
  return `<ellipse class="bhbreathe" rx="330" ry="150" fill="url(#bhhalo)"/>
  <ellipse rx="150" ry="112" fill="url(#bhinner)"/>
  <g class="dsk">${dk}</g>
  ${hotSpot(false)}${hotSpot(false, 150, 9, 4.5)}
  <ellipse class="lens" rx="108" ry="96" stroke-width="3" opacity=".35"/>
  <ellipse class="lens" rx="95" ry="85" stroke-width="11" opacity=".85"/>
  <ellipse class="lens" rx="84" ry="76" stroke-width="3.5"/>
  <ellipse class="pring2" rx="71" ry="69" stroke-width=".7"/>
  <circle class="pring" r="66.5" stroke-width="1.6"/>
  <circle class="shadow" r="64"/>
  <g class="dsk" clip-path="url(#bhfront)">${dk}</g>
  ${hotSpot(true)}${hotSpot(true, 150, 9, 4.5)}`
}

// A young cluster still wrapped in the nebula it was born from.
function youngStars(): string {
  let out = ''
  for (let i = 0; i < 34; i++) {
    out += `<circle cx="${n(300 + g() * 110)}" cy="${n(140 + g() * 45)}" r="${(0.5 + rand() * 0.9).toFixed(2)}" opacity="${(0.5 + rand() * 0.5).toFixed(2)}"/>`
  }
  return `<g class="sb">${out}</g>`
}

// A bright clump of gas riding the inner disk: seen in front on the near half,
// hidden behind the shadow on the far half.
function hotSpot(front: boolean, rx = 112, dur = 6, begin = 0): string {
  const ry = rx * 0.11
  const path = `M${rx} 0 A${rx} ${ry} 0 0 1 ${-rx} 0 A${rx} ${ry} 0 0 1 ${rx} 0`
  return `<g class="orbit"><g opacity="${front ? 1 : 0}">
    <animate attributeName="opacity" values="${front ? '1;0' : '0;1'}" keyTimes="0;0.5" dur="${dur}s" begin="-${begin}s" calcMode="discrete" repeatCount="indefinite"/>
    <animateMotion path="${path}" dur="${dur}s" begin="-${begin}s" repeatCount="indefinite"/>
    <ellipse rx="12" ry="3.2" fill="url(#spotg)"/><ellipse rx="3" ry="1" class="score"/>
  </g></g>`
}

function meteors(): string {
  const spots: Array<[number, number, number, number]> = [
    [430, 50, 19, 0],
    [1030, 70, 27, 9],
    [660, 250, 23, 15],
    [1250, 280, 31, 4],
    [240, 90, 13, 6],
    [880, 30, 17, 2],
    [1420, 120, 21, 12],
  ]
  let out = ''
  for (const [x, y, dur, delay] of spots) {
    out += `<g transform="translate(${x} ${y})"><g class="meteor" style="animation-duration:${dur}s;animation-delay:-${delay}s"><path d="M-170 -52 L0 0" stroke="url(#metg)" stroke-width="1.3" stroke-linecap="round"/></g></g>`
  }
  return out
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMin slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
    <stop class="k0" offset="0"/><stop class="k1" offset=".18"/><stop class="k2" offset=".3"/><stop class="k3" offset=".38"/><stop class="k4" offset="${(VIEW_END / 1000).toFixed(2)}"/><stop class="k4" offset="1"/>
  </linearGradient>
  <linearGradient id="viewfade" x1="0" y1="0" x2="0" y2="${VIEW_END}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff"/><stop class="mk1" offset=".5" stop-color="#fff"/><stop class="mk2" offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="viewmask"><rect x="0" y="0" width="1600" height="${VIEW_END}" fill="url(#viewfade)"/></mask>
  <radialGradient id="nr"><stop class="cr" offset="0"/><stop class="cr" offset=".45" stop-opacity=".45"/><stop class="cr" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="nm"><stop class="cm" offset="0"/><stop class="cm" offset=".45" stop-opacity=".45"/><stop class="cm" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="nt"><stop class="ct" offset="0"/><stop class="ct" offset=".45" stop-opacity=".45"/><stop class="ct" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="nb"><stop class="cb" offset="0"/><stop class="cb" offset=".45" stop-opacity=".45"/><stop class="cb" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="nw"><stop class="cw" offset="0"/><stop class="cw" offset=".45" stop-opacity=".45"/><stop class="cw" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="nk"><stop class="ck" offset="0"/><stop class="ck" offset=".5" stop-opacity=".6"/><stop class="ck" offset="1" stop-opacity="0"/></radialGradient>
  <radialGradient id="sgw"><stop offset="0" stop-color="#e8efff" stop-opacity=".95"/><stop offset=".18" stop-color="#c8d6ff" stop-opacity=".35"/><stop offset="1" stop-color="#c8d6ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="sgy"><stop offset="0" stop-color="#fff4dc" stop-opacity=".95"/><stop offset=".18" stop-color="#ffe2b0" stop-opacity=".32"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/></radialGradient>
  <radialGradient id="sgo"><stop offset="0" stop-color="#ffe0c4" stop-opacity=".95"/><stop offset=".18" stop-color="#ffb47a" stop-opacity=".3"/><stop offset="1" stop-color="#ffb47a" stop-opacity="0"/></radialGradient>
  <radialGradient id="gxd"><stop offset="0" stop-color="#dfe4ff" stop-opacity=".45"/><stop offset="1" stop-color="#dfe4ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="gxc"><stop offset="0" stop-color="#fff6e2" stop-opacity=".95"/><stop offset="1" stop-color="#fff6e2" stop-opacity="0"/></radialGradient>
  <radialGradient id="bhhalo"><stop offset="0" stop-color="#ffb46a" stop-opacity=".32"/><stop offset=".4" stop-color="#d06a3a" stop-opacity=".12"/><stop offset="1" stop-color="#7a2e2a" stop-opacity="0"/></radialGradient>
  <radialGradient id="bhinner"><stop offset=".5" stop-color="#ffcf96" stop-opacity=".35"/><stop offset="1" stop-color="#ffcf96" stop-opacity="0"/></radialGradient>
  <linearGradient id="dh" x1="-260" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="#ffe6bc" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf96" stop-opacity=".5"/></linearGradient>
  <linearGradient id="dm" x1="-260" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffdcaa"/><stop offset=".5" stop-color="#ff9f52" stop-opacity=".8"/><stop offset="1" stop-color="#d0642c" stop-opacity=".4"/></linearGradient>
  <linearGradient id="dc" x1="-260" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f09050"/><stop offset=".5" stop-color="#b8522a" stop-opacity=".7"/><stop offset="1" stop-color="#6e2618" stop-opacity=".35"/></linearGradient>
  <linearGradient id="lensg" x1="0" y1="-100" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff2d8"/><stop offset=".3" stop-color="#ffbf7a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffbf7a" stop-opacity="0"/><stop offset=".7" stop-color="#ffbf7a" stop-opacity=".35"/><stop offset="1" stop-color="#ffe2b8" stop-opacity=".75"/></linearGradient>
  <linearGradient id="metg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".9"/></linearGradient>
  <linearGradient id="airg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd0c4" stop-opacity="0"/><stop offset=".55" stop-color="#6fd0c4" stop-opacity=".28"/><stop offset="1" stop-color="#6fd0c4" stop-opacity="0"/></linearGradient>
  <radialGradient id="sung"><stop offset="0" stop-color="#fff3dc" stop-opacity=".22"/><stop offset=".35" stop-color="#ffd9a8" stop-opacity=".07"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient>
  <radialGradient id="spotg"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe6bc" stop-opacity=".5"/><stop offset="1" stop-color="#ffbf7a" stop-opacity="0"/></radialGradient>
  <linearGradient id="pringg" x1="-70" y1="0" x2="70" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffaf0"/><stop offset=".5" stop-color="#fff0d8" stop-opacity=".8"/><stop offset="1" stop-color="#ffd8a8" stop-opacity=".4"/></linearGradient>
  <linearGradient id="iontail" x1="0" y1="0" x2="236" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#bcd8ff" stop-opacity=".75"/><stop offset="1" stop-color="#bcd8ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="dusttail" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0d6" stop-opacity="1"/><stop offset="1" stop-color="#fff0d6" stop-opacity="0"/></linearGradient>
  <radialGradient id="coma"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".3" stop-color="#dbe8ff" stop-opacity=".35"/><stop offset="1" stop-color="#dbe8ff" stop-opacity="0"/></radialGradient>
  <clipPath id="bhfront"><rect x="-300" y="0" width="600" height="60"/></clipPath>
</defs>
<style>
  /* Light: the same sky from the top of the atmosphere, fading through its glow. */
  .k0{stop-color:#02030c}.k1{stop-color:#060a20}.k2{stop-color:#1a275a}.k3{stop-color:#8798d0}.k4{stop-color:#ecedf2}
  .mk1{stop-opacity:.75}.mk2{stop-opacity:.2}
  .cr{stop-color:#d8305c}.cm{stop-color:#b03cb0}.ct{stop-color:#1ca8c2}.cb{stop-color:#4260e0}.cw{stop-color:#e8944e}.ck{stop-color:#000000}
  .nebula{opacity:1}
  .sw{fill:#ffffff}.sb{fill:#cddaff}.sy{fill:#fff0d2}.so{fill:#ffcfa6}
  .spk{fill:#ffffff;opacity:.5}.score{fill:#ffffff}
  .lane{fill:#000000;opacity:.35}
  .dsk ellipse{fill:none}
  .flow{stroke:#fff4e0;opacity:.22}
  .lens{fill:none;stroke:url(#lensg)}
  .pring{fill:none;stroke:url(#pringg);opacity:.9}.pring2{fill:none;stroke:#fff3dc;opacity:.45}
  .shadow{fill:#000000}
  .airglow{fill:url(#airg)}
  .satdot{fill:#ffffff}

  /* Motion: slow, the way things move out there. */
  .tw{animation:tw ease-in-out infinite}
  @keyframes tw{0%,100%{opacity:1}50%{opacity:0}}
  .flare{opacity:0;transform-box:fill-box;transform-origin:center;animation:flare ease-in-out infinite}
  @keyframes flare{0%{opacity:0;transform:scale(.5)}22%{opacity:1;transform:scale(1.15)}38%{opacity:.9;transform:scale(1)}62%,100%{opacity:0;transform:scale(.6)}}
  .btw{transform-box:fill-box;transform-origin:center;animation:btw ease-in-out infinite}
  @keyframes btw{0%,100%{transform:scale(.94);opacity:.85}50%{transform:scale(1.06);opacity:1}}
  .nebula{animation:neb 120s ease-in-out infinite}
  @keyframes neb{0%,100%{transform:translate(0,0)}50%{transform:translate(16px,-5px)}}
  .bhbreathe{transform-box:fill-box;transform-origin:center;animation:breathe 9s ease-in-out infinite}
  @keyframes breathe{0%,100%{opacity:.8;transform:scale(.97)}50%{opacity:1;transform:scale(1.04)}}
  .flow{animation:flow 10s linear infinite}.fl2{animation-duration:6.5s}.fl3{animation-duration:4s}
  @keyframes flow{to{stroke-dashoffset:-840}}
  .pring{animation:pring 4s ease-in-out infinite alternate}
  @keyframes pring{from{opacity:.65}to{opacity:1}}
  .meteor{opacity:0;animation:meteor 23s linear infinite}
  @keyframes meteor{0%{opacity:0;transform:translate(0,0)}1%{opacity:1}5%{opacity:0;transform:translate(420px,128px)}100%{opacity:0;transform:translate(420px,128px)}}
  .cdrift{animation:cdrift 160s ease-in-out infinite alternate}
  @keyframes cdrift{to{transform:translate(-26px,-7px)}}
  .satp{animation:satp 60s linear infinite;animation-delay:-20s}
  .drift{animation:drift 480s linear infinite}
  @keyframes drift{to{transform:translateX(-1600px)}}
  .nbr{animation:nbr 26s ease-in-out infinite}.n2{animation-duration:34s;animation-delay:-11s}.n3{animation-duration:30s;animation-delay:-19s}.n4{animation-duration:38s;animation-delay:-6s}
  @keyframes nbr{0%,100%{opacity:.78}50%{opacity:1}}
  @keyframes satp{to{transform:translate(1720px,-36px)}}
  .satdot{animation:sblink 2.6s steps(1) infinite}
  @keyframes sblink{0%,80%{opacity:.55}85%,95%{opacity:1}100%{opacity:.55}}

  @media (prefers-color-scheme: dark){
    /* Dark: near-black space. */
    .k0{stop-color:#000002}.k1{stop-color:#020207}.k2{stop-color:#04040a}.k3{stop-color:#06060b}.k4{stop-color:#07070c}
    .mk1{stop-opacity:1}.mk2{stop-opacity:.6}
    .airglow{display:none}
  }
  /* Narrower boxes crop the sides: shrink the black hole so its disk stays in view. */
  .bhw{transform-origin:800px 150px}
  @media (max-aspect-ratio: 11/10){.bhw{transform:scale(.85)}.comet{display:none}}
  @media (max-aspect-ratio: 17/20){.bhw{transform:scale(.72)}}
  @media (max-aspect-ratio: 3/5){.bhw{transform:scale(.6)}}
  @media (prefers-reduced-motion: reduce){
    .tw,.btw,.nebula,.bhbreathe,.flow,.pring,.meteor,.satp,.satdot,.cdrift,.drift,.nbr,.flare{animation:none}
    .flare{opacity:.7}
    .meteor,.sat,.orbit{display:none}
  }
</style>
<rect width="1600" height="1000" fill="url(#sky)"/>
<rect class="airglow" x="0" y="250" width="1600" height="120"/>
<g mask="url(#viewmask)">
  <ellipse cx="-60" cy="-40" rx="760" ry="420" fill="url(#sung)"/>
  <g class="nebula">
    ${cloud({ cx: 800, cy: 205, sx: 900, sy: 40, rot: -0.18, count: 60, colors: ['nb', 'nw', 'nb'], rMin: 30, rMax: 120, oMin: 0.03, oMax: 0.08 })}
    <g class="nbr">${cloud({ cx: 330, cy: 150, sx: 260, sy: 90, rot: -0.35, count: 120, colors: ['nr', 'nr', 'nm', 'nt', 'nb', 'nw'], rMin: 25, rMax: 150, oMin: 0.1, oMax: 0.36 })}
    ${cloud({ cx: 300, cy: 140, sx: 150, sy: 60, rot: -0.35, count: 22, colors: ['nw', 'nr', 'nt'], rMin: 8, rMax: 30, oMin: 0.3, oMax: 0.6 })}</g>
    <g class="nbr n2">${cloud({ cx: 640, cy: 250, sx: 230, sy: 60, rot: -0.12, count: 45, colors: ['nr', 'nm', 'nt', 'nr'], rMin: 25, rMax: 120, oMin: 0.07, oMax: 0.24 })}</g>
    <g class="nbr n3">${cloud({ cx: 1340, cy: 230, sx: 200, sy: 70, rot: 0.3, count: 40, colors: ['nt', 'nb', 'nm'], rMin: 25, rMax: 120, oMin: 0.07, oMax: 0.22 })}</g>
    ${cloud({ cx: 320, cy: 162, sx: 230, sy: 30, rot: -0.42, count: 26, colors: ['nk'], rMin: 20, rMax: 80, oMin: 0.25, oMax: 0.55 })}
    ${cloud({ cx: 250, cy: 128, sx: 50, sy: 40, rot: 0, count: 16, colors: ['nb', 'nb', 'nt'], rMin: 15, rMax: 60, oMin: 0.08, oMax: 0.2 })}
    ${cloud({ cx: 1050, cy: 100, sx: 200, sy: 20, rot: 0.15, count: 14, colors: ['nk'], rMin: 20, rMax: 70, oMin: 0.15, oMax: 0.35 })}
    <g class="nbr n4">${cloud({ cx: 1060, cy: 90, sx: 220, sy: 70, rot: 0.2, count: 50, colors: ['nb', 'nm', 'nt'], rMin: 30, rMax: 140, oMin: 0.07, oMax: 0.24 })}</g>
    ${cloud({ cx: 1520, cy: 330, sx: 120, sy: 80, rot: 0.6, count: 20, colors: ['nt', 'nb'], rMin: 30, rMax: 110, oMin: 0.06, oMax: 0.14 })}
  </g>
  ${starDust(560, 0.3, 0.75, 0.3, 0.95)}
  ${((t: string) => `<g class="drift"><g>${t}</g><g transform="translate(1600 0)">${t}</g></g>`)(starDust(150, 0.45, 1, 0.5, 1, true))}
  ${youngStars()}
  ${starDust(70, 0.75, 1.15, 0.6, 1)}
  ${twinklers(42)}
  ${flareStars(20)}
  ${galaxy(600, 62, -24, 1)}${galaxy(1010, 38, 40, 0.5)}
  ${meteors()}
  <g class="comet" transform="translate(980 290)"><g class="cdrift">
    <g transform="rotate(17.4)" fill="url(#iontail)"><ellipse cx="118" rx="118" ry="2.6" opacity=".35"/><ellipse cx="112" rx="112" ry="1" opacity=".7"/></g>
    <g transform="rotate(8)" fill="url(#dusttail)"><ellipse cx="110" cy="6" rx="110" ry="20" opacity=".16"/><ellipse cx="96" cy="4" rx="96" ry="13" opacity=".2"/><ellipse cx="80" cy="2.5" rx="80" ry="8" opacity=".26"/><ellipse cx="60" cy="1" rx="60" ry="4" opacity=".34"/></g>
    <circle r="8" fill="url(#coma)"/><circle class="score" r="1.4"/>
  </g></g>
</g>
${brightStar(250, 128, 1, 'sgw', 0)}${brightStar(512, 214, 0.7, 'sgy', 1)}${brightStar(1100, 210, 0.85, 'sgw', 2)}${brightStar(90, 300, 0.6, 'sgo', 3)}${brightStar(1240, 30, 0.55, 'sgy', 4)}${brightStar(690, 30, 0.5, 'sgw', 5)}
<g class="sat"><g transform="translate(-40 96)"><g class="satp"><circle class="satdot" r="1.3"/></g></g></g>
<g class="bhw"><g transform="translate(800 150) rotate(-6)">${blackHole()}</g></g>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'claudo-space', glass: { blur: 20, opacity: 0.76 } },
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
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'claudo-space') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Realistic deep space along the top: a black hole whose glowing accretion disk bends over and under its shadow, nebulae with dark dust lanes and a young star cluster, a comet with two tails, a dense field of stars, the odd meteor and a satellite passing"
        isInteractive
      />
    )
  })
}
