import { useEffect, useState } from "react"
import { Painter, Text, View, useBatchedVectorContent } from "onejs-react"
import { Icons, icons } from "./assets"
import { Lightning } from "./Lightning"

const SHAKE = [
    { x: 1, y: 1, r: 0 }, { x: -1, y: -2, r: -1 }, { x: -3, y: 0, r: 1 }, { x: 3, y: 2, r: 0 },
    { x: 1, y: -1, r: 1 }, { x: -1, y: 2, r: -1 }, { x: -3, y: 1, r: 0 }, { x: 3, y: 1, r: -1 },
    { x: -1, y: -1, r: 1 }, { x: 1, y: 2, r: 0 }, { x: 1, y: -2, r: -1 },
]

export interface UltMeterProps {
    /** 0 to 1. */
    progress: number
    radius?: number
}

/** The radial ultimate meter, bottom center. Full, it shakes and crackles. */
export function UltMeter({ progress, radius = 64 }: UltMeterProps) {
    const ready = progress >= 1
    const shake = useShake(ready)

    const ringRef = useBatchedVectorContent((p) => {
        const r = radius * 0.8
        p.lineWidth(radius * 0.2)
        p.strokeColor(1, 1, 1, 0.1).beginPath().circle(radius, radius, r).stroke()
        if (progress > 0) {
            const start = -Math.PI / 2
            p.strokeColor("#7fffd4").beginPath()
                .arc(radius, radius, r, start, start + Math.min(progress, 0.99999) * Math.PI * 2, Painter.ArcDirection.Clockwise)
                .stroke()
        }
    }, [progress, radius])

    const disc = (scale: number) => ({ width: radius * scale, height: radius * scale, borderRadius: radius * scale / 2 })

    return (
        <View style={{ width: radius * 2, height: radius * 2 }}>
            <View ref={ringRef} className="ows-ult-ring" style={{
                borderRadius: radius, translate: [shake.x * 0.5, shake.y * 0.5], rotate: shake.r,
            }}>
                <View className="ows-ult-disc" style={disc(1.2)}>
                    <View className="ows-ult-core" style={disc(0.9)}>
                        {ready
                            ? <Text className="ows-ult-icon" style={{ fontSize: radius * 0.8, unityFontDefinition: icons() }} text={Icons.burningSkull} />
                            : <Text className="ows-text" style={{ fontSize: radius * 0.3 }} text={String(Math.round(progress * 100))} />}
                    </View>
                </View>
            </View>
            {ready ? <Lightning size={radius * 4} /> : null}
        </View>
    )
}

/** Steps through SHAKE every 100ms while active. */
function useShake(active: boolean) {
    const [index, setIndex] = useState(0)
    useEffect(() => {
        if (!active) return
        const id = setInterval(() => setIndex(i => (i + 1) % SHAKE.length), 100)
        return () => clearInterval(id)
    }, [active])
    return active ? SHAKE[index] : { x: 0, y: 0, r: 0 }
}
