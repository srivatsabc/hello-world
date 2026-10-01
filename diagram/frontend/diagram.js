// Date: October 1, 2026
// Name: Sri
// Desc: The end to end architecture diagram, drawn as SVG from data fetched
//       from the diagram microservice's API: zones (dotted boundaries with a
//       tag on the border), nodes (boxes) and edges (arrows with moving
//       dots). 'conventional' is the direct API path, 'ai' is the agent
//       path; anything on both lights up in either mode. Coordinates live in
//       the SVG's own 1830 x 840 space. Colours and icons stay here, the
//       data comes from the API. This is the diagram frontend; the diagram
//       backend serves it and the data.

const COLORS = { conventional: '#a3e635', ai: '#a5b4fc', both: '#e4e4e7' }
const BG = '#0b0b0d'

// Filled from the diagram backend's API (GET api/v1/diagram-management/diagrams/architecture, a relative path so it works
// both standalone and when embedded under a prefix) before the first render.
let ZONES = []
let NODES = []
let EDGES = []
let STEPS = {}
let FLOW_TITLES = {}
const NS = 'http://www.w3.org/2000/svg'

let mode = 'all'

// When embedded in the main app's Architecture tab, tell the parent how tall
// this page is so its iframe can size to fit instead of scrolling inside.
function reportHeight() {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'diagram-height', height: document.documentElement.scrollHeight }, '*')
  }
}
window.addEventListener('resize', reportHeight)

function active(flows) {
  return mode === 'all' || flows.includes(mode)
}

function accent() {
  return mode === 'ai' ? COLORS.ai : mode === 'conventional' ? COLORS.conventional : '#a1a1aa'
}

function edgeColor(flows) {
  if (mode === 'conventional') return COLORS.conventional
  if (mode === 'ai') return COLORS.ai
  return flows.length === 2 ? COLORS.both : COLORS[flows[0]]
}

