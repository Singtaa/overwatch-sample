import { useEffect, useRef, useState } from "react"

/**
 * The current `Date.now()`, refreshed every frame while `active`. Lets a
 * component derive an animation from the clock instead of keeping a timer.
 */
export function useNow(active: boolean): number {
    const [now, setNow] = useState(Date.now)

    useEffect(() => {
        if (!active) return
        let id = 0
        const tick = () => {
            setNow(Date.now())
            id = requestAnimationFrame(tick)
        }
        id = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(id)
    }, [active])

    return active ? now : Date.now()
}

const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

/**
 * Eases each number toward its target over `ms`, restarting from wherever it
 * currently is whenever a target changes. The first render starts on target.
 */
export function useTween<T extends Record<string, number>>(target: T, ms: number): T {
    const [value, setValue] = useState(target)
    const valueRef = useRef(value)
    valueRef.current = value

    const keys = Object.keys(target)
    const signature = keys.map(k => target[k]).join(",")

    useEffect(() => {
        const from = valueRef.current
        const start = Date.now()
        let id = 0
        const tick = () => {
            const t = Math.min(1, (Date.now() - start) / ms)
            const e = easeInOutQuad(t)
            const next = {} as Record<string, number>
            for (const k of keys) next[k] = from[k] + (target[k] - from[k]) * e
            setValue(next as T)
            if (t < 1) id = requestAnimationFrame(tick)
        }
        id = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, ms])

    return value
}
