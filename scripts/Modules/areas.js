import { system, world } from "@minecraft/server";
import { isInCuboid } from "./Utilities/inArea";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
import { prismarineDb } from "../Libraries/prismarinedb";
import { ActionForm } from "../Libraries/form_func";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import { consts } from "../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";

class Areas {
    constructor() {
        this.Database = prismarineDb.customStorage('Areas', SegmentedStoragePrismarine)
        this.flags = [
            'DisableBlockPlace',
            'DisableBlockBreaking',
            'DisableBlockInteractions',
            'DisableLeverInteractions',
            'DisableTrapdoorInteractions',
            'DisableDoorInteractions',
            'DisableChestInteractions',
            'DisablePVP',
            'DisablePVE',
            'DisableLogStripping',
            'DisableMobSpawning',
            'DisableExplosions',
            'BlockProjectiles'
        ]
        this.errorMessage = 'You are not allowed to do this here!'
        this.areaEvents();
    }
    areaEvents() {
        world.beforeEvents.explosion.subscribe((e) => {
            let blocks = [];
            for (const block of e.getImpactedBlocks()) {
                let area = this.getAreaAtPos(block.location, block.dimension)
                if (area && area.data.flags.includes('DisableExplosions')) continue;
                blocks.push(block)
            }
            e.setImpactedBlocks(blocks)
        })
        world.beforeEvents.playerPlaceBlock.subscribe((e) => {
            let area = this.getAreaAtPos(e.block.location, e.block.dimension);
            if (this.hasPerm(e.player)) return;
            if (area && area.data.flags.includes("DisableBlockPlace")) {
                e.cancel = true;
                e.player.error(this.errorMessage);
            }
        });
        world.beforeEvents.playerBreakBlock.subscribe((e) => {
            let area = this.getAreaAtPos(e.block.location, e.block.dimension);
            if (this.hasPerm(e.player)) return;
            if (area && area.data.flags.includes("DisableBlockBreaking")) {
                e.cancel = true;
                e.player.error(this.errorMessage);
            }
        });
        world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
            let area = this.getAreaAtPos(e.player.location, e.player.dimension)
            if (this.hasPerm(e.player)) return;
            if (area) {
                if (area.data.flags.includes('DisableBlockInteractions')) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
                if (area.data.flags.includes('DisableLeverInteractions') && e.block.typeId.includes('lever')) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
                if (area.data.flags.includes('DisableDoorInteractions') && e.block.typeId.includes('_door')) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
                if (area.data.flags.includes('DisableTrapdoorInteractions') && e.block.typeId.includes('_trapdoor')) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
                if (area.data.flags.includes('DisableChestInteractions') && ['minecraft:chest', 'minecraft:barrel'].includes(e.block.typeId)) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
                if (area.data.flags.includes('DisableLogStripping') && e.block.typeId.includes('log') && e.itemStack && e.itemStack.typeId.includes('axe')) {
                    e.cancel = true;
                    if (e.isFirstEvent) e.player.error(this.errorMessage);
                    return;
                }
            }
        })
        world.afterEvents.entitySpawn.subscribe((e) => {
            if (!e.entity.isValid) return;
            let area = this.getAreaAtPos(e.entity.location, e.entity.dimension)
            if (!area) return;
            let wl = ['minecraft:item', 'minecraft:player', 'minecraft:xp_orb', 'minecraft:arrow', 'minecraft:snowball', 'minecraft:npc', 'minecraft:wind_charge_projectile', 'minecraft:splash_potion', 'minecraft:fishing_hook', 'minecraft:lingering_potion', 'minecraft:egg']
            if(!area.data.flags.includes('BlockProjectiles')) wl = ['minecraft:item', 'minecraft:player', 'minecraft:xp_orb', 'minecraft:npc', 'minecraft:fishing_hook']
            if (e.entity.typeId == "minecraft:player" || e.entity.typeId.startsWith('feather:') || wl.includes(e.entity.typeId)) return;
            let projectiles = ['minecraft:arrow', 'minecraft:snowball', 'minecraft:wind_charge_projectile', 'minecraft:splash_potion', 'minecraft:lingering_potion', 'minecraft:egg']
            if(area.data.flags.includes('BlockProjectiles') && !area.data.flags.includes('DisableMobSpawning') && projectiles.includes(e.entity.typeId)) {
                e.entity.remove()
            }
            if (area.data.flags.includes('DisableMobSpawning')) {
                e.entity.remove()
            }
        })
        world.beforeEvents.entityHurt.subscribe((e) => {
            if (this.hasPerm(e.damageSource.damagingEntity)) return;
            if (e.damageSource.damagingEntity && e.damageSource.damagingEntity.typeId == 'minecraft:player' && e.hurtEntity && e.hurtEntity.typeId !== 'minecraft:player') {
                let area = this.getAreaAtPos(e.hurtEntity.location, e.hurtEntity.dimension)
                if (area && area.data.flags.includes('DisablePVE')) {
                    e.cancel = true;
                    e.damageSource.damagingEntity.error(this.errorMessage);
                }
            }
            if (e.damageSource.damagingEntity && e.damageSource.damagingEntity.typeId == 'minecraft:player' && e.hurtEntity && e.hurtEntity.typeId === 'minecraft:player') {
                let area = this.getAreaAtPos(e.hurtEntity.location, e.hurtEntity.dimension)
                if (area && area.data.flags.includes('DisablePVP')) {
                    e.cancel = true;
                    e.damageSource.damagingEntity.error(this.errorMessage);
                }
            }
        })
    }
    createAreaStep1(name, dimension, priority) {
        if (this.Database.findFirst({ name })) return false;
        this.Database.insertDocument({
            flags: [],
            name,
            bypassers: [],
            type: 'AREA',
            dimension: dimension,
            priority,
            finishedCreating: false,
        })
        return true;
    }
    hasPerm(player) {
        if(!player) return;
        return prismarineDb.permissions.hasPermission(player, 'bypassAreaFlags')
    }
    createAreaStep2(id, pos) {
        let area = this.Database.getByID(id)
        area.data.pos1 = {x:Math.floor(pos.x),y:Math.floor(pos.y),z:Math.floor(pos.z)}
        if (area.data.pos1 && area.data.pos2) area.data.finishedCreating = true
        this.Database.overwriteDataByID(id, area.data)
        return true;
    }
    createAreaStep3(id, pos) {
        let area = this.Database.getByID(id)
        area.data.pos2 = {x:Math.floor(pos.x),y:Math.floor(pos.y),z:Math.floor(pos.z)}
        if (area.data.pos1 && area.data.pos2) area.data.finishedCreating = true
        this.Database.overwriteDataByID(id, area.data)
        return true;
    }
    getAreas() {
        return this.Database.findDocuments({ type: 'AREA' })
    }
    getFinishedCreatingAreas() {
        return this.Database.findDocuments({ type: 'AREA', finishedCreating: true })
    }
    getAreaAtPos(pos, dimension) {
        let areas = [
            ...this.getFinishedCreatingAreas()
        ]
        let applicableAreas = []
        for (const area of areas) {
            if (area.dimension ?? 'minecraft:overworld' !== dimension.id) continue;
            if (isInCuboid(pos, area.data.pos1, area.data.pos2)) applicableAreas.push(area);
            continue;
        }
        applicableAreas = applicableAreas.sort((a, b) => b.data.priority - a.data.priority)
        
        return applicableAreas[0]
    }
    getArea(id) {
        return this.Database.getByID(id)
    }
    editFlags(id, flags) {
        let area = this.getArea(id)
        if (!area) return false;
        area.data.flags = flags
        this.Database.overwriteDataByID(id, area.data)
        return true;
    }
    editPriority(id, priority) {
        let area = this.getArea(id)
        if (!area) return false;
        area.data.priority = priority
        this.Database.overwriteDataByID(id, area.data)
        return true;
    }
    editName(id, name) {
        let area = this.getArea(id)
        if (!area) return false;
        area.data.name = name
        this.Database.overwriteDataByID(id, area.data)
        return true;
    }
}

