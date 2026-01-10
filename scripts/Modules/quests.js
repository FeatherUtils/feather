import { prismarineDb } from "../Libraries/prismarinedb";
import { system, world } from '@minecraft/server'
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
import icons from "./icons";

let CurrentQuestDataExample = {
    questID: '123198371283786',
    objectives: [{ name: 'quartz', blocksToMine: 5000, blockTypeID: 'minecraft:quartz_ore', type: 'BLOCK', progress: 126 }]
}

class Quests {
    constructor() {
        system.run(() => {
            this.Database = prismarineDb.customStorage('FTR:Quests', SegmentedStoragePrismarine)
            this.PlayerDatabase = prismarineDb.customStorage('FTR:Quests_PlayerDB', SegmentedStoragePrismarine)
        })
    }
    create(name, description, requiredTag) {
        this.Database.insertDocument({
            name,
            description,
            requiredTag,
            objectives: [],
            actions: [],
            icon: 'vanilla/book'
        })
        return true;
    }
    updatePlayer(id) {
        let player = world.getPlayers().find(_ => _.id == id)
        if (!player) return false;
        if (!this.PlayerDatabase.findFirst({ id })) {
            this.PlayerDatabase.insertDocument({
                currentQuest: {},
                id,
            })
        } else {
            let plr = this.PlayerDatabase.findFirst({ id });
            if (!plr) return false;
            if (!plr.data.currentQuest) return true;
            return true;
        }
        return { currentQuest: {}, id };
    }
    getPlayerDBEntry(id) {
        let playerDbEntry = this.PlayerDatabase.findFirst({ id })
        if (!playerDbEntry) return this.updatePlayer(id);
        return playerDbEntry;
    }
    setIcon(id, icon) {
        let q = this.Database.getByID(id)
        if (!q) throw new Error('QuestsError: Quest not found from ID. Report this bug if it came up without using /scriptevent or /opengui');
        if (!icons.resolve(icon)) throw new Error('Icon ID is not valid. If you got this using Icon Viewer, send a bug report :)');
        q.data.icon = icon
        this.Database.overwriteDataByID(id, q.data)
        return true;
    }
    getPlayerQuest(player) {
        let plr = this.getPlayerDBEntry(player)
        if (!plr) return false;
        if (!plr.data.currentQuest) return false;
        let cqid = plr.data.currentQuest.questID
        let q = this.Database.getByID(cqid)
        if (!q) return false;
        return q;
    }
    edit(id, name, description, requiredTag) {
        let q = this.Database.getByID(id)
        if (!q) throw new Error('QuestsError: Quest not found from ID. Report this bug if it came up without using /scriptevent or /opengui');
        q.data.name = name
        q.data.description = description
        q.data.requiredTag = requiredTag
        this.Database.overwriteDataByID(q.id, q.data)
        return true;
    }
    addObjective(id, title, type, finishAmount) {
        let q = this.Database.getByID(id)
        if (!q) throw new Error('Invalid ID')
        q.data.objectives.push({ id: Date.now(), title, type, finishAmount })
        this.Database.overwriteDataByID(q.id, q.data)
        return true;
    }
    editObjective(id, objid, title, type, finishAmount) {
        let q = this.Database.getByID(id)
        if (!q) throw new Error('Invalid ID')
        let i = q.data.objectives.findIndex(_=>_.id===objid)
        if(!i) return false;
        let obj = q.data.objectives[i]
        obj.title = title
        obj.type = type
        obj.finishAmount = finishAmount
        this.Database.overwriteDataByID(q.id,q.data)
        return true;
    }
    deleteObjective(id,objid) {
        let q = this.Database.getByID(id)
        if(!q) throw new Error('Invalid quest id')
        let i = q.data.objectives.findIndex(_=>_.id===objid)
        if(!i) return false;
        q.data.objectives.splice(i,1)
        this.Database.overwriteDataByID(q.id,q.data)
        return true;
    }
    delete(id) {
        let q = this.Database.getByID(id)
        if (!q) throw new Error('Invalid ID')
        this.Database.deleteDocumentByID(id)
        return true;
    }
}

export default new Quests();