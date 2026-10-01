import { useEffect, useState } from "react"
import { Icons } from "./assets"

/** One ability on the action bar. */
export interface Skill {
    /** A glyph from the sample's icon font, see `Icons`. */
    icon: string
    /** Cooldown length in seconds. */
    cooldown: number
    /** When the skill is ready again, in `Date.now()` milliseconds. In the past means ready. */
    readyAt: number
}

/** Everything the HUD shows. Feed it from your game, or let the demo drive it. */
export interface OverwatchStats {
    health: number
    maxHealth: number
    /** Ultimate charge, 0 to 1. At 1 the meter shows its ready icon and the lightning. */
    ult: number
    skills: Skill[]
    ammo: number
    maxAmmo: number
}

export const DEFAULT_STATS: OverwatchStats = {
    health: 200,
    maxHealth: 200,
    ult: 0,
    skills: [
        { icon: Icons.daggers, cooldown: 10, readyAt: 0 },
        { icon: Icons.shuriken, cooldown: 20, readyAt: 0 },
    ],
    ammo: 3,
    maxAmmo: 5,
}

type Update = (s: OverwatchStats) => OverwatchStats
type Set = (update: Update) => void

/** Plays [wait seconds, change] steps in a loop until stopped. */
function loop(steps: [number, Update][], set: Set): () => void {
    let id = 0
    let i = 0
    const next = () => {
        const [wait, update] = steps[i]
        id = setTimeout(() => {
            set(update)
            i = (i + 1) % steps.length
            next()
        }, wait * 1000)
    }
    next()
    return () => clearTimeout(id)
}

/**
 * The ultimate's cycle, read off the clock every frame: empty for 2s, charging
 * for 5s, full for 6s. Frame-stepped timers would stretch with the frame rate.
 */
function chargeUlt(set: Set): () => void {
    const start = Date.now()
    let id = 0
    const tick = () => {
        const t = ((Date.now() - start) / 1000) % 13
        const ult = t < 2 ? 0 : t < 7 ? (t - 2) / 5 : 1
        set(s => s.ult === ult ? s : { ...s, ult })
        id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
}

const health = (h: number, max?: number): Update => s => ({ ...s, health: h, maxHealth: max ?? s.maxHealth })
const cast = (index: number): Update => s => ({
    ...s,
    skills: s.skills.map((k, i) => i === index ? { ...k, readyAt: Date.now() + k.cooldown * 1000 } : k),
})

/**
 * The stand-in for a game: the ultimate charges, health takes an overheal and
 * some damage, and both skills cycle through their cooldowns. It replays the
 * timeline of v1's CharacterManager MonoBehaviour, so the sample runs with no
 * C# and nothing set up in a scene.
 *
 * Pass enabled = false to stop it, which is what OverwatchSample does when you
 * hand it your own stats.
 */
export function useDemoStats(enabled = true): OverwatchStats {
    const [stats, setStats] = useState(DEFAULT_STATS)

    useEffect(() => {
        if (!enabled) return
        const stops = [
            chargeUlt(setStats),
            loop([
                [3, health(500, 500)],
                [2, health(420)],
                [2, health(277)],
                [2, health(200, 200)],
            ], setStats),
            loop([
                [2, cast(0)],
                [3, cast(1)],
                [10, cast(0)],
                [12, s => s],
            ], setStats),
        ]
        return () => stops.forEach(stop => stop())
    }, [enabled])

    return stats
}
