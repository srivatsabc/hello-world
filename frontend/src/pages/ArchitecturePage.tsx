import { useEffect, useRef, useState } from 'react'

const DIAGRAM_URL = import.meta.env.VITE_DIAGRAM_URL ?? '/diagram/'

// Date: October 1, 2026
// Name: Sri
// Desc: The Architecture tab. Holds no diagram code of its own: it only
//       embeds the separate diagram service (the diagram/ folder, reached
//       through the dev proxy at /diagram) in an iframe, and resizes the
//       frame to the page's reported height so it never scrolls inside.
//       Keeps the app's own frontend simple.
export function ArchitecturePage() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(1400)
  // A fresh query string per visit so the browser never reuses an old cached copy of the diagram page.
  const [src] = useState(() => `${DIAGRAM_URL}?v=${Date.now()}`)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow) return
      if (event.data?.type === 'diagram-height' && typeof event.data.height === 'number') {
        setHeight(event.data.height)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <iframe
      ref={frameRef}
      src={src}
      title="Architecture diagram"
      style={{ height }}
      className="block w-full border-0"
    />
  )
}
