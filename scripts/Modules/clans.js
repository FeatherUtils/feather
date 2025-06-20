import { prismarineDb } from "../Libraries/prismarinedb";
import { system,world } from '@minecraft/server'
import playerStorage from "../Libraries/playerStorage";

class Clans {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('Clans')
            this.settingsKV = this.db.keyval('settings')
            if(!this.settingsKV.get(`currencyScoreboard`)) this.settingsKV.set(`currencyScoreboard`, 'money')
            this.inviteDB = prismarineDb.table('Clans:Invites')
        })
    }
    addClan(owner,name,isPublic) {
        let ownerID = playerStorage.getID(owner)
        if(!ownerID) return false;
        let c = this.db.findFirst({ownerID})
        if(c) return false;
        let id = this.db.insertDocument({
            name,
            members: [{ownerID,role:3}],
            ownerID,
            bank: {
                allowedToWithdraw: [ownerID],
                amount: 0,
                depositHistory: [{name:'Starting Funds',amount:0,author:ownerID}],
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
    depositIntoBank(plrID,amount) {
        let clan = this.getFromPlayerID(plrID);
        let scoreboard = this.settingsKV.get(`currencyScoreboard`)
        if(!clan) return false;
        let plr2 = playerStorage.getPlayerByID(plrID)
        let player = world.getPlayers().find(_=>_.name===plr2.name)
        if(prismarineDb.economy.getMoney(player,scoreboard) < amount) return false;
        prismarineDb.economy.removeMoney(player,amount,scoreboard)
        clan.data.bank.amount += amount
        clan.data.bank.depositHistory.push({name:'Deposit',amount,author:plrID})
        this.db.overwriteDataByID(clan.id,clan.data)
        return true;
    }
    delClan(id) {
        return this.db.deleteDocumentByID(id);
    }
    updateRole(plrID,role) {
        let clan = this.getFromPlayerID(plrID)
        if(!clan) return false;
        if(role > 2) return false;
        let member = clan.data.members.find(_=>_.id===plrID)
        member.role = role
        this.db.overwriteDataByID(clan.id,clan.data)
        return true;
    }
    getFromPlayerID(plrID) {
        let clana = null;
        for(const clan of this.db.findDocuments()) {
            if(clan.data.members.find(_=>_.id===plrID)) clana = clan;
        }
        return clana;
    }
    get(id) {
        return this.db.getByID(id)
    }
    removeAllowedWithdrawer(id,plrID) {
        let clan = this.get(id)
        if(!clan) return false;
        if(plrID===clan.data.ownerID) return false;
        let check1 = clan.data.bank.allowedToWithdraw.find(_=>_===plrID)
        if(!check1) return false;
        let check2 = clan.data.members.find(_=>_.id===plrID)
        if(!check2) return false;
        let index = clan.data.bank.allowedToWithdraw.findIndex(_=>_===plrID);
        if(index < 0) return false;
        clan.data.bank.allowedToWithdraw.splice(index, 1)
        this.db.overwriteDataByID(id,clan.data)
        return true;
    }
    addAllowedWithdrawer(id,plrID) {
        let clan = this.get(id);
        if(!clan) return false;
        let check1 = clan.data.bank.allowedToWithdraw.find(_=>_===plrID)
        if(check1) return false;
        let check2 = clan.data.members.find(_=>_.id===plrID)
        if(!check2) return false;
        clan.data.bank.allowedToWithdraw.push(plrID)
        this.db.overwriteDataByID(id,clan.data)
        return true;
    }
    editSettings(id,isPublic,roles,publicApproval) {
        let clan = this.get(id)
        if(!clan) return false;
        clan.data.settings.isPublic = isPublic
        clan.data.settings.roles = roles
        clan.data.settings.publicApproval = publicApproval
        this.db.overwriteDataByID(id,clan.data)
        return true;
    }
}

export default new Clans;