import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import modules from "./modules";

async function timer(plr, sec, msg) {
  for (let i = sec; i > 0; i--) {
    plr.sendMessage(`${msg.replace('[s]', i)}`);
    await system.waitTicks(20);
  }
}

class Warps {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('Warps')
        })
    }
    add(name, pos, dim) {
        if(this.db.findFirst({name})) return false;
        this.db.insertDocument({
            name,
            loc: {coords: pos, dim}
        })
        return true;
    }
    del(id) {
        this.db.deleteDocumentByID(id)
    }
    async tp(plr,id) {
        let doc = this.db.getByID(id)
        if(!doc) return plr.sendMessage('Could not find warp');
        await timer(plr,modules.get('warptime') ?? 5,'Teleporting in [s]..')
        let dim = world.getDimension(`${doc.data.loc.dim}`)
        plr.teleport(doc.data.loc.coords, {dimension: dim})
        plr.success('Teleported successfully')
    }
}

export default new Warps;