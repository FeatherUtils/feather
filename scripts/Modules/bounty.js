import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
import playerStorage from "../Libraries/playerStorage";
import { FormCancelationReason } from "@minecraft/server-ui";

class Bounty {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.customStorage('+FTR:BOUNTY', SegmentedStoragePrismarine)
            world.afterEvents.entityDie.subscribe((e) => {
                if(e.damageSource.damagingEntity.typeId !== 'minecraft:player') return;
                if(e.deadEntity.typeId !== 'minecraft:player') return;
                let ok = false
                for (const entry of this.calculateBounty(e.deadEntity.id)) {
                    ok = true
                    prismarineDb.economy.addMoney(e.damageSource.damagingEntity, entry.amount, entry.currency)
                }
                for (const f of this.db.findDocuments({type:"BOUNTY",targetID:e.deadEntity.id})) {
                    this.db.deleteDocumentByID(f.id)
                }
                if(ok == true) this.notify(`${e.damageSource.damagingEntity.name} just killed ${e.deadEntity.name} and got all their bounty!`)
            })
        })
    }
    notify(msg) {
        world.sendMessage(`§aBOUNTY §8>> §7${msg}`)
    }
    createBounty(plr, amount, targetID, currency) {
        let target = playerStorage.getPlayerByID(targetID)
        let crnc = prismarineDb.economy.getCurrency(currency)
        if (!crnc) return;
        if (!target) return;
        if (prismarineDb.economy.getMoney(plr, currency) < amount) return plr.error(`You don't have enough money`);
        prismarineDb.economy.removeMoney(plr, amount, currency)
        let bnty = this.db.insertDocument({
            targetID,
            plrID: plr.id,
            amount,
            currency,
            type: 'BOUNTY'
        })
        plr.success('You can not withdraw a bounty 5 minutes after it is made, so if you change your mind withdraw it asap.')
        this.notify(`A ${amount} ${crnc.displayName} bounty was placed on ${target.name} by ${plr.name}!`)
        return bnty;
    }
    withdrawBounty(id) {
        let bnty = this.db.getByID(id)
        if (!bnty) return false;
        let crnc = prismarineDb.economy.getCurrency(bnty.data.currency)
        let plrs = world.getPlayers()
        let plr = plrs.find(_ => _.id === bnty.data.plrID)
        if (!plr) return;
        let fivemins = 5 * 60 * 1000
        let expiredTime = bnty.createdAt + fivemins
        if (bnty.createdAt > expiredTime) return plr.error('You can not withdraw a bounty 5 minutes after it was made');
        prismarineDb.economy.addMoney(plr, bnty.data.amount, bnty.data.currency);
        plr.success('Bounty successfully withdrew')
        this.notify(`The ${bnty.data.amount} ${crnc.displayName} bounty on ${playerStorage.getPlayerByID(bnty.data.targetID).name} was withdrew!`)
        this.db.deleteDocumentByID(bnty.id)
        return true;
    }
    calculateBounty(plrid) {
        const docs = this.db.findDocuments({ type: 'BOUNTY', targetID: plrid });
        if (!docs || docs.length === 0) return [];

        const totals = {};

        for (const doc of docs) {
            const currency = doc.data.currency || 'Unknown';
            const amount = doc.data.amount || 0;
            if (!totals[currency]) totals[currency] = 0;
            totals[currency] += amount;
        }

        return Object.entries(totals).map(([currency, amount]) => ({
            currency,
            amount
        }));
    }

    getTopBounties() {
        const docs = this.db.findDocuments({ type: 'BOUNTY' });
        if (!docs || docs.length === 0) return [];

        const uniquePlayerIDs = [...new Set(docs.map(doc => doc.data.targetID))];

        const leaderboard = uniquePlayerIDs.map(playerID => {
            const playerDocs = docs.filter(doc => doc.data.targetID === playerID);

            const currencyTotals = {};
            for (const doc of playerDocs) {
                const { amount, currency } = doc.data;
                if (!currencyTotals[currency]) currencyTotals[currency] = 0;
                currencyTotals[currency] += amount;
            }

            const currencyArray = Object.entries(currencyTotals).map(
                ([currency, amount]) => `${amount} ${currency}`
            );

            const totalAmount = Object.values(currencyTotals).reduce((a, b) => a + b, 0);

            const player = playerStorage.getPlayerByID(playerID);
            const name = player ? player.name : 'Unknown';

            return { playerID, name, totalAmount, currencies: currencyArray };
        });

        leaderboard.sort((a, b) => b.totalAmount - a.totalAmount);

        return leaderboard.slice(0, 25);
    }


}

export default new Bounty;