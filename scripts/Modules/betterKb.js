import { system, world } from "@minecraft/server";
import keyvalues from "./keyvalues";

system.run(async () => {
    await system.waitTicks(20)
    if (!keyvalues.get('BetterKB')) keyvalues.set('BetterKB', 'false')

    world.afterEvents.entityHurt.subscribe((data) => {
        if (!keyvalues.get('BetterKB') || keyvalues.get('BetterKB') !== 'true') return;
        const player = data.hurtEntity;
        const target = data.damageSource.damagingEntity;

        if (!target || target.typeId !== "minecraft:player") return;

        const direction = target.getViewDirection();
        player.applyKnockback({ x: direction.x * 0.3, z: direction.z * 0.3 }, 0.35);
    });
})