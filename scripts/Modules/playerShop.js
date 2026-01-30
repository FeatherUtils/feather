import { prismarineDb } from "../Libraries/prismarinedb";
import { ItemComponentMineBlockEvent, system, world } from "@minecraft/server"
import itemDb from "./itemDb";
function abbreviateNumber(number, decPlaces) {
    const suffixes = ["k", "m", "b", "t"];
    const decScale = Math.pow(10, decPlaces);

    for (let i = suffixes.length - 1; i >= 0; i--) {
        const size = Math.pow(10, (i + 1) * 3);
        if (size <= number) {
            number = Math.round((number * decScale) / size) / decScale;
            if (number === 1000 && i < suffixes.length - 1) {
                number = 1;
                i++;
            }
            number += suffixes[i];
            break;
        }
    }
    return number;
}

class PlayerShop {
    constructor() {
        system.run(async () => {
            this.Database = prismarineDb.table('PlayerShop')
            this.kv = await this.Database.keyval('PlayerShop')
            await system.waitTicks(1)
            if (!this.kv.get('maxShops')) this.kv.set('maxShops', 2)
            if (!this.kv.get('QueuedMoney')) this.kv.set('QueuedMoney', [])
            this.checkForPlayersAndRewardQueuedMoney()
        })
    }
    checkForPlayersAndRewardQueuedMoney() {
        system.runInterval(() => {
            for (const player of world.getPlayers()) {
                if (!player.isValid) continue;
                let qm = this.kv.get('QueuedMoney')
                let data = qm.find((_) => _.id == player.id)
                if (!data) continue;
                for (const entry of data.currencies) {
                    prismarineDb.economy.addMoney(player, entry.amount, entry.currency)
                    let curr = prismarineDb.economy.getCurrency(entry.currency)
                    player.info('You were awarded ' + abbreviateNumber(+entry.amount, 2) + ' ' + curr.displayName + ' for selling things in your Player Shop(s)')
                }
                let data2 = qm.findIndex((_) => _.id == player.id)
                qm.splice(data2, 1)
                this.kv.set('QueuedMoney', qm)
            }
        }, 2)
    }
    createShop(name, description, icon, owner, currency) {
        if (this.Database.findDocuments({ owner: owner.id }).length >= this.kv.get('maxShops')) return owner.error('You have reached the maximum amount of shops allowed to be created under one person! Consider using one of your existing shops or deleting them')
        this.Database.insertDocument({
            name,
            description,
            icon,
            owner: owner.id,
            items: [],
            type: 'PLAYER_SHOP',
            currency
        })
        return true;
    }
    deleteShop(id) {
        let shop = this.Database.getByID(id)
        if (!shop) throw new Error('no shop found')
        this.Database.deleteDocumentByID(id)
    }
    editShop(id, name, description, icon, currency) {
        let shop = this.Database.getByID(id)
        if (!shop) throw new Error('no shop found')
        shop.data.name = name
        shop.data.description = description
        shop.data.icon = icon
        shop.data.currency = currency
        this.Database.overwriteDataByID(id, shop.data)
        return true;
    }
    getShops(filter = 'lastupdated') {
        if (filter == 'lastupdated') {
            let shops = this.Database.findDocuments({ type: 'PLAYER_SHOP' })
            let sorted = shops.sort((a, b) => b.updatedAt - a.updatedAt)
            shops.slice(30)
            if (!sorted) return []
            return sorted;
        }
    }
    addItem(shopId, itemStack, price) {
        let shop = this.Database.getByID(shopId)
        if (!shop) throw new Error('no shop found')
        if (!itemStack) throw new Error('No itemstack given')
        let [stash, slot] = itemDb.saveItem(itemStack);
        shop.data.items.push({ stash, slot, name: itemStack.nameTag ?? itemStack.typeId, description: itemStack.typeId, id: Date.now(), price })
        this.Database.overwriteDataByID(shopId, shop.data)
        return true;
    }
    editItem(shopId, itemId, name, description, icon) {
        let shop = this.Database.getByID(shopId)
        if (!shop) throw new Error('no shop found')
        let item = shop.data.items.find((_) => _.id === itemId)
        if (!item) throw new Error('No item found')
        item.name = name
        item.description = description
        item.icon = icon
        this.Database.overwriteDataByID(shopId, shop.data)
        return true;
    }
    removeItem(shopId, itemId, player) {
        let shop = this.Database.getByID(shopId)
        if (!shop) throw new Error('no shop found')
        let item = shop.data.items.find((_) => _.id === itemId)
        let inv = player.getComponent('inventory')
        let inventory = inv.container
        let itemStack = itemDb.getItem(item.stash, item.slot);
        if (!itemStack) return player.error('An error occured with ItemDB. Sowwy. Item was not removed.');
        inventory.addItem(itemStack)
        let item2 = shop.data.items.findIndex((_) => _.id == item.id)
        itemDb.deleteItem(item.stash)
        shop.data.items.splice(item2, 1)
        this.Database.overwriteDataByID(shopId, shop.data)
    }
    searchShops(query,maxDocs) {
        let documents = this.Database.findDocuments({type:'PLAYER_SHOP'})
        let shops = []
        for (const doc of documents) {
            if (doc.data.name.toLowerCase().includes(query.toLowerCase())) {
                shops.push(doc)
            } else if (doc.data.description.toLowerCase().includes(query.toLowerCase())) shops.push(doc)
        }
        shops.splice(maxDocs)
        return shops
    }
    buyItem(shopId, itemId, player) {
        let shop = this.Database.getByID(shopId)
        if (!shop) throw new Error('no shop found')
        let item = shop.data.items.find((_) => _.id === itemId)
        if (!item) throw new Error('No item found')
        let inv = player.getComponent('inventory')
        let inventory = inv.container
        if (item.price > prismarineDb.economy.getMoney(player, shop.data.currency)) return player.error('Not enough funds');
        let itemStack = itemDb.getItem(item.stash, item.slot);
        if (!itemStack) return player.error('An error occured with ItemDB. Sowwy. No funds were taken');
        prismarineDb.economy.removeMoney(player, item.price, shop.data.currency)
        inventory.addItem(itemStack)
        let item2 = shop.data.items.findIndex((_) => _.id == item.id)
        shop.data.items.splice(item2, 1)
        this.queueMoney(shop.data.owner, item.price, shop.data.currency)
        this.Database.overwriteDataByID(shopId, shop.data)
        return player.success('Bought item');
    }
    queueMoney(playerID, amount, currency) {
        let qm = this.kv.get('QueuedMoney')
        let data = qm.find((_) => _.id === playerID);
        if (data) {
            let c = data.currencies.find((_) => _.currency === currency)
            if (!c) data.currencies.push({ amount, currency })
            if (c) c.amount = c.amount + amount
            this.kv.set('QueuedMoney', qm)
        } else {
            qm.push({ id: playerID, currencies: [{ amount, currency }] })
            this.kv.set('QueuedMoney', qm)
        }
    }
}
export default new PlayerShop