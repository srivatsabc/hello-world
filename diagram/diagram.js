// Date: October 1, 2026
// Name: Sri
// Desc: The end to end architecture diagram, drawn as SVG from plain data:
//       zones (dotted boundaries with a tag on the border), nodes (boxes) and
//       edges (arrows with moving dots). 'conventional' is the direct API
//       path, 'ai' is the agent path; anything on both lights up in either
//       mode. Coordinates live in the SVG's own 1700 x 860 space. Standalone
//       on purpose: this is an explainer, not part of the app itself.

const COLORS = { conventional: '#a3e635', ai: '#a5b4fc', both: '#e4e4e7' }
const BG = '#0b0b0d'
const BOTH = ['conventional', 'ai']

const ZONES = [
  { id: 'frontend', x: 145, y: 210, w: 225, h: 300, tag: 'microservice · frontend', icon: 'container', color: '#a1a1aa', flows: BOTH },
  { id: 'backend', x: 400, y: 40, w: 1020, h: 790, tag: 'microservice · backend API', icon: 'container', color: '#a1a1aa', flows: BOTH },
  { id: 'api', x: 430, y: 100, w: 230, h: 480, tag: 'API layer', color: '#71717a', flows: BOTH },
  { id: 'agent', x: 720, y: 380, w: 420, h: 380, tag: 'AI agent', color: '#818cf8', flows: ['ai'] },
  { id: 'model', x: 740, y: 495, w: 150, h: 110, tag: 'model', color: '#818cf8', flows: ['ai'] },
  { id: 'tools', x: 910, y: 495, w: 210, h: 245, tag: 'tool definitions', tag2: 'internal or external', color: '#818cf8', flows: ['ai'] },
  { id: 'services', x: 1195, y: 200, w: 215, h: 210, tag: 'service layer', color: '#a3e635', flows: BOTH },
  { id: 'ext_api', x: 1470, y: 265, w: 200, h: 130, tag: 'external API', color: '#fbbf24', flows: BOTH },
  { id: 'ext_model', x: 1470, y: 665, w: 200, h: 130, tag: 'external model', color: '#fbbf24', flows: ['ai'] },
]

const NODES = [
  { id: 'human', x: 20, y: 285, w: 100, h: 150, title: 'You', sub: 'the consumer', icon: 'user', flows: BOTH, big: true },
  { id: 'frontend', x: 180, y: 245, w: 160, h: 245, title: 'Frontend', sub: 'React + Vite', icon: 'monitor', flows: BOTH, big: true, chips: true },
  { id: 'calc', x: 445, y: 140, w: 200, h: 50, title: '/calc/add, /subtract', icon: 'calculator', flows: ['conventional'] },
  { id: 'weather', x: 445, y: 210, w: 200, h: 50, title: '/weather', icon: 'cloud', flows: ['conventional'] },
  { id: 'agent_api', x: 445, y: 500, w: 200, h: 50, title: '/agent/chat', icon: 'bot', flows: ['ai'] },
  { id: 'agent', x: 740, y: 405, w: 380, h: 50, title: 'LangChain agent', sub: 'create_agent + system prompt (guardrails)', icon: 'bot', flows: ['ai'] },
  { id: 'model', x: 750, y: 520, w: 130, h: 70, title: 'Model', sub: 'ChatOpenAI', icon: 'brain-circuit', flows: ['ai'] },
  { id: 'add', x: 925, y: 530, w: 180, h: 40, title: 'add', sub: '@tool, internal', icon: 'wrench', flows: ['ai'] },
  { id: 'subtract', x: 925, y: 580, w: 180, h: 40, title: 'subtract', sub: '@tool, internal', icon: 'wrench', flows: ['ai'] },
  { id: 'get_weather', x: 925, y: 630, w: 180, h: 40, title: 'get_weather', sub: '@tool, internal', icon: 'wrench', flows: ['ai'] },
  { id: 'ghost_tool', x: 925, y: 685, w: 180, h: 40, title: 'external tool', sub: 'MCP / API (not used)', icon: 'wrench', flows: ['ai'], ghost: true },
  { id: 'calc_service', x: 1210, y: 235, w: 185, h: 56, title: 'calc_service', sub: 'add, subtract', icon: 'server', flows: BOTH },
  { id: 'weather_service', x: 1210, y: 305, w: 185, h: 56, title: 'weather_service', sub: 'geocode + forecast', icon: 'server', flows: BOTH },
  { id: 'meteo', x: 1485, y: 300, w: 170, h: 64, title: 'Open-Meteo', sub: 'free weather API', icon: 'cloud', flows: BOTH },
  { id: 'azure', x: 1485, y: 700, w: 170, h: 64, title: 'Azure OpenAI', sub: 'GPT-5.2, hosted', icon: 'brain-circuit', flows: ['ai'] },
]

