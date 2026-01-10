import { world, system, ScriptEventSource, Player, World } from '@minecraft/server'
import communication from './communication'

communication.register('feather:pushToConfig', ({ args }) => {
    console.log(api.get().toString())
    system.run(async () => {
        await system.waitTicks(10)
        console.log(args[0])
        api.add(JSON.parse(args[0]))
    })
})
communication.register('feather:lifestealInstalled', ({ args }) => {
    system.run(async () => {
        console.log('[Feather] Lifesteal is installed, version: ' + args[0])
        api.lifestealInstalled = true;
        api.lifestealVersion = args[0]
        api.buttons.push({ text: '§bLifesteal', subtext: 'Open the Feather Lifesteal configuration', actions: ['scriptevent featherlifesteal:config'], icon: 'textures/items/heartofthesea_closed', permission: 'lifestealConfig' })
        system.sendScriptEvent('featherlifesteal:verifyFeatherInstalled', `"${config.info.versionString()}"`)
    })
})
communication.register('feather:test', ({ args }) => {
    system.run(() => {
        world.sendMessage(args.join(" "))
    })
})

system.run(async () => {
    await system.waitTicks(10)
    system.sendScriptEvent('feather:isInstalled', `"${config.info.versionString()}"`)
})
import events from './Modules/events'
import './UIs/index'
import { prismarineDb } from './Libraries/prismarinedb'
import './Networking/currentNetworkingLib'
import config from './config'
import uiManager from './Libraries/uiManager'
import './customCommandHandler'
import handleChat from './handleChat'
import modules from './Modules/modules'
import playerStorage from './Libraries/playerStorage'
import formatter from './Formatting/formatter'
import moment from './Libraries/moment'
import './Openers/form'
import './IconPacks/index'
import moderation from './Modules/moderation'
import binding from './Modules/binding'
import sidebarEditor from './Modules/sidebarEditor'
import actionParser from './Modules/actionParser'
import api from './UIs/config/api'
import './Modules/antiAfk'
import { ActionForm } from './Libraries/form_func'
import { consts } from './cherryUIConsts'


Player.prototype.error = function (msg) {
    this.sendMessage(`§c§lERROR§8 >>§r§7 ${msg}`)
}
Player.prototype.success = function (msg) {
    this.sendMessage(`§a§lSUCCESS§8 >>§r§7 ${msg}`)
}
Player.prototype.info = function (msg) {
    this.sendMessage(`§b§lINFO§8 >>§r§7 ${msg}`)
}
World.prototype.error = function (msg) {
    this.sendMessage(`§cError §8>>§r§7 ${msg}`)
}
World.prototype.criticalError = function (msg) {
    this.sendMessage(`§4CRITICAL ERROR §8>>§r§7 ${msg}`)
}

import './Modules/betterKb'
import { ModalFormData } from '@minecraft/server-ui'
import keyvalues from './Modules/keyvalues'

system.run(() => {
    world.sendMessage(`§d${config.info.name} §e- §b${config.info.versionString()} §e- §bLoaded!`)
    if (!world.scoreboard.getObjective('feather:secondsplayed')) world.scoreboard.addObjective('feather:secondsplayed')
    if (!world.scoreboard.getObjective('feather:minutesplayed')) world.scoreboard.addObjective('feather:minutesplayed')
    if (!world.scoreboard.getObjective('feather:hoursplayed')) world.scoreboard.addObjective('feather:hoursplayed')
    if (!prismarineDb.permissions.getRole('admin')) prismarineDb.permissions.createRole('admin')
    prismarineDb.permissions.setAdmin('admin', true)
})

world.afterEvents.playerSpawn.subscribe(e => {
    if (!e.initialSpawn) return;
    const ban = moderation.Database.findFirst({ type: 'BAN', player: e.player.id })
    if (ban) {
        world.getDimension('minecraft:overworld').runCommand(`kick "${e.player.name}" You are banned for ${moment(ban.data.time).fromNow()}.\nReason:\n${ban}`)
    }
    const warnings = moderation.Database.findDocuments({ type: 'WARNING', player: e.player.id })
    let warningsformatted = [];
    if (warnings.length > 0) {
        warningsformatted.push('-=-=-=-WARNINGS-=-=-=-')
        warningsformatted.push('')
    }
    let i = 0
    for (const warning of warnings) {
        i++
        warningsformatted.push(`Warning ${i}: ${warning.data.reason}`)
    }
    if (warningsformatted.length > 0) {
        e.player.sendMessage(warningsformatted.join('\n'))
    }
})

let btns = [];

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        system.run(() => {
            playerStorage.saveData(player)
        })
    }
}, 2)

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        if(player.isJumping) { player.addTag('jumping') } else { if(player.hasTag('jumping')) player.removeTag('jumping') }
        if(player.isClimbing) { player.addTag('climbing') } else { if(player.hasTag('climbing')) player.removeTag('climbing') }
        if(player.isEmoting) { player.addTag('emoting') } else { if(player.hasTag('emoting')) player.removeTag('emoting') }
        if(player.isFalling) { player.addTag('falling') } else { if(player.hasTag('falling')) player.removeTag('falling') }
        if(player.isFlying) { player.addTag('flying') } else { if(player.hasTag('flying')) player.removeTag('flying') }
        if(player.isGliding) { player.addTag('gliding') } else { if(player.hasTag('gliding')) player.removeTag('gliding') }
        if(player.isInWater) { player.addTag('inwater') } else { if(player.hasTag('inwater')) player.removeTag('inwater') }
        if(player.isOnGround) { player.addTag('onground') } else { if(player.hasTag('onground')) player.removeTag('onground') }
        if(player.isSleeping) { player.addTag('sleeping') } else { if(player.hasTag('sleeping')) player.removeTag('sleeping') }
        if(player.isSneaking) { player.addTag('sneaking') } else { if(player.hasTag('sneaking')) player.removeTag('sneaking') }
        if(player.isSprinting) { player.addTag('sprinting') } else { if(player.hasTag('sprinting')) player.removeTag('sprinting') }
        if(player.isSwimming) { player.addTag('swimming') } else { if(player.hasTag('swimming')) player.removeTag('swimming') }
    })
}, 2)

