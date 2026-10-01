import { Text, View } from "onejs-react"
import { useNow } from "./animation"
import { Icons, icons } from "./assets"
import type { Skill } from "./stats"

const SLOT = 64

export interface ActionBarProps {
    skills: Skill[]
    ammo: number
    maxAmmo: number
}

/** Abilities and ammo, bottom right. */
export function ActionBar({ skills, ammo, maxAmmo }: ActionBarProps) {
    return (
        <View className="ows-actions">
            {skills.map((skill, i) => <SkillSlot key={i} skill={skill} />)}
            <View className="ows-ammo">
                <Text className="ows-ammo-icon" style={{ unityFontDefinition: icons() }} text={Icons.bullet} />
                <Text className="ows-text ows-ammo-count" text={`${ammo}/${maxAmmo}`} />
            </View>
        </View>
    )
}

/** One ability. While on cooldown a fill sweeps up over it and a countdown shows. */
function SkillSlot({ skill }: { skill: Skill }) {
    const now = useNow(skill.readyAt > Date.now())
    const left = Math.max(0, skill.readyAt - now) / 1000
    const cooling = left > 0
    const elapsed = cooling ? 1 - left / skill.cooldown : 1

    return (
        <View className={cooling ? "ows-skill ows-skill--cooling" : "ows-skill"}>
            {cooling ? <View className="ows-skill-sweep" style={{ top: SLOT * (1 - elapsed) }} /> : null}
            <Text className="ows-skill-icon" style={{ unityFontDefinition: icons() }} text={skill.icon} />
            {cooling ? <Text className="ows-text ows-skill-count" text={String(Math.ceil(left))} /> : null}
        </View>
    )
}
