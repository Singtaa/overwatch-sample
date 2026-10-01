import { Painter, Text, View, useBatchedVectorContent } from "onejs-react"
import { useTween } from "./animation"
import { art } from "./assets"

const SEGMENT_HP = 25   // One bar segment per 25 health
const RADIUS = 2        // Rounded corner radius of a segment
const GAP = 2           // Gap between segments
const SLANT = 4         // How far each segment leans

export interface CharacterStatsProps {
    health: number
    maxHealth: number
}

/** Portrait, health numbers and the segmented health bar, bottom left. Changes ease over 800ms. */
export function CharacterStats({ health, maxHealth }: CharacterStatsProps) {
    const shown = useTween({ health, maxHealth }, 800)
    const portrait = art("portrait.png")

    return (
        <View className="ows-stats">
            <View className="ows-portrait" style={portrait ? { backgroundImage: portrait } : undefined} />
            <View>
                <View className="ows-numbers">
                    <Text className="ows-text ows-health" text={String(Math.round(shown.health))} />
                    <Text className="ows-text ows-slash" text="/" />
                    <Text className="ows-text ows-max-health" text={String(Math.round(shown.maxHealth))} />
                </View>
                <View className="ows-bar-track">
                    <HealthBar health={shown.health} maxHealth={shown.maxHealth} />
                </View>
            </View>
        </View>
    )
}

/** The bar, drawn in one batched Painter2D crossing per repaint. */
function HealthBar({ health, maxHealth }: CharacterStatsProps) {
    const ref = useBatchedVectorContent((p) => {
        const rect = (ref.current as CS.UnityEngine.UIElements.VisualElement | null)?.contentRect
        if (!rect || maxHealth <= 0) return
        const { width, height } = rect

        const segments = Math.ceil(maxHealth / SEGMENT_HP)
        const spacing = RADIUS + GAP + RADIUS
        const fullWidth = (width - (segments - 1) * spacing) / maxHealth * SEGMENT_HP

        p.fillColor("#ffffff").strokeColor("#ffffff").lineWidth(4)
            .lineJoin(Painter.LineJoin.Round).lineCap(Painter.LineCap.Round)

        const full = Math.floor(health / SEGMENT_HP)
        for (let i = 0; i < full; i++) {
            segment(p, i * (fullWidth + spacing), fullWidth, height)
        }
        const partial = (health % SEGMENT_HP) / SEGMENT_HP
        if (partial > 0) {
            segment(p, full * (fullWidth + spacing), partial * fullWidth, height)
        }
    }, [health, maxHealth])

    return <View ref={ref} className="ows-bar" />
}

function segment(p: Painter, x: number, width: number, height: number) {
    p.beginPath()
        .moveTo(x + SLANT, 0)
        .lineTo(x + width + SLANT, 0)
        .lineTo(x + width - SLANT, height)
        .lineTo(x - SLANT, height)
        .closePath()
        .fill()
        .stroke()
}
