import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import modules from "./modules";
import { timer } from "./Utilities/timer";

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
    setLocation(id, pos, dim) {
        let loc = {coords: pos, dim}
        let doc = this.db.getByID(id)
        if(!doc) return false;
        doc.data.loc = loc
        this.db.overwriteDataByID(id, doc.data)
        return true;
    }
    del(id) {
        this.db.deleteDocumentByID(id)
    }
    setRequiredTag(id,requiredTag) {
        let doc = this.db.getByID(id);
        if(!doc) return false;
        doc.data.requiredTag = requiredTag
        this.db.overwriteDataByID(id, doc.data)
        return true;
    }
    async tp(plr,id) {
        let doc = this.db.getByID(id)
        if(!doc) return plr.sendMessage('Could not find warp');
        if(doc.data.requiredTag && !plr.hasTag(doc.data.requiredTag)) return plr.error('You do not have the required tag to teleport here!');
        await timer(plr,modules.get('warptime') ?? 5,'Teleporting in [s]..', () => {
            let dim = world.getDimension(`${doc.data.loc.dim}`)
            plr.teleport(doc.data.loc.coords, {dimension: dim})
            plr.success('Teleported successfully')
        })
    }
}

export default new Warps;