var areamodule = new Areas;

uiManager.addUI(config.uinames.areas.edit, 'ar', (player, id) => {
    let area = areamodule.getArea(id)
    if (!area) throw new Error('No area found')
    let form = new ActionForm();
    form.title(consts.tag + `§r${area.data.name}`)
    console.log(JSON.stringify(area))
    if (!area.data.finishedCreating) {
        form.label(`§cYou must set pos1 and pos2 to edit flags!`)
    }
    form.button(`§aSet Pos 1\n§7Set pos1 to where you are standing`, null, (player) => {
        areamodule.createAreaStep2(id, player.location)
        player.success('Set pos1 to your location')
        uiManager.open(player, config.uinames.areas.edit, id)
    })
    form.button(`§aSet Pos 2\n§7Set pos2 to where you are standing`, null, (player) => {
        areamodule.createAreaStep3(id, player.location)
        player.success('Set pos2 to your location')
        uiManager.open(player, config.uinames.areas.edit, id)
    })
    if (area.data.finishedCreating) {
        form.button(`§6Flags\n§7Edit area flags`, '.azalea/Conditions', (player) => {
            let form2 = new ModalFormData();
            form2.title(consts.modal + 'Flags')
            for (const flag of areamodule.flags) {
                form2.toggle(flag, { defaultValue: area.data.flags.includes(flag) });
            }
            form2.show(player).then((res) => {
                let nFlags = [];
                for (let i = 0; i < areamodule.flags.length; i++) {
                    if (res.formValues[i]) nFlags.push(areamodule.flags[i])
                }
                areamodule.editFlags(id, nFlags)
                player.success('Set flags: ' + nFlags.join(', '))
                uiManager.open(player, config.uinames.areas.edit, id)
            })
        })
    }
    form.button(`§2Edit\n§7Edit the values of this area`, '.blossom/edit', (player) => {
        let form2 = new ModalFormData();
        form2.title(consts.modal + 'Edit')
        form2.textField('Priority', 'Higher = more prioritized; Numbers only.', { defaultValue: `${area.data.priority}` })
        form2.textField('Name', 'Name of the area', { defaultValue: area.data.name })
        form2.show(player).then((res) => {
            let [priority, name] = res.formValues;
            if (isNaN(+priority)) return player.error('Priority is NaN'), uiManager.open(player, config.uinames.areas.edit, id)
            if (!name) return player.error('No name entered'), uiManager.open(player, config.uinames.areas.edit, id)
            areamodule.editPriority(id, +priority)
            areamodule.editName(id, name)
            player.sendMessage(`§aSet values\n§r§7Priority: ${priority}§r§7\nName: ${name}`)
            uiManager.open(player, config.uinames.areas.edit, id)
        })
    })
    form.button(`§cDelete\n§7Delete this area`, '.azalea/SidebarTrash', (player) => {
        areamodule.Database.deleteDocumentByID(area.id)
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.areas.create, 'Create area', (player) => {
    let form = new ModalFormData();
    form.title(consts.modal + `Create area`)
    form.textField('Name', 'Name of the area')
    form.textField('Priority', "Priority of the area")
    form.show(player).then((res) => {
        let [name,priority] = res.formValues;
        if (isNaN(+priority)) return player.error('Priority is NaN'), uiManager.open(player, config.uinames.areas.edit, id)
        if (!name) return player.error('No name entered'), uiManager.open(player, config.uinames.areas.edit, id)
        areamodule.createAreaStep1(name,player.dimension.id,priority)
        player.success('Created area')
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
})

export default areamodule;