import { View } from "onejs-react"
import { ActionBar } from "./ActionBar"
import { art } from "./assets"
import { CharacterStats } from "./CharacterStats"
import { type OverwatchStats, useDemoStats } from "./stats"
import { ensureStyles } from "./styles"
import { UltMeter } from "./UltMeter"

export { ActionBar } from "./ActionBar"
export type { ActionBarProps } from "./ActionBar"
export { Icons } from "./assets"
export { CharacterStats } from "./CharacterStats"
export type { CharacterStatsProps } from "./CharacterStats"
export { DEFAULT_STATS, useDemoStats } from "./stats"
export type { OverwatchStats, Skill } from "./stats"
export { UltMeter } from "./UltMeter"
export type { UltMeterProps } from "./UltMeter"

export interface OverwatchSampleProps {
    /**
     * Your game's numbers. Leave it out and a built-in demo drives the HUD;
     * pass it and the demo stops, and anything you leave out keeps its default.
     */
    stats?: Partial<OverwatchStats>
    /** The picture behind the HUD. Pass null for none, to lay it over your game. */
    background?: CS.UnityEngine.Texture2D | null
}

/** The whole Overwatch HUD, filling its parent. */
export function OverwatchSample({ stats, background }: OverwatchSampleProps) {
    ensureStyles()
    const demo = useDemoStats(stats === undefined)
    const s = { ...demo, ...stats }
    const bg = background === undefined ? art("bg.jpg") : background
    return (
        <View className="ows-root" style={bg ? { backgroundImage: bg } : undefined}>
            <CharacterStats health={s.health} maxHealth={s.maxHealth} />
            <UltMeter progress={s.ult} />
            <ActionBar skills={s.skills} ammo={s.ammo} maxAmmo={s.maxAmmo} />
        </View>
    )
}
