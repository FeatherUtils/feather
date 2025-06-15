import { prismarineDb } from "../Libraries/prismarinedb";
import { system,world } from '@minecraft/server'
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
            if(!this.kv.get('maxHomes')) this.kv.set('maxHomes', 20)
        })
    }
    create(plr,name) {
        if(this.db.findDocuments({plrid:playerStorage.getID(plr)} + 1 >= this.kv.get('maxHomes'))) return false;
        if(this.db.findFirst({plrid:playerStorage.getID(plr),name})) return false;
        this.db.insertDocument({
            plrid: playerStorage.getID(plr),
            name,
            loc: {pos: plr.location, dim: plr.dimension.id},
            shares: []
        })
        return true;
    }
    editName(id,name) {
        if(this.db.findFirst({plrid:playerStorage.getID(plr),name})) return false;
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
        return this.db.findDocuments({plrid: playerStorage.getID(plr)});
    }
    getSharedFromPlayer(plr) {
        let homes = [];
        let allhomes = this.db.findDocuments();
        for(const home of allhomes) {
            if(home.data.shares.find(_=>_===playerStorage.getID(plr))) {
                home.data.shared = true
                homes.push(home)
            }
            continue;
        }
        return homes;
    }
    share(id,target) {
        let home = this.db.getByID(id)
        home.data.shares.push(playerStorage.getID(target))
        this.db.overwriteDataByID(id, home.data)
        return true;
    }
    removeShare(id,targetID) {
        let home = this.db.getByID(id)
        let index = home.data.shares.findIndex(_=>_===targetID)
        if(index < 0) return false;
        home.data.shares.splice(index, 1)
        this.db.overwriteDataByID(id, home.data)
        return true;
    }
}

export default new Homes();