world.beforeEvents.itemUse.subscribe(e => {
    for (const bind of binding.db.findDocuments()) {
        if (bind.data.typeID == 'feather:entity_action_editor') continue;
        if (bind.data.typeID == e.itemStack.typeId) {
            e.cancel = true
            actionParser.runAction(e.source, bind.data.cmd)
        }
    }
    system.run(() => {
        if (e.itemStack.typeId == `${config.config.ui}`) {
            uiManager.open(e.source, config.uinames.config.root);
        }

    });
});

world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    let entity = e.target
    let player = e.player
    if (e.target.typeId === 'minecraft:player') return;
    const item = e.itemStack
    if (!item || item.typeId !== 'feather:entity_action_editor') return;
    e.cancel = true
    system.run(() => {
        let actions = keyvalues.get(`eactioneditor:${entity.id}`)
        if (!actions) actions = [];

        console.log('Attempted to open menu')
        let form = new ActionForm();
        form.title(consts.tag + 'Actions')
        form.button('Add', null, (player) => {
            let form2 = new ModalFormData();
            form2.title('Code Editor')
            form2.textField('Code', 'code')
            form2.show(player).then((res) => {
                let [a] = res.formValues
                actions.push(a)
                console.log(actions)
                keyvalues.set(`eactioneditor:${entity.id}`, actions)
            })
        })
        for (const action of actions) {
            let i = actions.findIndex((_) => _ == action)
            form.button(`${action}`, null, (player) => {
                let form2 = new ActionForm();
                form2.title(consts.tag)
                form2.button('Edit', null, (player) => {
                    let form3 = new ModalFormData();
                    form3.title('Code Editor')
                    form3.textField('Code', 'code', { defaultValue: action })
                    form3.show(player).then((res) => {
                        let [a] = res.formValues;
                        actions[i] = a
                        keyvalues.set(`eactioneditor:${entity.id}`, actions)
                    })
                })
                form2.button('Delete', null, (player) => {
                    actions.splice(i, 1)
                    keyvalues.set(`eactioneditor:${entity.id}`, actions)
                })
                form2.show(player)
            })
        }
        form.show(player)
    })
})
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    const entity = e.target
    const player = e.player

    if (entity.typeId === 'minecraft:player') return

    const item = e.itemStack

    if (item?.typeId === 'feather:entity_action_editor') return

    const actions = keyvalues.get(`eactioneditor:${entity.id}`)
    if (!actions || actions.length === 0) return

    e.cancel = true

    system.run(() => {
        for (const action of actions) {
            actionParser.runAction(player, action)
        }
    })
})


system.runInterval(async () => {
    for (const plr of world.getPlayers()) {
        plr.nameTag = `${await formatter.format(`§r<bc>[§r{{joined_ranks}}§r<bc>]§r §r<nc><name>`, plr)}`
    }
}, 20)

function ensureIdentity(objName, plr) {
    plr.runCommand(`scoreboard players add @s ${objName} 0`)
}

system.runInterval(() => {
    const splayed = world.scoreboard.getObjective("feather:secondsplayed")
    const mplayed = world.scoreboard.getObjective("feather:minutesplayed")
    const hplayed = world.scoreboard.getObjective("feather:hoursplayed")

    for (const plr of world.getPlayers()) {
        ensureIdentity("feather:secondsplayed", plr)
        ensureIdentity("feather:minutesplayed", plr)
        ensureIdentity("feather:hoursplayed", plr)

        let s = splayed.getScore(plr)
        let m = mplayed.getScore(plr)
        let h = hplayed.getScore(plr)

        if (s === undefined) s = 0
        if (m === undefined) m = 0
        if (h === undefined) h = 0

        s += 1

        if (s > 59) {
            s = 0
            m += 1
        }

        if (m > 59) {
            m = 0
            h += 1
        }

        splayed.setScore(plr, s)
        mplayed.setScore(plr, m)
        hplayed.setScore(plr, h)
    }
}, 20)

world.beforeEvents.playerLeave.subscribe(e => {
    playerStorage.saveData(e.player)
})

function betterArgs(myString) {
    var myRegexp = /[^\s"]+|"([^"]*)"/gi;
    var myArray = [];

    do {
        var match = myRegexp.exec(myString);
        if (match != null) {
            myArray.push(match[1] ? match[1] : match[0]);
        }
    } while (match != null);

    return myArray;
}

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (
        e.id.startsWith(config.config.openui) &&
        e.sourceType == ScriptEventSource.Entity &&
        e.sourceEntity.typeId == "minecraft:player"
    ) {
        let args = betterArgs(e.message);
        uiManager.open(e.sourceEntity, e.id.replaceAll(config.config.openui, ''), ...args.slice(1))
    }
    if (e.id == `blossom:run`) {
        commandManager.run(e)
    }
})

world.beforeEvents.chatSend.subscribe(e => {
    if (!modules.get('cr')) {
        let mute = moderation.Database.findFirst({ type: 'MUTE', player: e.sender.id })
        if (mute) return e.sender.sendMessage(`§cYou have been §4muted! §eReason: ${mute.data.reason}. Expires ${mute.data.time ? moment(mute.data.time).fromNow() : 'in forever'}`), e.cancel = true;
        return;
    }
    e.cancel = true;
    handleChat(e)
})
