import { system } from '@minecraft/server'
import { CommandPermissionLevel, CustomCommandParamType, world, Player, CustomCommandStatus } from "@minecraft/server"
import binding from './Modules/binding'
import { transferPlayer } from "@minecraft/server-admin"

if(system.beforeEvents.startup) {
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
                    "type": CustomCommandParamType.String
                }
            ],
        }, (origin, players, ip, port) => {
            system.run(() => {
                for (const player of players) {
                    transferPlayer(player, ip, +port)
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
                if(!player) return;
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
                if(!player) return;
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
            permissionLevel: CommandPermissionLevel.GameDirectors
        }, (asd, cmd) => {
            system.run(() => {
                const player = world.getPlayers().find(_ => _.name === asd.sourceEntity.name)
                if(!player) return;
                let inventory = player.getComponent('inventory');
                let container = inventory.container;
                
                if (!container.getItem(player.selectedSlotIndex)) return player.error("You need to be holding an item");
                
                let item = container.getItem(player.selectedSlotIndex);
                binding.remove(item.typeId)
            })
        })
    })
}