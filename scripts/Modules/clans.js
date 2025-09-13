import { prismarineDb } from "../Libraries/prismarinedb";
import { system, world } from '@minecraft/server'
import playerStorage from "../Libraries/playerStorage";

async function timer(plr, sec, msg) {
  for (let i = sec; i > 0; i--) {
    plr.sendMessage(`${msg.replace('[s]', i)}`);
    await system.waitTicks(20);
  }
}

class Clans {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.table('Clans')

            this.settingsKV = await this.db.keyval('settings')
            if (!this.settingsKV.get(`currencyScoreboard`)) this.settingsKV.set(`currencyScoreboard`, 'money')
            this.inviteDB = prismarineDb.table('Clans:Invites')
        })
    }
    addClan(owner, name, isPublic) {
        let ownerID = owner.id
        if (!ownerID) return false;
        let c = this.db.findFirst({ ownerID })
        if (c) return false;
        let id = this.db.insertDocument({
            name,
            members: [{ id: ownerID, role: 3 }],
            ownerID,
            bank: {
                allowedToWithdraw: [ownerID],
                amount: 0,
                depositHistory: [{ name: 'Starting Funds', amount: 0, author: ownerID }],
                withdrawHistory: []
            },
            settings: {
                isPublic,
                publicApproval: true
            },
            bans: []
        })
        return id;
    }
    delBase(id) {
        let clan = this.get(id)
        if (!clan) return false;
        clan.data.base = null;
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    setBase(player) {
        let clan = this.getFromPlayerID(player.id)
        if (!clan) return false;
        clan.data.base = { x: player.location.x, y: player.location.y, z: player.location.z, dimension: player.dimension.id }
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    async teleportToBase(player) {
        let clan = this.getFromPlayerID(player.id)
        if(!clan) return false;
        if(!clan.data.base) return false;
        timer(player, 5, 'Teleporting to clan base in [s]..').then(() => {
            let dimension = world.getDimension(`${clan.data.base.dimension}`)
            player.teleport({x:clan.data.base.x,y:clan.data.base.y,z:clan.data.base.z}, {dimension})
            player.success('Teleported to clan base!')
        })
    }
    acceptInv(id) {
        let inv = this.inviteDB.getByID(id)
        if (!inv) return false;
        if (inv.data.type != 'Invite') return false;
        let clan = this.get(inv.data.clanID);
        if (!clan) return false;
        clan.data.members.push({ id: inv.data.plrID, role: 1 });
        this.db.overwriteDataByID(clan.id, clan.data)
        this.clearinvsandreqs(inv.data.plrID)
        return true;
    }
    decline(id) {
        return this.inviteDB.deleteDocumentByID(id)
    }
    acceptReq(id) {
        let inv = this.inviteDB.getByID(id)
        if (!inv) return false;
        if (inv.data.type != 'Request') return false;
        let clan = this.get(inv.data.clanID);
        if (!clan) return false;
        clan.data.members.push({ id: inv.data.plrID, role: 1 })
        this.db.overwriteDataByID(clan.id, clan.data)
        this.clearinvsandreqs(inv.data.plrID)
        return true;
    }
    clearinvsandreqs(plrID) {
        let invs = this.inviteDB.findDocuments({ plrID })
        for (const inv of invs) {
            this.inviteDB.deleteDocumentByID(inv.id)
        }
        return true;
    }
    invite(clanID, targetID) {
        let clan = this.get(clanID);
        if (!clan) return false;
        this.inviteDB.insertDocument({
            plrID: targetID,
            clanID,
            type: 'Invite'
        })
        return true;
    }
    request(clanID, plrID) {
        let clan = this.get(clanID)
        if (!clan) return false;
        if (clan.data.settings.publicApproval) {
            let inv = this.inviteDB.findFirst({ plrID, type: 'Request' })
            if (inv) this.inviteDB.deleteDocumentByID(inv.id);
            this.inviteDB.insertDocument({
                plrID,
                clanID,
                type: 'Request'
            })
            return true;
        }
        clan.data.members.push({ id: plrID, role: 1 })
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    kick(plrID) {
        let clan = this.getFromPlayerID(plrID)
        if (!clan) return false;
        if (plrID === clan.data.ownerID) return false;
        let index = clan.data.members.findIndex(_ => _.id === plrID)
        if (index < 0) return false;
        clan.data.members.splice(index, 1)
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    unban(clanId, ban) {
        let clan = this.get(clanId)
        let b = clan.data.bans.findIndex(_ => _ === ban)
        clan.data.bans.splice(b, 1)
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    ban(plrID) {
        let clan = this.getFromPlayerID(plrID)
        if (!clan) return false;
        if (plrID === clan.data.ownerID) return false;
        clan.data.bans.push(plrID)
        let index = clan.data.members.findIndex(_ => _.id === plrID)
        if (index < 0) return false;
        clan.data.members.splice(index, 1)
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    withdrawFromBank(plrID, amount) {
        let clan = this.getFromPlayerID(plrID);
        let scoreboard = this.settingsKV.get(`currencyScoreboard`)
        if (!clan) return false;
        let plr2 = playerStorage.getPlayerByID(plrID)
        let player = world.getPlayers().find(_ => _.name === plr2.name)
        if (clan.data.bank.amount < amount) return;
        world.scoreboard.getObjective(scoreboard).addScore(player, amount)
        clan.data.bank.amount -= amount
        clan.data.bank.withdrawHistory.push({ name: 'Withdrawal', amount, author: plrID })
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    depositIntoBank(plrID, amount) {
        let clan = this.getFromPlayerID(plrID);
        let scoreboard = this.settingsKV.get(`currencyScoreboard`)
        if (!clan) return false;
        let plr2 = playerStorage.getPlayerByID(plrID)
        let player = world.getPlayers().find(_ => _.name === plr2.name)
        if (world.scoreboard.getObjective(scoreboard).getScore(player) < amount) return false;
        world.scoreboard.getObjective(scoreboard).setScore(player, world.scoreboard.getObjective(scoreboard).getScore(player) - amount)
        clan.data.bank.amount += amount
        clan.data.bank.depositHistory.push({ name: 'Deposit', amount, author: plrID })
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    delClan(id) {
        return this.db.deleteDocumentByID(id);
    }
    updateRole(plrID, role) {
        let clan = this.getFromPlayerID(plrID)
        if (!clan) return false;
        if (role > 2) return false;
        let member = clan.data.members.find(_ => _.id === plrID)
        member.role = role
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    transferOwnership(oldOwnerID, newOwnerID) {
        let clan = this.getFromPlayerID(oldOwnerID)
        clan.data.ownerID = newOwnerID
        let newOwner = clan.data.members.find(_ => _.id === newOwnerID)
        newOwner.role = 3
        let oldOwner = clan.data.members.find(_ => _.id === oldOwnerID)
        oldOwner.role = 1
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
    getFromPlayerID(plrID) {
        let clana = null;
        for (const clan of this.db.findDocuments()) {
            if (!clan.data.name) continue;
            if (clan.data.members.find(_ => _.id === plrID)) clana = clan;
        }
        return clana;
    }
    get(id) {
        return this.db.getByID(id)
    }
    removeAllowedWithdrawer(id, plrID) {
        let clan = this.get(id)
        if (!clan) return false;
        if (plrID === clan.data.ownerID) return false;
        let check1 = clan.data.bank.allowedToWithdraw.find(_ => _ === plrID)
        if (!check1) return false;
        let check2 = clan.data.members.find(_ => _.id === plrID)
        if (!check2) return false;
        let index = clan.data.bank.allowedToWithdraw.findIndex(_ => _ === plrID);
        if (index < 0) return false;
        clan.data.bank.allowedToWithdraw.splice(index, 1)
        this.db.overwriteDataByID(id, clan.data)
        return true;
    }
    addAllowedWithdrawer(id, plrID) {
        let clan = this.get(id);
        if (!clan) return false;
        let check1 = clan.data.bank.allowedToWithdraw.find(_ => _ === plrID)
        if (check1) return false;
        let check2 = clan.data.members.find(_ => _.id === plrID)
        if (!check2) return false;
        clan.data.bank.allowedToWithdraw.push(plrID)
        this.db.overwriteDataByID(id, clan.data)
        return true;
    }
    editSettings(id, isPublic, publicApproval) {
        let clan = this.get(id)
        if (!clan) return false;
        clan.data.settings.isPublic = isPublic
        clan.data.settings.publicApproval = publicApproval
        this.db.overwriteDataByID(id, clan.data)
        return true;
    }
    leave(playerID) {
        let clan = this.getFromPlayerID(playerID)
        if (!clan) return false;
        let index = clan.data.members.findIndex(_ => _.id === playerID)
        if (playerID === clan.data.ownerID) return this.delClan(clan.id);
        if (index < 0) return false;
        clan.data.members.splice(index, 1)
        this.db.overwriteDataByID(clan.id, clan.data)
        return true;
    }
}

export default new Clans;