const EDGES = [
  { d: 'M120 360 H180', flows: BOTH },
  { d: 'M340 355 H385 V165 H445', flows: ['conventional'] },
  { d: 'M340 355 H385 V235 H445', flows: ['conventional'] },
  { d: 'M340 395 H375 V525 H445', flows: ['ai'] },
  { d: 'M645 165 H1130 V250 H1210', flows: ['conventional'] },
  { d: 'M645 235 H1145 V320 H1210', flows: ['conventional'] },
  { d: 'M645 525 H690 V430 H740', flows: ['ai'] },
  { d: 'M830 455 V520', flows: ['ai'], label: 'reasons', lx: 842, ly: 478, anchor: 'start' },
  { d: 'M830 590 V820 H1570 V764', flows: ['ai'], label: 'model call', lx: 1200, ly: 812, anchor: 'middle' },
  { d: 'M1070 455 V530', flows: ['ai'], label: 'tool call', lx: 1082, ly: 478, anchor: 'start' },
  { d: 'M1105 550 H1160 V276 H1210', flows: ['ai'] },
  { d: 'M1105 600 H1175 V276 H1210', flows: ['ai'] },
  { d: 'M1105 650 H1190 V346 H1210', flows: ['ai'] },
  { d: 'M1395 333 H1485', flows: BOTH },
]

const STEPS = {
  conventional: [
    'You click Add, Subtract or Get weather.',
    'The frontend calls a FastAPI endpoint (/calc/add, /calc/subtract or /weather).',
    'The endpoint hands the work to a service.',
    'For weather, the service fetches live data from Open-Meteo.',
    'The result flows back and is shown on the page.',
  ],
  ai: [
    'You type plain English and hit Ask.',
    'The frontend calls one API: /agent/chat.',
    'The LangChain agent asks the model (Azure OpenAI) which tool to use.',
    'The agent calls a tool. Tools are its hands and legs, declared inside the agent but able to call internal code or an external API.',
    'Here the tools call the same services the normal APIs use (weather goes on to Open-Meteo).',
    'The answer returns, with the tool used shown under intermediate_results.',
  ],
}

const FLOW_TITLES = { conventional: 'Conventional: direct API calls', ai: 'AI: agent with tools' }
const NS = 'http://www.w3.org/2000/svg'

let mode = 'all'

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
    ${z.tag2 ? tag(z.x + z.w - 18, z.y + z.h, z.tag2, z.color, null, 'right') : ''}
  </g>`
}

function renderEdge(e) {
  const on = active(e.flows)
  const color = edgeColor(e.flows)
  const out = [0, 1.2]
    .map((b) => `<circle r="5" fill="${color}"><animateMotion dur="2.4s" begin="${b}s" repeatCount="indefinite" path="${e.d}" /></circle>`)
    .join('')
  const back = `<circle r="2.8" fill="${color}" opacity="0.55"><animateMotion dur="2.4s" begin="0.6s" repeatCount="indefinite" path="${e.d}" keyPoints="1;0" keyTimes="0;1" calcMode="linear" /></circle>`
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
    const ty = n.sub ? n.y + n.h / 2 - 2 : n.y + n.h / 2 + 5
    inner = `${icon(n.icon, n.x + 10, n.y + n.h / 2 - 10, 20, c)}
      <text x="${n.x + 38}" y="${ty}" fill="#f4f4f5" font-size="14.5" font-weight="600" ${n.ghost ? 'font-style="italic"' : ''}>${n.title}</text>
      ${n.sub ? `<text x="${n.x + 38}" y="${ty + 15}" fill="#71717a" font-size="11.5">${n.sub}</text>` : ''}`
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
  renderSteps()
}

document.querySelectorAll('[data-mode]').forEach((b) =>
  b.addEventListener('click', () => {
    mode = b.dataset.mode
    render()
  }),
)

const startMode = new URLSearchParams(location.search).get('mode')
if (['all', 'conventional', 'ai'].includes(startMode)) mode = startMode
render()
