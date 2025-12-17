import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import playerStorage from "../Libraries/playerStorage";
import moment from '../Libraries/moment'
class Moderation {
    constructor() {
        system.run(() => {
            this.Database = prismarineDb.table('ModerationDB')
            this.checkAll()
        })
    }
    checkAll() {
        system.runInterval(() => {
            for (const mute of this.Database.findDocuments({ type: 'MUTE' })) {
                if (!mute.data.time) continue;
                if (Date.now() > mute.data.time) {
                    for (const player of world.getPlayers()) {
                        if (playerStorage.getID(player) === mute.data.player) player.sendMessage(`§aMute expired! §bYou can now talk`)
                    }
                    this.Database.deleteDocumentByID(mute.id)
                    continue;
                }
            }
            for (const ban of this.Database.findDocuments({ type: 'BAN' })) {
                if (!ban.data.time) continue;
                if (Date.now() > ban.data.time) {
                    for (const player of world.getPlayers()) {
                        if (player.hasTag('admin')) player.sendMessage(`§a${playerStorage.getPlayerByID(ban.data.player).name}'s ban has expired`)
                    }
                    this.delete(ban.id)
                    continue;
                } else {
                    for (const player of world.getPlayers()) {
                        if (playerStorage.getID(player) === ban.data.player) player.runCommand(`kick ${player.name}\n§8[§bFeather Essentials§8] - §4You are banned!\n§cReason: ${ban.data.reason}\n§aExpires ${moment(ban.data.time).fromNow()}`)
                    }
                }
            }
        }, 20)

    }
    addMute(player, reason, time = undefined) {
        if (!player && typeof player != 'string') throw new Error('PlayerID not provided or is not a string!');
        let mute2 = this.Database.findFirst({ player, type: 'MUTE' })
        if (mute2) this.Database.deleteDocumentByID(mute2.id);
        if (!time) {
            let d = new Date()
            d.setHours(d.getHours() + 100000 * 24)
            time = d.getTime()
        }
        let mute = this.Database.insertDocument({
            player,
            reason,
            time,
            type: 'MUTE'
        })
        for (const plr of world.getPlayers()) {
            if (playerStorage.getID(plr) == player) {
                plr.sendMessage(`§cYou have been §4muted! §eReason: ${reason}. Expires ${time ? moment(time).fromNow() : 'in forever'}`)
            }
        }
        return mute;
    }
    addWarning(player, reason) {
        let warn = this.Database.insertDocument({
            player,
            reason,
            type: 'WARNING'
        })
        return warn;
    }
    delete(id) {
        return this.Database.deleteDocumentByID(id)
    }
    addBan(player, reason, time = undefined) {
        if (!player && typeof player != 'string') throw new Error('PlayerID not provided or is not a string!');
        let ban2 = this.Database.findFirst({ type: 'BAN', player })
        if (ban2) this.delete(ban2.id);
        if (!time) {
            let d = new Date()
            d.setHours(d.getHours() + 100000 * 24)
            time = d.getTime()
        }
        let ban = this.Database.insertDocument({
            player,
            reason,
            time,
            type: 'BAN'
        })
        return ban;
    }
}

export default new Moderation()