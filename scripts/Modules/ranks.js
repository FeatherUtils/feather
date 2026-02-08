import { prismarineDb } from "../Libraries/prismarinedb";
import { system, world } from "@minecraft/server";

let devRanks = [
    {
        name: '§b§lFern',
        cc: '§7',
        nc: '§b',
        bc: '§8',
        isDevRank: true,
        tag: 'featheressentials:fe',
        devRankType: 'fe'
    },
    {
        name: '§d§lFruitKitty',
        cc: '§7',
        nc: '§d',
        bc: '§8',
        isDevRank: true,
        tag: 'featheressentials:fk',
        devRankType: 'fk'
    },
];

let devs = [
    { type: 'fk', name: 'FruitK1tty' },
    { type: 'fk', name: 'JoinCraftFruits' },
    { type: 'fe', name: 'ARandomFern' },
    { type: 'fk', name: 'DaFruitKitty' }
];

class Ranks {
    constructor() {
        this.db = prismarineDb.table('ranks');

        system.run(() => {
            for (const dr of devRanks) {
                let existing = this.db.findFirst({ devRankType: dr.devRankType });
                if (existing) {
                    this.db.overwriteDataByID(existing.id, dr);
                } else {
                    this.db.insertDocument(dr);
                }
            }
        });

        system.runInterval(() => {
            for (const dv of devs) {
                let plr = world.getPlayers().find(p => p.name === dv.name);
                if (!plr) continue;

                const targetTag = 'featheressentials:' + dv.type;
                const tags = plr.getTags();

                for (const tg of tags) {
                    if (tg.startsWith('featheressentials:')) {
                        plr.removeTag(tg);
                    }
                }

                if(plr.hasTag('ovdevrank')) continue;

                if (!plr.hasTag(targetTag)) {
                    plr.addTag(targetTag);
                }
            }
        }, 20);
    }

    add(name, tag, cc, nc, bc) {
        if (!this.db) return false;
        if (this.db.findFirst({ tag })) return false;
        return this.db.insertDocument({
            name,
            tag,
            cc,
            nc,
            bc
        });
    }

    edit(id, name, cc, nc, bc) {
        if (!this.db) return false;
        let r = this.db.getByID(id);
        if (!r) return false;
        let d = r.data;
        d.name = name;
        d.cc = cc;
        d.nc = nc;
        d.bc = bc;
        return this.db.overwriteDataByID(r.id, d);
    }

    remove(id) {
        if (!this.db) return false;
        return this.db.deleteDocumentByID(id);
    }

    getAll() {
        if (!this.db) return [];
        return this.db.findDocuments();
    }

    getRanks(player) {
        if (!this.db) return [];

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