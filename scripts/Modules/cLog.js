import { prismarineDb, WorldPersistentStorage } from '../Libraries/prismarinedb'
import { world, system } from '@minecraft/server'
import worldValues from './worldValues'
import modules from './modules'

class CLogProtection {
    constructor() {
        world.afterEvents.entityHurt.subscribe(async (e) => {
            if (!modules.get('CLog')) return;
            await this.hit(e)
        })
        world.afterEvents.playerSpawn.subscribe(async (e) => {
            if (!modules.get('CLog')) return;
            if (!e.initialSpawn) return;
            await this.join(e)
        })
        world.beforeEvents.playerLeave.subscribe((e) => {
            if (!modules.get('CLog')) return;
            this.leave(e)
        })
        world.afterEvents.entityDie.subscribe((e) => {
            if (!modules.get('CLog')) return;
            this.die(e)
        })
    }
    clearClogEntries() {
        system.run(async () => {
            for (const val of worldValues.getValues()) {
                if (val.startsWith('combat')) worldValues.removeValue(val)
            }
        })
    }
    hit(e2) {
        let e = {
            hitEntity: e2.hurtEntity,
            damagingEntity: e2.damageSource.damagingEntity
        }
        if (!modules.get('CLog')) return;
        if (e.hitEntity.typeId !== 'minecraft:player') return;
        let de = e.damagingEntity
        if (!de) { de = e.damageSource?.damagingEntity }
        if(!de) return;
        if(de.typeId !== 'minecraft:player') return;
        if (!worldValues.includesValue('combat:' + e.hitEntity.id)) {
            worldValues.addValue('combat:' + e.hitEntity.id)
            let id = e.hitEntity.id
            e.hitEntity.info('You are now in combat!')
            system.run(async () => {
                await system.waitTicks(+modules.get('clogCooldown') * 20 ?? 30 * 20)
                if (e.hitEntity && worldValues.includesValue('combat:' + id)) e.hitEntity.info('You are no longer in combat!')
                if (worldValues.includesValue('combat:' + id) && e.hitEntity) worldValues.removeValue('combat:' + id)
            })
        }
        if (!worldValues.includesValue('combat:' + de.id)) {
            worldValues.addValue('combat:' + de.id)
            let id = de.id
            de.info('You are now in combat!')
            system.run(async () => {
                await system.waitTicks(+modules.get('clogCooldown') * 20 ?? 30 * 20)
                if (de && worldValues.includesValue('combat:' + id)) de.info('You are no longer in combat!')
                if (worldValues.includesValue('combat:' + id) && de) worldValues.removeValue('combat:' + id)
            })
        }
    }
    async join(e) {
        if (worldValues.includesValue('combat:' + e.player.id)) {
            if (!modules.get('CLogKeepInventory')) e.player.runCommand('clear @s')
            e.player.runCommand('kill @s')
            worldValues.removeValue('combat:' + e.player.id)
        }
    }
    die(e2) {
        let e = {
            damagingEntity: e2.damageSource.damagingEntity,
            deadEntity: e2.deadEntity
        }
        if (!modules.get('CLog')) return;
        if (e.deadEntity.typeId == 'minecraft:player') {
            if (worldValues.includesValue('combat:' + e.deadEntity.id)) e.deadEntity.info('You are no longer in combat!'), worldValues.removeValue('combat:' + e.deadEntity.id)
        }
        if (e.damagingEntity && e.damagingEntity?.typeId == 'minecraft:player') {
            if (worldValues.includesValue('combat:' + e.damagingEntity.id)) e.damagingEntity.info('You are no longer in combat!'), worldValues.removeValue('combat:' + e.damagingEntity.id)
        }
    }
    leave(e) {
        if (!this.inCombat(e.player)) return;
        if (!modules.get('CLogKeepInventory')) {
            let inv = e.player.getComponent('inventory')
            let inventory = inv.container
            let items = []
            for (let i = 0; i < 36; i++) {
                let i2 = inventory.getItem(i)
                if (i2) items.push(i2)
            }
            let equippable = e.player.getComponent('equippable')
            let off = equippable.getEquipment('Offhand')
            let h = equippable.getEquipment('Head')
            let c = equippable.getEquipment('Chest')
            let l = equippable.getEquipment('Legs')
            let b = equippable.getEquipment('Feet')
            let loc = e.player.location
            let dim = e.player.dimension.id
            let name = e.player.name
            system.run(() => {
                world.sendMessage(`§c${name} left the game while in combat!`)
            })
            system.run(() => {
                if (modules.get('CLogKeepInventory')) return;
                let dimension = world.getDimension(dim)
                for (const item of items) {
                    dimension.spawnItem(item, loc)
                }
                if (off) dimension.spawnItem(off, loc)
                if (h) dimension.spawnItem(h, loc)
                if (c) dimension.spawnItem(c, loc)
                if (l) dimension.spawnItem(l, loc)
                if (b) dimension.spawnItem(b, loc)
            })
        } else {
            if(!this.inCombat(e.player)) return;
            let name = e.player.name
            system.run(() => {
                world.sendMessage(`§c${name} left the game while in combat!`)
            })
        }
    }
    inCombat(player) {
        return worldValues.includesValue(`combat:${player.id}`)
    }
}
var cLog = new CLogProtection;

export { cLog }