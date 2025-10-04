import { prismarineDb } from "../Libraries/prismarinedb";
import { system } from "@minecraft/server";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class Shop {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.customStorage('Shop', SegmentedStoragePrismarine)
        })
    }
    addCategory(name, description, currency, symbol) {
        let cat = this.db.insertDocument({
            type: 'CATEGORY',
            name,
            description,
            currency,
            symbol,
            items: []
        })
        return cat;
    }
    del(id) {
        return this.db.deleteDocumentByID(id)
    }
    delItem(id) {
        for (const doc of this.db.findDocuments({ type: "CATEGORY" })) {
            let itm = doc.data.items.findIndex(_ => _.id === id)
            if (itm) {
                doc.data.items.splice(itm, 1)
                this.db.overwriteDataByID(doc.id, doc.data)
                return true;
            }
        }
        return false;
    }
    addItem(itemstack, catid, price, displayName) {
        let cat = this.db.getByID(catid)
        if (!cat) return false;
        cat.data.items.push({ itemstack, price, displayName, id: Date.now(), catid })
    }
    getItem(id) {
        for(const doc of this.db.findDocuments({type:'CATEGORY'})) {
            let itm = doc.data.items.find(_ => _.id === id)
            if(!itm) continue;
            return itm;
        }
        return false
    }
    getItems(catid) {
        let cat = this.db.getByID(catid)
        if(!cat) return false;
        return cat.data.items;
    }
    editItem(id, price, displayName) {
        for (const doc of this.db.findDocuments({ type: 'CATEGORY' })) {
            let itm = doc.data.items.find(_ => _.id === id)
            if (!itm) continue;
            itm.price = price
            itm.displayName = displayName
            return this.db.overwriteDataByID(doc.id, doc.data);
        }
        return false;
    }
    editCategory(id, name, description, currency, symbol) {
        let cat = this.db.getByID(id)
        if (!cat) return false;
        cat.data.name = name
        cat.data.description = description
        cat.data.currency = currency
        cat.data.symbol = symbol
        this.db.overwriteDataByID(id, cat.data)
        return true;
    }
    buy(player,id) {
        let item = this.getItem(id)
        if(!item) return false;
        let cat = this.db.getByID(item.catid)
        if(!cat) return false;
        let crnc = prismarineDb.economy.getCurrency(cat.data.currency)
        if(!crnc) return false;
        if(prismarineDb.economy.getMoney(player,crnc.scoreboard) < item.price) return false;
        let inv = player.inventory;
        inv.addItem(item.itemstack)
        prismarineDb.economy.removeMoney(player,item.price,crnc.scoreboard);
        player.dimension.playSound('random.orb', player.location)
        return true;
    }
}

export default new Shop();