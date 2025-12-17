import { prismarineDb } from "../Libraries/prismarinedb";
import { system, world } from "@minecraft/server";
import { PlatformType, PlayerPermissionLevel } from "@minecraft/server";

class PlatformSettings {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.table('PlatformSettings')
            this.console = await this.db.keyval('console')
            this.computer = await this.db.keyval('computer')
            this.phone = await this.db.keyval('phone')
            world.afterEvents.playerSpawn.subscribe(async (e) => {
                e.player.removeTag('Platform:Console')
                e.player.removeTag('Platform:Desktop')
                e.player.removeTag('Platform:Mobile')
                e.player.addTag(`Platform:${e.player.clientSystemInfo.platformType}`)
                if (this.db.findFirst({ type: "WHITELIST", username: e.player.name })) return;
                if (e.player.playerPermissionLevel == PlayerPermissionLevel.Operator) return;
                if (e.player.hasTag('admin')) return;
                if (await this.console.get('isBanned') == true) {
                    if (e.player.clientSystemInfo.platformType == PlatformType.Console) {
                        e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                    }
                }
                if (await this.computer.get('isBanned') == true) {
                    if (e.player.clientSystemInfo.platformType == PlatformType.Desktop) {
                        e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                    }
                }
                if (await this.phone.get('isBanned') == true) {
                    if (e.player.clientSystemInfo.platformType == PlatformType.Mobile) {
                        e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                    }
                }
            })
            system.runInterval(async () => {
                for (const plr of world.getPlayers()) {
                    const e = { player: plr }
                    if (this.db.findFirst({ type: "WHITELIST", username: e.player.name })) return;
                    if (e.player.playerPermissionLevel == PlayerPermissionLevel.Operator) return;
                    if (e.player.hasTag('admin')) return;
                    if (await this.console.get('isBanned') == true) {
                        if (e.player.clientSystemInfo.platformType == PlatformType.Console) {
                            e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                        }
                    }
                    if (await this.computer.get('isBanned') == true) {
                        if (e.player.clientSystemInfo.platformType == PlatformType.Desktop) {
                            e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                        }
                    }
                    if (await this.phone.get('isBanned') == true) {
                        if (e.player.clientSystemInfo.platformType == PlatformType.Mobile) {
                            e.player.runCommand(`kick "${e.player.name}" Your platform is banned from playing this server`)
                        }
                    }
                }
            }, 40)
        })
    }
    add(username) {
        if (this.db.findFirst({ username })) return false;
        this.db.insertDocument({
            type: 'WHITELIST',
            username
        })
        return true;
    }
    remove(id) {
        return this.db.deleteDocumentByID(id);
    }
}

export default new PlatformSettings();