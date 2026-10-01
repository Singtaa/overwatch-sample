import { useEffect, useRef, useState } from "react"
import { Painter, View, useBatchedVectorContent, useParticles } from "onejs-react"

const CYCLE_MS = 1600   // One discharge, then a short rest
const CRACKLE_MS = 50   // How often the arcs change shape
const FLASH_AT = 0.08   // Where in the cycle the flash and sparks fire

/**
 * The electric discharge around a full ultimate meter, all drawn in code: a
 * hot flash and a spray of sparks from the particle engine's built-in soft
 * sprite, and jagged arcs that re-form every few frames, drawn with the
 * batched Painter. Each cycle flashes, crackles around the core, and fades.
 *
 * `size` is the square it draws in; the meter's radius is a quarter of it.
 */
export function Lightning({ size }: { size: number }) {
    const radius = size / 4
    const center = size / 2

    const hostRef = useRef(null)
    const fx = useParticles(hostRef, {
        max: 64,
        emitters: [
            {   // The flash: an additive glow, orange to pale yellow, gone in half a second
                rate: 0,
                lifetime: 0.5,
                size: radius * 1.4,
                sizeOverLife: [0.3, 1, 0.8],
                colorOverLife: ["#ffb347ff", "#fff6c8ff", "#ffd08000"],
                glow: 1,
            },
            {   // The sparks: small cyan points thrown outward, slowed by drag
                rate: 0,
                shape: { type: "circle", radius: radius * 0.35 },
                speed: [40, 150],
                drag: 2,
                lifetime: [0.4, 1.1],
                size: [2, 5],
                colorOverLife: ["#ffffff", "#9ffcff", "#7fffd400"],
                glow: 1,
            },
        ],
    })

    const [clock, setClock] = useState(() => ({ start: Date.now(), now: Date.now() }))
    useEffect(() => {
        let fired = -1
        const id = setInterval(() => {
            const now = Date.now()
            setClock(c => ({ ...c, now }))
            const elapsed = now - clock.start
            const cycle = Math.floor(elapsed / CYCLE_MS)
            if (cycle !== fired && (elapsed % CYCLE_MS) / CYCLE_MS >= FLASH_AT) {
                fired = cycle
                fx.burst({ x: center, y: center, count: 2, emitter: 0 })
                fx.burst({ x: center, y: center, count: 14, emitter: 1 })
            }
        }, CRACKLE_MS)
        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const elapsed = clock.now - clock.start
    const cycle = Math.floor(elapsed / CYCLE_MS)
    const phase = (elapsed % CYCLE_MS) / CYCLE_MS
    const shape = Math.floor(elapsed / CRACKLE_MS)

    const arcsRef = useBatchedVectorContent((p) => {
        drawDischarge(p, center, radius, phase, rng(cycle * 7919 + shape))
    }, [shape])

    // Siblings, not parent and child: the particle host gets the engine's
    // premultiplied material, and a child would inherit it and turn the arcs'
    // translucent strokes into additive white.
    const fill = { position: "absolute" as const, width: size, height: size }
    return (
        <View pickingMode="Ignore" className="ows-lightning" style={{ ...fill, top: -radius, left: -radius }}>
            <View ref={hostRef} pickingMode="Ignore" style={fill} />
            <View ref={arcsRef} pickingMode="Ignore" style={fill} />
        </View>
    )
}

type Rng = () => number

/** A small seeded generator, so one crackle step draws the same shape on every repaint. */
function rng(seed: number): Rng {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6D2B79F5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

type Point = [number, number]

/** A jagged line from a to b by midpoint displacement: each split nudges the middle sideways. */
function bolt(a: Point, b: Point, roughness: number, depth: number, rand: Rng): Point[] {
    if (depth === 0) return [a, b]
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const offset = (rand() - 0.5) * roughness * Math.hypot(dx, dy)
    const len = Math.hypot(dx, dy) || 1
    const mid: Point = [a[0] + dx / 2 - dy / len * offset, a[1] + dy / 2 + dx / len * offset]
    const left = bolt(a, mid, roughness, depth - 1, rand)
    return left.concat(bolt(mid, b, roughness, depth - 1, rand).slice(1))
}

/** The discharge at one moment of its cycle, phase 0 to 1. */
function drawDischarge(p: Painter, cx: number, r: number, phase: number, rand: Rng) {
    const strands: Point[][] = []

    if (phase < 0.14) {
        // The spark before the flash: one short zigzag through the core
        const a = rand() * Math.PI * 2
        const l = r * 0.25
        strands.push(bolt([cx - Math.cos(a) * l, cx - Math.sin(a) * l], [cx + Math.cos(a) * l, cx + Math.sin(a) * l], 0.6, 3, rand))
    } else if (phase < 0.85) {
        // The crackle: broken rings around the core, and a few arcs reaching out
        const grow = (phase - 0.14) / 0.71
        const ring = r * (0.3 + 0.2 * grow)
        for (let loop = 0; loop < 2; loop++) {
            const start = rand() * Math.PI * 2
            const sweep = Math.PI * (1.1 + rand() * 0.6)
            const steps = 9
            for (let i = 0; i < steps; i++) {
                const a0 = start + sweep * i / steps
                const a1 = start + sweep * (i + 1) / steps
                const r0 = ring * (0.9 + rand() * 0.2)
                const r1 = ring * (0.9 + rand() * 0.2)
                strands.push(bolt([cx + Math.cos(a0) * r0, cx + Math.sin(a0) * r0], [cx + Math.cos(a1) * r1, cx + Math.sin(a1) * r1], 0.5, 2, rand))
            }
        }
        const reach = 2 + Math.floor(rand() * 2)
        for (let i = 0; i < reach; i++) {
            const a = rand() * Math.PI * 2
            const out = ring * (1.4 + rand() * 0.4)
            strands.push(bolt([cx + Math.cos(a) * ring, cx + Math.sin(a) * ring], [cx + Math.cos(a + 0.3) * out, cx + Math.sin(a + 0.3) * out], 0.45, 3, rand))
        }
    }
    if (strands.length === 0) return

    const fade = phase < 0.6 ? 1 : Math.max(0, 1 - (phase - 0.6) / 0.25)
    // Three passes, wide and faint to thin and bright, stand in for a glow
    const passes: [number, string, number][] = [[7, "#7fffd4", 0.3], [3, "#b8ffff", 0.7], [1.2, "#ffffff", 1]]
    p.lineJoin(Painter.LineJoin.Round).lineCap(Painter.LineCap.Round)
    for (const [width, color, alpha] of passes) {
        p.lineWidth(width).strokeColor(color, alpha * fade)
        for (const strand of strands) {
            p.beginPath().moveTo(strand[0][0], strand[0][1])
            for (let i = 1; i < strand.length; i++) p.lineTo(strand[i][0], strand[i][1])
            p.stroke()
        }
    }
}
