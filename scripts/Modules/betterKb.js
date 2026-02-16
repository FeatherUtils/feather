import { system, world } from "@minecraft/server";
import keyvalues from "./keyvalues";

system.run(async () => {
    await system.waitTicks(20)
    if (keyvalues.get('BetterKB') == undefined) keyvalues.set('BetterKB', false)
    if (!keyvalues.get('BetterKBXVel')) keyvalues.set('BetterKBXVel', '0.3')
    if (!keyvalues.get('BetterKBYVel')) keyvalues.set('BetterKBYVel', '0.35')
    if (!keyvalues.get('BetterKBZVel')) keyvalues.set('BetterKBZVel', '0.3')
    if (keyvalues.get('BetterKB') == 'true') keyvalues.set('BetterKB', true)
    if (typeof keyvalues.get('BetterKB') == "string") keyvalues.set('BetterKB', false)

    world.afterEvents.entityHurt.subscribe((data) => {
        if (!keyvalues.get('BetterKB') || keyvalues.get('BetterKB') !== true) return;
        let x = keyvalues.get('BetterKBXVel')
        let y = keyvalues.get('BetterKBYVel')
        let z = keyvalues.get('BetterKBZVel')
        const player = data.hurtEntity;
        const target = data.damageSource.damagingEntity;

        if (!target || target.typeId !== "minecraft:player") return;

        const direction = target.getViewDirection();
        if (data.damageSource.damagingProjectile) {
            if(keyvalues.get('BetterKBArrowDing')) target.playSound('random.orb', target.location)
            if (data.damageSource.damagingProjectile.typeId == 'minecraft:fishing_hook' && keyvalues.get('BetterKBFishingRodCombat')) {
                player.applyKnockback({ x: direction.x * +x * 2, z: direction.z * +z * 2 }, +y);
                player.runCommand('kill @e[type=minecraft:fishing_hook,r=2]')
                return;
            }
        }
        if(keyvalues.get('BetterKBKnockback')) player.applyKnockback({ x: direction.x * +x, z: direction.z * +z }, +y);


    });
})