function icon(name, x, y, size, color) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${window.ICONS[name]}</svg>`
}

function tag(x, y, text, color, iconName, anchor) {
  const w = text.length * 6.9 + 22 + (iconName ? 22 : 0)
  const left = anchor === 'right' ? x - w : x
  return `<g>
    <rect x="${left}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${BG}" stroke="${color}" stroke-opacity="0.6" />
    ${iconName ? icon(iconName, left + 8, y - 8, 16, color) : ''}
    <text x="${left + (iconName ? 30 : 11)}" y="${y + 4.5}" fill="${color}" font-size="12.5" font-weight="600">${text}</text>
  </g>`
}

function renderZone(z) {
  return `<g opacity="${active(z.flows) ? 1 : 0.2}" style="transition: opacity .3s">
    <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="18" fill="none" stroke="${z.color}" stroke-opacity="0.7" stroke-width="1.6" stroke-dasharray="3 6" stroke-linecap="round" />
  </g>`
}

function renderZoneTags(z) {
  return `<g opacity="${active(z.flows) ? 1 : 0.2}" style="transition: opacity .3s">
    ${tag(z.x + 18, z.y, z.tag, z.color, z.icon)}
    ${z.tag2 ? tag(z.x + z.w - 18, z.tag2_at === 'top' ? z.y : z.y + z.h, z.tag2, z.color, null, 'right') : ''}
  </g>`
}

// Each dot starts hidden and only appears when its own animation begins: a dot with a delayed
// start would otherwise sit at the SVG's top-left corner (0,0) until then, which showed up as a
// small stray mark flashing in the corner of the diagram.
function renderEdge(e) {
  const on = active(e.flows)
  const color = edgeColor(e.flows)
  const out = [0, 1.2]
    .map((b) => `<circle r="5" fill="${color}" visibility="hidden"><set attributeName="visibility" to="visible" begin="${b}s" fill="freeze" /><animateMotion dur="2.4s" begin="${b}s" repeatCount="indefinite" path="${e.d}" /></circle>`)
    .join('')
  const back = `<circle r="2.8" fill="${color}" opacity="0.55" visibility="hidden"><set attributeName="visibility" to="visible" begin="0.6s" fill="freeze" /><animateMotion dur="2.4s" begin="0.6s" repeatCount="indefinite" path="${e.d}" keyPoints="1;0" keyTimes="0;1" calcMode="linear" /></circle>`
  const label = e.label ? `<text x="${e.lx}" y="${e.ly}" text-anchor="${e.anchor}" fill="#a1a1aa" font-size="12" font-style="italic">${e.label}</text>` : ''
  return `<g opacity="${on ? 1 : 0.15}" style="transition: opacity .3s">
    <path d="${e.d}" fill="none" stroke="${on ? color : '#52525b'}" stroke-opacity="${on ? 0.55 : 1}" stroke-width="2" />
    ${on ? out + back : ''}${label}
  </g>`
}

function renderNode(n) {
  const on = active(n.flows)
  const c = accent()
  const stroke = on ? c : '#3f3f46'
  const dash = n.ghost ? 'stroke-dasharray="5 4"' : ''
  let inner
  if (n.big) {
    const cx = n.x + n.w / 2
    const titleY = n.chips ? n.y + 66 : n.y + n.h / 2 + 30
    inner = `${icon(n.icon, cx - 18, n.y + 14, 36, c)}
      <text x="${cx}" y="${titleY}" text-anchor="middle" fill="#f4f4f5" font-size="16" font-weight="600">${n.title}</text>
      <text x="${cx}" y="${titleY + 17}" text-anchor="middle" fill="#71717a" font-size="12">${n.sub}</text>`
  } else {
    const lines = Array.isArray(n.sub) ? n.sub : n.sub ? [n.sub] : []
    // A list of lines (the API boxes list their paths) is laid out from the top; a single line stays centred.
    const ty = Array.isArray(n.sub) ? n.y + 24 : n.sub ? n.y + n.h / 2 - 2 : n.y + n.h / 2 + 5
    inner = `${icon(n.icon, n.x + 10, n.y + n.h / 2 - 10, 20, c)}
      <text x="${n.x + 38}" y="${ty}" fill="#f4f4f5" font-size="14.5" font-weight="600" ${n.ghost ? 'font-style="italic"' : ''}>${n.title}</text>
      ${lines.map((l, i) => `<text x="${n.x + 38}" y="${ty + 16 * (i + 1) - (Array.isArray(n.sub) ? 0 : 1)}" fill="#a1a1aa" font-size="11.5">${l}</text>`).join('')}`
  }
  const chips = n.chips
    ? ['conventional', 'ai']
        .map((f, i) => {
          const dim = active([f]) ? 1 : 0.3
          return `<g opacity="${dim}"><rect x="${n.x + 12}" y="${n.y + 96 + i * 40}" width="${n.w - 24}" height="30" rx="8" fill="${COLORS[f]}" fill-opacity="0.12" stroke="${COLORS[f]}" stroke-opacity="0.5" />
            <text x="${n.x + n.w / 2}" y="${n.y + 116 + i * 40}" text-anchor="middle" fill="${COLORS[f]}" font-size="13" font-weight="500">${f === 'ai' ? 'AI tab' : 'Conventional tab'}</text></g>`
        })
        .join('')
    : ''
  return `<g opacity="${on ? (n.ghost ? 0.7 : 1) : 0.25}" style="transition: opacity .3s">
    <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="#18181b" stroke="${stroke}" stroke-width="1.5" ${dash} />
    ${inner}${chips}
  </g>`
}

function renderSteps() {
  const flows = mode === 'all' ? ['conventional', 'ai'] : [mode]
  document.getElementById('steps').innerHTML = flows
    .map(
      (f) => `<section class="card"><h2 class="${f}">${FLOW_TITLES[f]}</h2><ol>${STEPS[f].map((s) => `<li>${s}</li>`).join('')}</ol></section>`,
    )
    .join('')
}

function render() {
  const svg = document.getElementById('diagram')
  svg.setAttribute('xmlns', NS)
  svg.innerHTML = ZONES.map(renderZone).join('') + EDGES.map(renderEdge).join('') + NODES.map(renderNode).join('') + ZONES.map(renderZoneTags).join('')
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode))
  // Shown only once there is a diagram to show, so an empty box never flashes first.
  document.getElementById('diagram-card').hidden = false
  document.getElementById('downloads').hidden = false
  renderSteps()
}

document.querySelectorAll('[data-mode]').forEach((b) =>
  b.addEventListener('click', () => {
    mode = b.dataset.mode
    render()
    reportHeight()
  }),
)

// Builds a standalone copy of the current diagram: a background so it is not
// transparent, an explicit size and font, and (optionally) without the moving
// dots, which a still image cannot show.
function exportSvgString({ animated }) {
  const clone = document.getElementById('diagram').cloneNode(true)
  clone.setAttribute('xmlns', NS)
  clone.setAttribute('width', '1830')
  clone.setAttribute('height', '840')
  clone.setAttribute('font-family', 'system-ui, -apple-system, Segoe UI, sans-serif')
  clone.removeAttribute('role')
  if (!animated) clone.querySelectorAll('animateMotion').forEach((a) => a.parentElement.remove())
  const bg = document.createElementNS(NS, 'rect')
  bg.setAttribute('width', '1830')
  bg.setAttribute('height', '840')
  bg.setAttribute('fill', BG)
  clone.insertBefore(bg, clone.firstChild)
  return new XMLSerializer().serializeToString(clone)
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function downloadSvg() {
  saveBlob(new Blob([exportSvgString({ animated: true })], { type: 'image/svg+xml' }), `architecture-${mode}.svg`)
}

// PNG is rendered at 2x so it stays sharp in slides and documents.
function downloadPng() {
  const svgUrl = URL.createObjectURL(new Blob([exportSvgString({ animated: false })], { type: 'image/svg+xml' }))
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 3660
    canvas.height = 1680
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(svgUrl)
    canvas.toBlob((blob) => saveBlob(blob, `architecture-${mode}.png`), 'image/png')
  }
  img.src = svgUrl
}

document.getElementById('dl-svg').addEventListener('click', downloadSvg)
document.getElementById('dl-png').addEventListener('click', downloadPng)

const startMode = new URLSearchParams(location.search).get('mode')
if (['all', 'conventional', 'ai'].includes(startMode)) mode = startMode

fetch('api/v1/diagram-management/diagrams/architecture')
  .then((r) => r.json())
  .then((data) => {
    ZONES = data.zones
    NODES = data.nodes
    EDGES = data.edges
    STEPS = data.steps
    FLOW_TITLES = data.flow_titles
    render()
    reportHeight()
  })
  .catch(() => {
    document.getElementById('steps').textContent = 'Could not load the diagram from the API.'
  })
