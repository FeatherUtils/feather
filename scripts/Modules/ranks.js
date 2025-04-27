import { prismarineDb } from "../Libraries/prismarinedb";
import { system } from "@minecraft/server";

class Ranks {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('ranks')
        })
    }
    add(name, tag, cc, nc, bc) {
        if(this.db.findFirst({tag})) return false;
        let id = this.db.insertDocument({
            name,
            tag,
            cc,
            nc,
            bc
        })
        return id;
    }
    edit(id,name,cc,nc,bc) {
        let r = this.db.getByID(id)
        if(!r) return false;
        let d = r.data
        d.name = name
        d.cc = cc
        d.nc = nc
        d.bc = bc
        return this.db.overwriteDataByID(r.id, d)
    }
    remove(id) {
        return this.db.deleteDocumentByID(id)
    }
    getAll() {
        return this.db.findDocuments()
    }
    getRanks(player) {
        let ranks = [];
        for (const r of this.db.findDocuments()) {
            if (player.hasTag(r.data.tag)) {
                ranks.push(r.data);
            }
        }
        if (ranks.length === 0) {
            ranks.push({
                name: `§bMember`,
                cc: `§7`,
                bc: `§8`,
                nc: `§7`
            });
        }
        return ranks;
    }
    
}

export default new Ranks();