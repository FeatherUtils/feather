import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import actionParser from "./actionParser";
import formatter from "../Formatting/formatter";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class Events {
    constructor() {
        system.run(async () => {
            this.oldDb = prismarineDb.table(`FTR:EVENTS`)
            this.db = prismarineDb.customStorage('+FTR:EVENTS', SegmentedStoragePrismarine)
            this.kv = await this.db.keyval('settings')
            if (!this.oldDb.findDocuments().length == 0) {
                for (const doc of this.oldDb.findDocuments()) {
                    this.db.insertDocument(doc.data)
                    this.oldDb.deleteDocumentByID(doc.id)
                }
                this.kv.set('MIGRATION1', true)
            }
            this.allowedTypes = ['KILL', 'DEATH', 'JOIN', 'CHAT', 'RANDOMNUMBER', 'PLAYERKILLENTITY', 'ENTITYDEATH', 'BREAKBLOCK', 'PLACEBLOCK', 'PLAYERINTERACTWITHPLAYER', 'PLAYERHITENTITY', 'PLAYERINTERACTWITHBLOCK', 'PLAYERHITPLAYER', 'WEATHERCHANGE', 'GAMEMODECHANGE']
            this.allowedActionTypes = ['DEATH', 'KILL', 'JOIN', 'CHAT', 'BREAKBLOCK', 'PLACEBLOCK', 'PLAYERKILLENTITY', 'ENTITYDEATH', 'PLAYERINTERACTWITHPLAYER', 'PLAYERHITPLAYER', 'PLAYERHITENTITY', 'PLAYERINTERACTWITHBLOCK', 'WEATHERCHANGE', 'GAMEMODECHANGE']
            this.allowedManualTriggers = ['RANDOMNUMBER']
            this.randomNumberKeyval = await this.db.keyval('randomnumbers')
            function random(min, max) {
                const minCeiled = Math.ceil(min);
                const maxFloored = Math.floor(max);
                return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
            }
            async function runAction(plr, ac) {
                return actionParser.runAction(plr, await formatter.format(ac, plr))
            }
            world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
                if (e.target.typeId !== 'minecraft:player') return;
                for (const ev of this.db.findDocuments({ type: 'PLAYERINTERACTWITHPLAYER' })) {
                    for (const ac of ev.data.actions) {
                        runAction(e.player, ac.action.replaceAll('<name2>', e.target.name ?? e.target.nameTag))
                    }
                }
            })
            world.afterEvents.entityHitEntity.subscribe((e) => {
                if (e.damagingEntity.typeId !== 'minecraft:player') return;
                if (e.hitEntity.typeId !== 'minecraft:player') return;
                for (const ev of this.db.findDocuments({ type: 'PLAYERHITPLAYER' })) {
                    for (const ac of ev.data.actions) {
                        runAction(e.damagingEntity, ac.action.replaceAll('<name2>', e.hitEntity.name ?? e.hitEntity.nameTag))
                    }
                }
            })
            world.afterEvents.entityHitEntity.subscribe((e) => {
                if (e.damagingEntity.typeId !== 'minecraft:player') return;
                for (const ev of this.db.findDocuments({ type: 'PLAYERHITENTITY' })) {
                    if (ev.data.settings?.typeId && ev.data.settings.typeId != e.hitEntity.typeId) continue;
                    for (const ac of ev.data.actions) {
                        runAction(e.damagingEntity, ac.action.replaceAll('<typeID>', e.hitEntity.typeId))
                    }
                }
            })
            world.afterEvents.entityDie.subscribe(e => {
                if (e.damageSource.damagingEntity) {
                    if (e.damageSource.damagingEntity?.typeId === 'minecraft:player') {
                        if (e.deadEntity.typeId === 'minecraft:player') {
                            for (const ev of this.db.findDocuments({ type: 'KILL' })) {
                                for (const ac of ev.data.actions) {
                                    runAction(e.damageSource.damagingEntity, ac.action)
                                }
                            }
                        }
                    }
                }
                if (e.deadEntity.typeId === 'minecraft:player') {
                    for (const ev of this.db.findDocuments({ type: 'DEATH' })) {
                        for (const ac of ev.data.actions) {
                            runAction(e.deadEntity, ac.action)
                        }
                    }
                }
            })
            world.afterEvents.entityDie.subscribe(e => {
                if (e.damageSource.damagingEntity) {
                    if (e.damageSource.damagingEntity?.typeId === 'minecraft:player') {
                        for (const ev of this.db.findDocuments({ type: 'PLAYERKILLENTITY' })) {
                            if (ev.data.settings && ev.data.settings.typeId && ev.data.settings.typeId !== e.deadEntity.typeId) continue;
                            for (const ac of ev.data.actions) {
                                runAction(e.damageSource.damagingEntity, ac.action.replaceAll('<typeID>', e.deadEntity.typeId))
                            }
                        }
                    }
                }
                for (const ev of this.db.findDocuments({ type: 'ENTITYDEATH' })) {
                    if (ev.data.settings && ev.data.settings.typeId && ev.data.settings.typeId !== e.deadEntity.typeId) continue;
                    for (const ac of ev.data.actions) {
                        actionParser.runAction(e.deadEntity.dimension, ac.action.replaceAll('<typeID>', e.deadEntity.typeId))
                    }
                }
            })
            world.afterEvents.playerInteractWithBlock.subscribe((e) => {
                let interwithblockevents = this.db.findDocuments({ type: 'PLAYERINTERACTWITHBLOCK' });

                for (const ev of interwithblockevents) {
                    console.log('f')
                    const settings = ev.data.settings || {};
                    const block = e.block;

                    if (!settings.typeId || settings.typeId === block.typeId) {
                        console.log('f123')
                        if (
                            (settings.x === undefined && settings.y === undefined && settings.z === undefined) ||
                            (settings.x === block.x && settings.y === block.y && settings.z === block.z)
                        ) {
                            for (const ac of ev.data.actions) {
                                console.log('f2')
                                runAction(
                                    e.player,
                                    ac.action
                                        .replaceAll('<blockx>', block.x)
                                        .replaceAll('<blocky>', block.y)
                                        .replaceAll('<blockz>', block.z)
                                        .replaceAll('<blockTypeID>', block.typeId)
                                );
                            }
                        }
                    }
                }
            });

            world.beforeEvents.playerGameModeChange.subscribe((e) => {
                let gmevents = this.db.findDocuments({ type: 'GAMEMODECHANGE' })
                for (const ev of gmevents) {
                    for (const ac of ev.data.actions) {
                        runAction(e.player, ac.action.replaceAll('<fromgamemode>', e.fromGameMode).replaceAll('<togamemode>', e.toGameMode))
                    }
                }
            })
            world.afterEvents.weatherChange.subscribe((e) => {
                let weatherevents = this.db.findDocuments({ type: 'WEATHERCHANGE' })
                for (const ev of weatherevents) {
                    let stchck = false;
                    if (ev.data.settings && ev.data.settings.newWeather && ev.data.settings.newWeather !== 'Any') stchck = true;
                    if (stchck) {
                        if (ev.data.settings.newWeather !== e.newWeather) continue;
                        for (const ac of ev.data.actions) {
                            actionParser.runAction(world.getDimension(e.dimension), ac.action.replaceAll('<weathertype>', e.newWeather))
                        }
                    } else {
                        for (const ac of ev.data.actions) {
                            actionParser.runAction(world.getDimension(e.dimension), ac.action.replaceAll('<weathertype>', e.newWeather))
                        }
                    }
                }
            })
            system.afterEvents.scriptEventReceive.subscribe(async e => {
                if (e.id == 'feather:trigger_event') {
                    let ev = this.db.findFirst({ identifier: e.message })
                    if (!ev) return console.log('no event found');
                    if (!this.allowedManualTriggers.find(_ => _ === ev.data.type)) return e.sourceEntity.error('This event does not support manual triggers');
                    if (ev.data.type == 'RANDOMNUMBER') {
                        if (!ev.data.settings) return console.log('RNG Settings have not been configured or are malformed');
                        let number = random(ev.data.settings.startingNumber, ev.data.settings.endingNumber)
                        await this.randomNumberKeyval.set(ev.data.identifier, number)
                    }
                }
            })
            world.beforeEvents.chatSend.subscribe(async e => {
                let chatevents = this.db.findDocuments({ type: 'CHAT' })
                for (const ev of chatevents) {
                    if (!ev.data.settings) continue;
                    if (await formatter.format(ev.data.settings?.message, e.sender) == e.message) {
                        if (ev.data.settings?.cancel == true) e.cancel = true;
                        if (ev.data.settings.closeChat) {
                            const player = e.sender
                            player.success("Close chat and move to open UI.");

                            let ticks = 0;
                            let initialLocation = { x: player.location.x, y: player.location.y, z: player.location.z };

                            let interval = system.runInterval(() => {
                                ticks++;

                                if (ticks >= (20 * 10)) {
                                    system.clearRun(interval);
                                    player.error("Timed out. You didn't move!");
                                }

                                if (player.location.x !== initialLocation.x ||
                                    player.location.y !== initialLocation.y ||
                                    player.location.z !== initialLocation.z) {

                                    system.clearRun(interval);
                                    for (const ac of ev.data.actions) {
                                        runAction(e.sender, ac.action)
                                    }
                                }
                            }, 1);
                        } else {
                            for (const ac of ev.data.actions) {
                                runAction(e.sender, ac.action)
                            }
                        }
                    }
                }
            })
            world.beforeEvents.playerBreakBlock.subscribe(async e => {
                for (const ev of this.db.findDocuments({ type: 'BREAKBLOCK' })) {
                    if (ev.data.settings?.block == e.block.typeId || ev.data.settings?.block == 'ALL' || !ev.data.settings) {
                        for (const ac of ev.data.actions) {
                            runAction(e.player, ac.action.replaceAll('<typeID>', e.block.typeId))
                        }
                    }
                }
            })
            world.afterEvents.playerPlaceBlock.subscribe(async e => {
                for (const ev of this.db.findDocuments({ type: 'PLACEBLOCK' })) {
                    if (ev.data.settings?.block == e.block.typeId || ev.data.settings?.block == 'ALL' || !ev.data.settings) {
                        for (const ac of ev.data.actions) {
                            runAction(e.player, ac.action.replaceAll('<typeID>', e.block.typeId))
                        }
                    }
                }
            })
            world.afterEvents.playerSpawn.subscribe(e => {
                for (const ev of this.db.findDocuments({ type: 'JOIN' })) {
                    for (const ac of ev.data.actions) {
                        if (e.initialSpawn == true) {
                            runAction(e.player, ac.action)
                        }
                    }
                }
            })
        })
    }
    add(identifier, type, settings = null) {
        if (this.db.findFirst({ identifier })) return false;
        if (!this.allowedTypes.find(_ => _ === type)) return false;
        this.db.insertDocument({
            identifier,
            type,
            actions: []
        })
        return true;
    }
    editSettings(id, settings) {
        let ev = this.db.getByID(id)
        if (!ev) return false;
        ev.data.settings = settings
        this.db.overwriteDataByID(id, ev.data)
        return true;
    }
    remove(id) {
        this.db.deleteDocumentByID(id)
    }
    addAction(eventID, action, type) {
        let event = this.db.getByID(eventID);
        if (!this.allowedActionTypes.find(_ => _ === type)) return false;
        event.data.actions.push({
            action,
            type,
            id: Date.now()
        })
        this.db.overwriteDataByID(event.id, event.data)
        return true;
    }
    editAction(eventID, id, newAction) {
        let event = this.db.getByID(eventID);
        let action = event.data.actions.find(_ => _.id === id)
        if (!action) return false;
        action.action = newAction
        this.db.overwriteDataByID(event.id, event.data)
        return true;
    }
    removeAction(eventID, id) {
        let event = this.db.getByID(eventID);
        let action = event.data.actions.find(_ => _.id === id)
        let actionIndex = event.data.actions.findIndex(_ => _.id === id)
        if (actionIndex == -1) return false;
        event.data.actions.splice(actionIndex, 1)
        this.db.overwriteDataByID(event.id, event.data)
        return true;
    }
}

export default new Events();