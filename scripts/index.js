import { world, system, ScriptEventSource, Player, World, ItemComponentTypes } from '@minecraft/server'
import communication from './communication'
import { dynamicToast } from './Libraries/chatNotifs'
import { http, HttpMethod, HttpRequest, HttpHeader } from './Networking/index'

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
import './OldNetworking/currentNetworkingLib'
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
import emojis from './Formatting/emojis'
import { cLog } from './Modules/cLog'

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

import { commands, getPrefix } from './Modules/commands'
import playerShop from './Modules/playerShop'

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

function conditionalTag(player, tag, condition) {
    if(condition) { player.addTag(tag) } else { if(player.hasTag(tag)) player.removeTag(tag) }
}

system.runInterval(() => {
    world.getPlayers().forEach((player) => {
        conditionalTag(player,'jumping',player.isJumping)
        conditionalTag(player,'climbing',player.isClimbing)
        conditionalTag(player,'emoting',player.isEmoting)
        conditionalTag(player,'falling',player.isFalling)
        conditionalTag(player,'flying',player.isFlying)
        conditionalTag(player,'gliding',player.isGliding)
        conditionalTag(player,'inwater',player.isInWater)
        conditionalTag(player,'onground',player.isOnGround)
        conditionalTag(player,'sleeping',player.isSleeping)
        conditionalTag(player,'sneaking',player.isSneaking)
        conditionalTag(player,'sprinting',player.isSprinting)
        conditionalTag(player,'swimming',player.isSwimming)
        conditionalTag(player,'combat',cLog.inCombat(player))
    })
}, 2)

world.beforeEvents.itemUse.subscribe(e => {
    system.run(() => {
        if (e.itemStack.typeId == `${config.config.ui}`) {
            uiManager.open(e.source, config.uinames.config.root);
            return
        }
        let b = e.itemStack.getDynamicProperty('bind')
        if (b) {
            actionParser.runAction(e.source, b)
            return;
        }
    });

    const binds = Array.from(binding.db.findDocuments());
    const typeOrder = { itemname: 0, typeid: 2 };
    binds.sort((a, b) => {
        const ao = typeOrder[a?.data?.type] ?? 1;
        const bo = typeOrder[b?.data?.type] ?? 1;
        return ao - bo;
    });

    for (const bind of binds) {
        if (bind.data.typeID == "feather:entity_action_editor") continue;
        if (bind.data.type === "itemname") {
            if (e.itemStack?.nameTag === bind.data.itemName) {
                e.cancel = true;
                actionParser.runAction(e.source, bind.data.cmd);
                return;
            }
            continue;
        }
        if (bind.data.type === "typeid") {
            if (bind.data.typeID == e.itemStack.typeId) {
                e.cancel = true;
                actionParser.runAction(e.source, bind.data.cmd);
                return;
            }
        }
    }
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
        if (!modules.get('cr')) return;
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
    if (e.id == `feather:speak`) {
        let e2 = { message: e.message, sender: e.sourceEntity }
        if (!modules.get('cr')) {
            if (e2.message.startsWith(getPrefix())) {
                commands.runCommand(e2)
            }
            let mute = moderation.Database.findFirst({ type: 'MUTE', player: e2.sender.id })
            if (mute) return e2.sender.sendMessage(`§cYou have been §4muted! §eReason: ${mute.data.reason}. Expires ${mute.data.time ? moment(mute.data.time).fromNow() : 'in forever'}`)
            world.sendMessage(`<${e2.sender.name}> ${e2.message}`)
            return;
        }
        handleChat(e2)

    }
})

