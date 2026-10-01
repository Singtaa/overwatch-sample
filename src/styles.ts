/**
 * The HUD's stylesheet, carried in the bundle as a string.
 *
 * Not Tailwind: OneJS's Tailwind plugin scans the app's own files and skips
 * node_modules, so classes written here would generate no rules. A USS string
 * compiled once at load needs nothing from the app's build config. What moves
 * every frame (the shake, the cooldown sweep, sizes that follow the meter's
 * radius) stays inline in the components.
 *
 * Every class is prefixed ows- so it cannot collide with the app's own.
 */
const USS = `
.ows-root {
    position: absolute; left: 0; top: 0; right: 0; bottom: 0;
    flex-direction: row; justify-content: space-between; align-items: flex-end;
    padding: 80px;
    -unity-background-scale-mode: scale-and-crop;
}
.ows-text { color: white; -unity-font-style: bold; }

.ows-stats { flex-direction: row; }
.ows-portrait { width: 160px; height: 160px; -unity-background-scale-mode: scale-to-fit; }
.ows-numbers { width: 384px; height: 80px; flex-direction: row; align-items: flex-end; padding-bottom: 4px; }
.ows-health { font-size: 36px; bottom: -6px; }
.ows-slash { font-size: 20px; color: rgb(229, 231, 235); padding-left: 4px; padding-right: 4px; }
.ows-max-health { font-size: 20px; }
.ows-bar-track { flex-grow: 1; padding-top: 8px; padding-bottom: 40px; }
.ows-bar { width: 100%; height: 100%; }

.ows-ult-ring {
    position: absolute; width: 100%; height: 100%;
    justify-content: center; align-items: center;
    border-width: 1px; border-color: rgba(255, 255, 255, 0.27);
}
.ows-ult-disc { justify-content: center; align-items: center; background-color: rgba(255, 255, 255, 0.125); }
.ows-ult-core { justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.2); }
.ows-ult-icon { color: white; }
.ows-lightning { position: absolute; }

.ows-actions { width: 544px; flex-direction: row; justify-content: flex-end; margin-bottom: 40px; padding-right: 40px; }
.ows-skill {
    width: 64px; height: 64px; margin-right: 16px; overflow: hidden;
    justify-content: center; align-items: center;
    border-width: 1px; border-color: white; border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.7);
}
.ows-skill--cooling { background-color: rgba(200, 200, 200, 0.6); }
.ows-skill-icon { font-size: 36px; color: rgba(0, 0, 0, 0.7); }
.ows-skill--cooling .ows-skill-icon { color: rgba(0, 0, 0, 0.2); }
.ows-skill-sweep { position: absolute; width: 100%; height: 100%; background-color: rgba(127, 255, 212, 0.73); }
.ows-skill-count {
    position: absolute; width: 100%; height: 100%;
    font-size: 30px; -unity-text-align: middle-center;
    text-shadow: 0 0 2px black;
}
.ows-ammo {
    width: 160px; height: 64px;
    flex-direction: row; align-items: center; justify-content: space-around;
    border-top-width: 1px; border-bottom-width: 1px; border-color: rgba(255, 255, 255, 0.73);
}
.ows-ammo-icon { font-size: 48px; color: rgba(255, 255, 255, 0.73); }
.ows-ammo-count { font-size: 30px; color: rgba(255, 255, 255, 0.73); top: -1px; }
`

type Globals = { compileStyleSheet?: (uss: string, name?: string) => boolean }

let compiled = false

/** Adds the stylesheet to the panel once. Named, so a reload replaces it. */
export function ensureStyles(): void {
    if (compiled) return
    compiled = (globalThis as Globals).compileStyleSheet?.(USS, "overwatch-sample") === true
}
