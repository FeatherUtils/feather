import { system } from '@minecraft/server'
import { CommandPermissionLevel, CustomCommandParamType, world, Player, CustomCommandStatus } from "@minecraft/server"
import binding from './Modules/binding'
import { transferPlayer } from "@minecraft/server-admin"
import warps from './Modules/warps'
import uiManager from './Libraries/uiManager'
import config from './config'
import actionParser from './Modules/actionParser'

if (system.beforeEvents.startup) {
    system.beforeEvents.startup.subscribe(async init => {
        init.customCommandRegistry.registerCommand({
            name: "feather:open",
            description: "Open any Feather Essentials UI",
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
                    transferPlayer(player, {hostname: ip, port:+port})
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
                player.success('Teleported successfully')
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
                        `§e${ui.id} | ${ui.altId} §r§7${ui.description ? ui.description : "No Description"
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
                actionParser.runAction(player,command)
            })
        })
    })
}