system.run(async () => {
    await system.waitTicks(3)
    commands.addCommand(
        "help",
        "Get a list of commands and how to use them",
        "Help",
        ({ msg, args }) => {
            let d = false;
            if (args[0]) {
                let t = false
                let cmd = commands.Database.findFirst({ uniqueId: args[0] })
                if (!cmd) t = true
                if (!t) {
                    const aliasText = cmd.data.aliases?.length
                        ? `\n§bAliases§8: §7${cmd.data.aliases.map((a) => `${getPrefix()}${a}`).join(" ")}`
                        : "";
                    let scs = commands.Database.findDocuments({ parent: args[0], type: 'SUBCOMMAND' })
                    const subcommandText = scs.length ? `\n§r${scs.map((sc) => ` §8- §e${getPrefix()}§e${cmd.data.uniqueId} §b${sc.data.uniqueId} §8| §7${sc.data.description}`)}` : ''
                    let mesg = `§e${getPrefix()}${cmd.data.uniqueId} §8| §7${cmd.data.description}${aliasText}${subcommandText}`
                    msg.sender.sendMessage(mesg)
                    d = true
                }
            }
            if (d) return;
            const cmds = commands.Database.findDocuments();
            const categories = [];

            for (const cmd of cmds) {
                if (cmd.data.type === 'SUBCOMMAND') continue;
                let category = categories.find((c) => c.name === cmd.data.category);
                if (!category) {
                    category = { name: cmd.data.category, cmds: [] };
                    categories.push(category);
                }
                category.cmds.push(cmd.data);
            }

            const pre = getPrefix();
            const lines = [];

            for (const cat of categories) {
                let c = 0
                for (const cmd of cat.cmds) {
                    if (
                        cmd.permission &&
                        !prismarineDb.permissions.hasPermission(msg.sender, cmd.permission)
                    ) {
                        continue;
                    }

                    if (cmd.type === 'SUBCOMMAND') continue;

                    if (c == 0) lines.push(`§8-=-§b${cat.name}§8-=-§r`);

                    c++

                    const aliasText = cmd.aliases?.length
                        ? ` §7${cmd.aliases.map((a) => `${pre}${a}`).join(" ")}`
                        : "";
                    let scs = commands.Database.findDocuments({ parent: cmd.uniqueId, type: 'SUBCOMMAND' })
                    const subcommandText = scs.length ? `${scs.map((sc) => `\n§r§8- §b${getPrefix()}${cmd.uniqueId} §e${sc.data.uniqueId} §8| §7${sc.data.description}`).join('')}` : ''
                    lines.push(
                        `§b${pre}${cmd.uniqueId}${aliasText} §8| §7${cmd.description}${subcommandText}`
                    );
                }
            }
            msg.sender.sendMessage(lines.join("\n"));
        },
        false,
        null,
        ["cmds"]
    );
    commands.addCommand('lore', 'Edit item lore', 'Admin', ({ msg, args }) => {
        msg.sender.error('Incorrect command! Vaild subcommands: set, clear')
    }, false, 'lore')
    commands.addSubcommand('lore', 'set', 'Set item lore', ({ msg, args }) => {
        const m = args.join(" ");
        const ms = m.split(",").map((s) => s.trim()).filter(Boolean);
        let ssi = msg.sender.selectedSlotIndex
        let inv = msg.sender.getComponent('inventory')
        let inventory = inv.container
        let item = inventory.getItem(ssi)
        if (!item) return msg.sender.error('You are not holding an item')
        item.setLore(ms)
        inventory.setItem(ssi, item)
        msg.sender.success('Set lore')
    }, false)
    commands.addSubcommand('lore', 'clear', 'Clear item lore', ({ msg }) => {
        let ssi = msg.sender.selectedSlotIndex
        let inv = msg.sender.getComponent('inventory')
        let inventory = inv.container
        let item = inventory.getItem(ssi)
        if (!item) return msg.sender.error('You are not holding an item')
        item.setLore()
        inventory.setItem(ssi, item)
        msg.sender.success('Cleared lore')
    }, false)
    commands.addCommand('say', 'A testing command', 'Development', ({ msg, args }) => {
        if (!modules.get('devMode')) return msg.sender.error('This command is disabled.')
        msg.sender.sendMessage(args.join(' '))
    }, false)
    commands.addSubcommand('say', 'firstarg', 'Another testing command', ({ msg, args }) => {
        if (!modules.get('devMode')) return msg.sender.error('This command is also disabled lil bro')
        msg.sender.sendMessage(`${args[0]}`)
    })
    commands.addSubcommand('say', 'toast', 'Test toast', ({ msg, args }) => {
        if (!modules.get('devMode')) return msg.sender.error('This command is also disabled lil bro')
        msg.sender.sendMessage(dynamicToast(args[0], args.splice(1).join(' '), '', 'textures/ui/pinkBorder'))
    })
    commands.addCommand('gamemode', "Switch gamemodes", 'Admin', ({ msg, args }) => {
        if (!args[0]) return msg.sender.error('You need to enter an argument')
        if (args[0] === '0' || args[0] === 's' || args[0] == 'survival') return msg.sender.setGameMode("Survival"), msg.sender.success('Set gamemode to survival')
        if (args[0] === '1' || args[0] === 'c' || args[0] == 'creative') return msg.sender.setGameMode("Creative"), msg.sender.success('Set gamemode to creative')
        if (args[0] === '2' || args[0] === 'a' || args[0] == 'adventure') return msg.sender.setGameMode("Adventure"), msg.sender.success('Set gamemode to adventure')
        if (args[0] === '3' || args[0] === 'sp' || args[0] == 'spectator') return msg.sender.setGameMode("Spectator"), msg.sender.success('Set gamemode to spectator')
        msg.sender.error('Invalid gamemode')
    }, false, 'gamemodes', ['gm'])
    commands.addCommand('fix', 'Fix an item', 'Admin', ({ msg, args }) => {
        const player = msg.sender;
        const ssi = player.selectedSlotIndex;
        if (!ssi) {
            return player.error?.("No selected slot index");
        }
        const inv = player.getComponent("minecraft:inventory");
        const container = inv?.container;
        if (!container) return player.error?.("No inventory container");
        const item = container.getItem(ssi);
        if (!item) return player.error?.("No item in selected slot");
        const durability = item.getComponent(ItemComponentTypes.Durability);
        if (!durability) return player.error?.("Item has no durability");
        durability.damage = 0
        container.setItem(ssi, item);
    }, false, 'fixitem')
    commands.addCommand('clearchat', 'Clear the chat', 'Admin', ({ msg, args }) => {
        let a = 100
        let a2 = []
        for (let i = 0; i < a; i++) {
            a2.push('')
        }
        a2.push(`§bChat cleared by §e${msg.sender.name}`)
        world.sendMessage(a2.join('\n'))
    }, false, 'clearchat', ['cc'])
    commands.addCommand('pay', 'Pay a player', 'Economy', ({ msg }) => {
        if (!modules.get(`pay`)) return msg.sender.error('/pay is disabled :(')
        uiManager.open(msg.sender, config.uinames.pay)
    }, true)
    commands.addCommand('bind', 'Bind an item to a command', 'Admin', ({ msg, args }) => {
        const player = msg.sender
        const cmd = args.join(' ')
        if (!player) return;
        console.log(binding.db.findDocuments().map(_ => _.typeID))
        let inventory = player.getComponent('inventory');
        let container = inventory.container;

        if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

        let item = container.getItem(player.selectedSlotIndex);
        binding.add(item.typeId, cmd)
        return player.success('Successfully binded ' + item.typeId + ' to ' + cmd)
    }, false, 'bind')
    commands.addSubcommand('bind', 'name', 'Add an itemname specific bind', ({ msg, args }) => {
        const player = msg.sender
        const cmd = args.join(' ')
        if (!player) return;
        console.log(binding.db.findDocuments().map(_ => _.typeID))
        let inventory = player.getComponent('inventory');
        let container = inventory.container;

        if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

        let item = container.getItem(player.selectedSlotIndex);
        binding.addItemName(item.typeId, item.nameTag, cmd)
        return player.success('Successfully binded ' + item.typeId + ' with name ' + item.nameTag + ' to ' + cmd)
    })
    commands.addSubcommand('bind', 'item', 'Bind a command to a SPECIFIC item', ({ msg, args }) => {
        let cmd = args.join(' ')
        let inventory = msg.sender.getComponent('inventory');
        let container = inventory.container;
        let ssi = msg.sender.selectedSlotIndex
        let item = container.getItem(ssi)
        if (!item) return msg.sender.error('No item found')
        try {
            item.setDynamicProperty('bind', cmd)
        } catch (e) {
            try {
                msg.sender.error(e)
                return
            } catch (e) {
                world.criticalError(e)
                return
            }
        }
        return msg.sender.success('Set the item you are holding command to: ' + cmd)
    })
    commands.addCommand('removebind', 'Remove a bind from an item', 'Admin', ({ msg }) => {
        const player = msg.sender
        if (!player) return;
        let inventory = player.getComponent('inventory');
        let container = inventory.container;

        if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

        let item = container.getItem(player.selectedSlotIndex);
        binding.remove(item.typeId)
        player.success('Successfully removed bind from ' + item.typeId)
    }, false, 'bind')
    commands.addSubcommand('removebind', 'name', 'Remove an itemname bind from an item', ({ msg }) => {
        const player = msg.sender
        if (!player) return;
        let inventory = player.getComponent('inventory');
        let container = inventory.container;

        if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

        let item = container.getItem(player.selectedSlotIndex);
        binding.removeItemName(item.nameTag, item.typeId)
        player.success('Successfully removed bind from ' + item.typeId)
    })
    commands.addSubcommand('removebind', 'item', 'Remove a specific item from said specific item', ({ msg }) => {
        let inventory = msg.sender.getComponent('inventory');
        let container = inventory.container;
        let ssi = msg.sender.selectedSlotIndex
        let item = container.getItem(ssi)
        if (!item) return msg.sender.error('No item found')
        item.setDynamicProperty('bind', null)
        return msg.sender.success('removed the bind from this specific item')
    })
    commands.addCommand('removebinddb', 'A developer command', 'Development', ({ msg }) => {
        if (!modules.get('devMode')) return msg.sender.error('guh')
        binding.db.clear()
    })
    commands.addCommand('award', 'PlayerShop Award Testing', 'Development', ({ msg, args }) => {
        if (!modules.get('devMode')) return msg.sender.error('dont use this xD')
        playerShop.queueMoney(msg.sender.id, +args[0], args[1])
    }, false, 'administrator')
    commands.addCommand('view', 'View a player and run moderation actions on them', 'Moderation', ({ msg, args }) => {
        let players = playerStorage.searchPlayersByName(`${args[0]}`)
        let player = null;
        for (const plrid of players) {
            let plr = playerStorage.getPlayerByID(plrid)
            if (!plr.name) continue;
            if (plr.name.toLowerCase() == args[0].toLowerCase()) player = plr
            console.log(plr.name.toLowerCase())
        }
        if (!player) return msg.sender.error(playerStorage.getPlayerByID(players[0]) ? `No player found! Did you mean ${playerStorage.getPlayerByID(players[0]).name}?` : `No player found! No similar matches.`)
        uiManager.open(msg.sender, config.uinames.playerManagement.view, player.id)
    }, true, 'plrmgmnt')
    commands.addCommand('message', 'Message another player', 'Social', ({ msg, args }) => {
        let players = args[0]
        let message = args.slice(1).join(' ')
        let plr = msg.sender
        let player = world.getPlayers().find(_ => _.name.toLowerCase() == players.toLowerCase())
        if (!player) return plr.error('Player not found: ' + players)
        if (player.name == plr.name) return plr.error(`That's you, silly!`)
        player.sendMessage(`§b${plr.name} > You §8>> §7${message}`)
        plr.sendMessage(`§bYou > ${player.name} §8>> §7${message}`)
        player.setDynamicProperty('lastMessageFrom', plr.name)
        for (const plr2 of world.getPlayers()) {
            if (!plr2.hasTag('socialspy')) continue;
            if (plr2.name == plr.name) continue;
            if (player.name === plr2.name) continue;
            plr2.sendMessage(`§7[SocialSpy] §b${plr.name} > ${player.name} §8>> §7${message}`)
        }
    }, false, null, ['msg'])
    commands.addCommand('emojis', 'View all emojis', 'Social', ({ msg }) => {
        let player = msg.sender;
        let text = [[]];
        for (const key in emojis) {
            if (text[text.length - 1].length < 1) {
                text[text.length - 1].push(`:${key}: ${emojis[key]}`);
            } else {
                text.push([`:${key}: ${emojis[key]}`])
            }
        }
        player.sendMessage([text.map(_ => _.join('')).join('\n§r'), '', '§aTo use emojis, do :emoji_name: in chat. Example:   :skull:'].join('\n§r'))
    }, false, null, ['emotes', 'emotions'])
    commands.addCommand('reply', 'Reply to the last message you were sent', 'Social', ({ msg, args }) => {
        let message = args.join(' ')
        let plr = msg.sender
        let plrname = plr.getDynamicProperty('lastMessageFrom')
        let player = world.getPlayers().find(_ => _.name == plrname)
        if (!player) return plr.error('That player was not found!');
        player.sendMessage(`§b${plr.name} > You §8>> §7${message}`)
        plr.sendMessage(`§bYou > ${player.name} §8>> §7${message}`)
        player.setDynamicProperty('lastMessageFrom', plr.name)
        for (const plr2 of world.getPlayers()) {
            if (!plr2.hasTag('socialspy')) continue;
            if (plr2.name == plr.name) continue;
            if (player.name === plr2.name) continue;
            plr2.sendMessage(`§7[SocialSpy] §b${plr.name} > ${player.name} §8>> §7${message}`)
        }
    }, false, null, ['r'])
    commands.addCommand('socialspy', 'See players private messages', 'Moderation', ({ msg }) => {
        let plr = msg.sender
        let added = false;
        if (!plr.hasTag('socialspy')) plr.addTag('socialspy'), added = true
        if (plr.hasTag('socialspy') && !added) plr.removeTag('socialspy')
        plr.sendMessage(`Toggled socialspy ${plr.hasTag('socialspy') ? 'on' : 'off'}`)
    }, false, 'administrator', ['ss'])
    commands.addCommand('smite', 'Smite a player', 'Admin', ({ msg, args }) => {
        if (!args[0]) return msg.sender.error('Specify a player')
        let player = world.getPlayers().find(_ => _.name.toLowerCase() === args[0].toLowerCase())
        if (!player) return msg.sender.error('Could not find player')
        player.runCommand('summon lightning_bolt')
        return msg.sender.success('Smited ' + player.name)
    }, false, 'administrator')
    commands.addSubcommand('smite', 'all', 'Smite everyone on the server', ({ msg }) => {
        world.getPlayers().forEach((player) => {
            player.runCommand('summon lightning_bolt')
        })
        return msg.sender.success('Smited ' + world.getPlayers().map((a) => a.name).join(', '))
    }, false)
    commands.addCommand('nickname', 'Change your nickname', 'Social', ({ msg, args }) => {
        let name = args.join(' ')
        let player = msg.sender
        if (!modules.get('nick')) return player.error('/nick is disabled >:(')
        player.setDynamicProperty('nickname', name.replaceAll('.', ''))
        player.success('Set nickname to ' + name.replaceAll('.', ''))
    }, false, null, ['nick'])
    commands.addCommand('randomteleport', 'Randomly teleport in the world', 'Features', ({ msg }) => {
        if (!modules.get('rtp')) return msg.sender.error('RTP is disabled! :(')
        msg.sender.runCommand('feather:rtp')
    }, false, null, ['rtp', 'wild', 'randomtp'])
    commands.addCommand('homes', 'Use the homes feature', 'Features', ({ msg }) => { msg.sender.runCommand('homes') }, true, null, ['home'])
})

world.beforeEvents.chatSend.subscribe(e => {
    if (!modules.get('cr')) {
        if (e.message.startsWith(getPrefix())) {
            commands.runCommand(e)
            e.cancel = true;
        }
        let mute = moderation.Database.findFirst({ type: 'MUTE', player: e.sender.id })
        if (mute) return e.sender.sendMessage(`§cYou have been §4muted! §eReason: ${mute.data.reason}. Expires ${mute.data.time ? moment(mute.data.time).fromNow() : 'in forever'}`), e.cancel = true;
        return;
    }
    e.cancel = true;
    handleChat(e)
})