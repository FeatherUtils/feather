import { GameMode, system } from '@minecraft/server'
import { CommandPermissionLevel, CustomCommandParamType, world, Player, CustomCommandStatus } from "@minecraft/server"
import binding from './Modules/binding'
import { transferPlayer } from "@minecraft/server-admin"
import warps from './Modules/warps'
import uiManager from './Libraries/uiManager'
import config from './config'
import actionParser from './Modules/actionParser'
import formatter from './Formatting/formatter'
import modules from './Modules/modules'
import emojis from './Formatting/emojis'

if (system.beforeEvents.startup) {
    system.beforeEvents.startup.subscribe(async init => {
        init.customCommandRegistry.registerEnum('feather:gamemodetypes', ['0', '1', '2', '3', 's', 'c', 'a', 'sp', 'survival', 'creative', 'adventure', 'spectator'])
        init.customCommandRegistry.registerCommand({
            name: 'feather:emojis',
            description: 'see all emojis',
            permissionLevel: CommandPermissionLevel.Any
        }, (origin) => {
            let player = origin.sourceEntity;
            let text = [[]];
            for (const key in emojis) {
                if (text[text.length - 1].length < 1) {
                    text[text.length - 1].push(`:${key}: ${emojis[key]}`);
                } else {
                    text.push([`:${key}: ${emojis[key]}`])
                }
            }
            player.sendMessage([text.map(_ => _.join('        ')).join('\n§r'), '', '§aTo use emojis, do :emoji_name: in chat. Example:   :skull:'].join('\n§r'))
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:gm",
            description: "Switch gamemode",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: 'feather:gamemodetypes',
                    type: CustomCommandParamType.Enum
                }
            ],
            optionalParameters: [
                {
                    name: "players",
                    type: CustomCommandParamType.PlayerSelector
                },
            ]
        }, (origin, gm, players) => {
            system.run(() => {
                if (players) {
                    for (const player of players) {
                        if (gm == '0' || gm == 's' || gm == 'survival') {
                            player.setGameMode(GameMode.Survival)
                        }
                        if (gm == '1' || gm == 'c' || gm == 'creative') {
                            player.setGameMode(GameMode.Creative)
                        }
                        if (gm == '2' || gm == 'a' || gm == 'adventure') {
                            player.setGameMode(GameMode.Adventure)
                        }
                        if (gm == '3' || gm == 'sp' || gm == 'spectator') {
                            player.setGameMode(GameMode.Spectator)
                        }
                    }
                } else {
                    let player = origin.sourceEntity
                    if (gm == '0' || gm == 's' || gm == 'survival') {
                        player.setGameMode(GameMode.Survival)
                    }
                    if (gm == '1' || gm == 'c' || gm == 'creative') {
                        player.setGameMode(GameMode.Creative)
                    }
                    if (gm == '2' || gm == 'a' || gm == 'adventure') {
                        player.setGameMode(GameMode.Adventure)
                    }
                    if (gm == '3' || gm == 'sp' || gm == 'spectator') {
                        player.setGameMode(GameMode.Spectator)
                    }
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:smite',
            description: 'Smite someone',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: 'players',
                    type: CustomCommandParamType.PlayerSelector
                }
            ]
        }, (origin, plrs) => {
            system.run(() => {
                let player = origin.sourceEntity
                let players = []
                for (const plr of plrs) {
                    plr.runCommand('summon lightning_bolt')
                    players.push(plr.name)
                }
                player.sendMessage(`Smited ${players.join(', ')}`)
            })
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:nick',
            description: 'Set a nickname for yourself',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: 'name',
                    type: CustomCommandParamType.String
                }
            ]
        }, (origin, name) => {
            system.run(() => {
                let player = origin.sourceEntity
                if (!modules.get('nick')) return player.error('/nick is disabled >:(')
                player.setDynamicProperty('nickname', name.replaceAll(' ', '').replaceAll('.', ''))
            })
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:pay',
            description: "Pay users",
            permissionLevel: CommandPermissionLevel.Any,
        }, (origin) => {
            let player = origin.sourceEntity
            if (!modules.get(`pay`)) return player.error('/pay is disabled :(')
            uiManager.open(player, config.uinames.pay)
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:warptime',
            description: 'Customize how long it takes to warp',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: 'seconds',
                    type: CustomCommandParamType.Integer
                }
            ]
        }, (origin,seconds) => {
            modules.set('warptime', seconds),
            origin.sourceEntity.success('Set warp time to ' + `${seconds}`)
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:homes',
            description: "Open homes ui",
            permissionLevel: CommandPermissionLevel.Any,
        }, (origin) => {
            let player = origin.sourceEntity
            if (!modules.get(`homes`)) return player.error('/homes is disabled :(')
            uiManager.open(player, config.uinames.homes.root)
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:vote',
            description: "Open voting ui",
            permissionLevel: CommandPermissionLevel.Any,
        }, (origin) => {
            let player = origin.sourceEntity
            if (!modules.get(`vote`)) return player.error('/vote is disabled :(')
            uiManager.open(player, config.uinames.voting.root)
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:bounty',
            description: "Open bounty ui",
            permissionLevel: CommandPermissionLevel.Any,
        }, (origin) => {
            let player = origin.sourceEntity
            if (!modules.get(`bounty`)) return player.error('/bounty is disabled :(')
            uiManager.open(player, config.uinames.bounty.root)
        })
        init.customCommandRegistry.registerCommand({
            name: 'feather:sudo',
            description: 'Talk as other players or run commands as them',
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "players",
                    type: CustomCommandParamType.PlayerSelector
                },
                {
                    name: "action",
                    type: CustomCommandParamType.String
                }
            ]
        }, (origin, players, action) => {
            let plr = origin.sourceEntity
            let ac = action
            if (action.startsWith('/')) ac = action.replace('/', '')
            for (const player of players) {
                if (action.startsWith('/')) {
                    system.run(() => {
                        player.runCommand(ac)
                    })
                } else {
                    system.run(async () => {
                        world.sendMessage(await formatter.format(`${modules.get('crf')}`, player, ac))
                    })
                }
            }
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:config",
            description: "Open the feather essentials config ui",
            permissionLevel: CommandPermissionLevel.GameDirectors
        }, (origin) => {
            let player = origin.sourceEntity
            uiManager.open(player,config.uinames.config.root)
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:open",
            description: "Open any Feather Essentials UI BUILDER UI",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "players",
                    type: CustomCommandParamType.PlayerSelector
                },
                {
                    name: "scriptevent",
                    "type": CustomCommandParamType.String
                }
            ],
        }, (origin, players, scriptevent) => {
            system.run(() => {
                for (const player of players) {
                    player.runCommand(`scriptevent feather:open ${scriptevent}`)
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:transfer",
            description: "Transfer a player to a different server",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "players",
                    type: CustomCommandParamType.PlayerSelector
                },
                {
                    name: "ip",
                    "type": CustomCommandParamType.String
                },
                {
                    name: "port",
                    "type": CustomCommandParamType.Integer
                }
            ],
        }, (origin, players, ip, port) => {
            system.run(() => {
                for (const player of players) {
                    transferPlayer(player, { hostname: ip, port: +port })
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:bind",
            description: "Bind a command to an item (uses item you are holding)",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "command",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, cmd) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                console.log('meow')
                console.log(binding.db.findDocuments().map(_ => _.typeID))
                let inventory = player.getComponent('inventory');
                let container = inventory.container;

                if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

                let item = container.getItem(player.selectedSlotIndex);
                binding.add(item.typeId, cmd)
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:removebind",
            description: "Remove the bind from an item (uses item you are holding)",
            permissionLevel: CommandPermissionLevel.GameDirectors
        }, (asd, cmd) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let inventory = player.getComponent('inventory');
                let container = inventory.container;

                if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");

                let item = container.getItem(player.selectedSlotIndex);
                binding.remove(item.typeId)
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:addwarp",
            description: "Create a warp",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "name",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let dim = player.dimension.id
                warps.add(name, player.location, dim)
                player.success('Created successfully')
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:addft",
            description: "Add floating text",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "text",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                let overworld = world.getDimension('overworld')
                let ft = overworld.spawnEntity('feather:floating_text', player.location)
                ft.nameTag = name
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:killft",
            description: "Kill floating text",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "range",
                    type: CustomCommandParamType.Integer
                }
            ],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                player.runCommand(`kill @e[type=feather:floating_text,r=${name}]`)
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:announce",
            description: "Send a server announcement",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "text",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, name) => {
            system.run(async () => {
                for (const player of world.getPlayers()) {
                    player.sendMessage(`§b§lANNOUNCEMENT §r§7>> §r${await formatter.format(name, player)}`)
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:repeat",
            description: "Repeat a command multiple times",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "command",
                    type: CustomCommandParamType.String
                },
                {
                    name: "amount",
                    type: CustomCommandParamType.Integer
                }
            ],
        }, (asd, cmd, int) => {
            system.run(async () => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                for (let i = 0; i < int; i++) {
                    actionParser.runAction(player, cmd)
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:inventorysee",
            description: "View and take items from someone's inventory",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "player",
                    type: CustomCommandParamType.PlayerSelector
                }
            ],
        }, (asd, cmd) => {
            system.run(async () => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                for (const user of cmd) {
                    uiManager.open(player, config.uinames.inventorySee, user)
                }
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:warp",
            description: "Warp",
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
                {
                    name: "name",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let id = warps.db.findFirst({ name }).id
                warps.tp(player, id)
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:listwarp",
            description: "List warps",
            permissionLevel: CommandPermissionLevel.Any,
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let docs = warps.db.findDocuments()
                let as = ['§7-=-=-=- §bWarps §7-=-=-=-'];
                for (const doc of docs) {
                    as.push(`§b${doc.data.name}`)
                }
                player.sendMessage(as.join(`\n§r`))
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:delwarp",
            description: "Delete Warp",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [
                {
                    name: "name",
                    type: CustomCommandParamType.String
                }
            ],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let id = warps.db.findFirst({ name }).id
                warps.del(id)
                player.success('Deleted successfully')
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:uis",
            description: "View all UIS",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [],
        }, (asd, name) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                let text = [];
                text.push(`§8----------- §aList §r§8-----------`);
                for (const ui of uiManager.uis) {
                    text.push(
                        `§e${ui.id} §8| §r§7${ui.description ? ui.description : "No Description"
                        }`
                    );
                }
                text.push(``);
                text.push(
                    `§2You can open a UI by doing §f/scriptevent ${config.config.openui}§eui_id`
                );
                text.push(
                    `§2Example: the ui §ehomes §r§2would be §a/scriptevent §b${config.config.openui}§ehomes`
                );
                player.sendMessage(text.join("\n§r"));
            })
        })
        init.customCommandRegistry.registerCommand({
            name: "feather:delay",
            description: "Delay a command",
            permissionLevel: CommandPermissionLevel.GameDirectors,
            mandatoryParameters: [{ type: CustomCommandParamType.Integer, name: "ticks" }, {
                name: "command",
                type: CustomCommandParamType.String
            }],
        }, (asd, ticks, command) => {
            system.run(async () => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if (!player) return;
                await system.waitTicks(ticks)
                actionParser.runAction(player, command)
            })
        })
    })
}