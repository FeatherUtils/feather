import { prismarineDb } from "../Libraries/prismarinedb";
import { system, world } from '@minecraft/server'
import playerStorage from '../Libraries/playerStorage'

async function timer(plr, sec, msg) {
    for (let i = sec; i > 0; i--) {
        plr.sendMessage(`${msg.replace('[s]', i)}`);
        await system.waitTicks(20);
    }
}

class Homes {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.table('Homes')
            this.kv = await this.db.keyval('Settings')
            if (!this.kv.get('maxHomes')) this.kv.set('maxHomes', 20)
        })
    }
    create(plr, name) {
        if (this.db.findFirst({ plrid: plr.id, name })) return plr.error('You have hit the maximum amount of homes. Consider deleting a home.');
        this.db.insertDocument({
            plrid: plr.id,
            name,
            loc: { pos: plr.location, dim: plr.dimension.id },
            shares: []
        })
        return true;
    }
    editName(plr, id, name) {
        if (this.db.findFirst({ plrid: plr.id, name })) return false;
        let home = this.db.getByID(id)
        home.data.name = name
        this.db.overwriteDataByID(id, home.data)
        return true;
    }
    del(id) {
        this.db.deleteDocumentByID(id)
        return true;
    }
    getFromPlayer(plr) {
        return this.db.findDocuments({ plrid: plr.id });
    }
    getSharedFromPlayer(plr) {
        let homes = [];
        let allhomes = this.db.findDocuments();
        for (const home of allhomes) {
            if(!home.data.shares) continue;
            if (home.data.shares.find(_ => _ === plr.id)) {
                home.data.shared = true
                homes.push(home)
            }
            continue;
        }
        return homes;
    }
    share(id, target) {
        let home = this.db.getByID(id)
        home.data.shares.push(target.id)
        this.db.overwriteDataByID(id, home.data)
        return true;
    }
    removeShare(id, targetID) {
        let home = this.db.getByID(id)
        let index = home.data.shares.findIndex(_ => _ === targetID)
        if (index < 0) return false;
        home.data.shares.splice(index, 1)
        this.db.overwriteDataByID(id, home.data)
        return true;
    }
    async tp(plr, id) {
        let doc = this.db.getByID(id)
        if (!doc) return plr.sendMessage('Could not find home');
        await timer(plr, 5, 'Teleporting in [s]..')
        let dim = world.getDimension(`${doc.data.loc.dim}`)
        plr.teleport(doc.data.loc.pos, { dimension: dim })
    }
}

export default new Homes();