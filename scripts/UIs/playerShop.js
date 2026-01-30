import uiManager from "../Libraries/uiManager";
import { ActionForm } from "../Libraries/form_func";
import config from "../config";
import playerShop from "../Modules/playerShop";
import { consts } from '../cherryUIConsts'
import { ModalFormData } from "@minecraft/server-ui";
import { prismarineDb } from "../Libraries/prismarinedb";
import playerStorage from "../Libraries/playerStorage";
import icons from '../Modules/icons'
import itemDb from "../Modules/itemDb";
import { commands } from "../Modules/commands";
import modules from "../Modules/modules";
import { system } from "@minecraft/server";

uiManager.addUI(config.uinames.playerShop.root, 'playershop', (player, filter = 'lastupdated') => {
    let form = new ActionForm();
    form.title(`${consts.tag}Player Shop`)
    if (prismarineDb.permissions.hasPermission(player, 'playerShopAdmin')) {
        form.button(`§dSettings\n§7Configure player shop settings`, '.azalea/Settings', (player) => {
            let form2 = new ModalFormData();
            form2.title('Settings')
            form2.slider('Max shops', 1, 30, { defaultValue: playerShop.kv.get('maxShops') })
            form2.show(player).then((res) => {
                let [maxshop] = res.formValues;
                playerShop.kv.set('maxShops', maxshop)
                uiManager.open(player, config.uinames.playerShop.root)
                player.success('Updated configuration')
            })
        })
        form.divider()
    }
    form.button(`§aCreate\n§7Create a player shop`, '.azalea/1', (player) => {
        uiManager.open(player, config.uinames.playerShop.create)
    })
    form.button(`§6Search\n§7Open the Search Menu`, '.azalea/Look for UI', (player) => {
        uiManager.open(player, config.uinames.playerShop.search)
    })
    form.divider()
    let shops = playerShop.getShops(filter)
    for (const shop of shops ?? []) {
        let desc = `${shop.data.description} | ${playerStorage.getPlayerByID(shop.data.owner).name}`
        if (desc.length > 43) desc = `${playerStorage.getPlayerByID(shop.data.owner).name}`
        form.button(`§b${shop.data.name}\n§7${desc}`, shop.data.icon ? shop.data.icon : null, (player) => {
            uiManager.open(player, config.uinames.playerShop.view, shop.id)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.playerShop.search, 'searchplayershops', (player, query = undefined, maxDocs) => {
    if (!query) {
        let form = new ModalFormData();
        form.title('SearchQuery')
        form.textField('Search player shop', 'Example: Apple')
        form.slider('Max shops', 1, 45, { defaultValue: 30 })
        form.show(player).then((res) => {
            let [q2, max] = res.formValues;
            uiManager.open(player, config.uinames.playerShop.search, q2, max)
        })
    } else {
        let form = new ActionForm();
        form.title(consts.tag + 'Search results')
        form.body(query)
        let shops = playerShop.searchShops(query, maxDocs)
        for (const shop of shops ?? []) {
            let desc = `${shop.data.description} | ${playerStorage.getPlayerByID(shop.data.owner).name}`
            if (desc.length > 43) desc = `${playerStorage.getPlayerByID(shop.data.owner).name}`
            form.button(`§b${shop.data.name}\n§7${desc}`, shop.data.icon ? shop.data.icon : null, (player) => {
                uiManager.open(player, config.uinames.playerShop.view, shop.id)
            })
        }
        form.show(player)
    }
})

uiManager.addUI(config.uinames.playerShop.create, 'createplayershop', (player, error, name1, description1, currindex1) => {
    let form = new ModalFormData()
    let currencies = prismarineDb.economy.getCurrencies();
    let cnames = currencies.map(_ => _.displayName);
    form.title(`Create Shop`)
    if (error) { form.label(`§cError §8>> §c${error}`) } else { form.divider() }
    form.textField('Name', 'Name that will be searched and shown', { defaultValue: name1 ?? '' })
    form.textField('Description', 'Text that will be shown under the name', { defaultValue: description1 ?? '' })
    form.dropdown('Currency', cnames, { defaultValueIndex: currindex1 ?? 0 })
    form.show(player).then((res) => {
        let [e, name, description, currindex] = res.formValues;
        let curr = currencies[currindex]
        if (!curr) throw new Error('Currency not found')
        if (name.length > 30) return uiManager.open(player, config.uinames.playerShop.create, 'Name must be less than 30 characters', name, description, currindex)
        let s = playerShop.createShop(name, description, null, player, curr.scoreboard)
        if (s === true) return uiManager.open(player, config.uinames.playerShop.root), player.success('Created player shop: ' + name)

    })
})

uiManager.addUI(config.uinames.playerShop.edit, 'editplayershop', (player, id, error) => {
    let form = new ModalFormData()
    let currencies = prismarineDb.economy.getCurrencies();
    let cnames = currencies.map(_ => _.displayName);
    let shop = playerShop.Database.getByID(id)
    if (!shop) throw new Error('No shop found')
    form.title(`Edit Shop`)
    if (error) { form.label(`§cError §8>> §c${error}`) } else { form.divider() }
    form.textField('Name', 'Name that will be searched and shown', { defaultValue: shop.data.name })
    form.textField('Description', 'Text that will be shown under the name', { defaultValue: shop.data.description })
    form.dropdown('Currency', cnames, { defaultValueIndex: currencies.findIndex(_ => _.scoreboard === shop.data.currency) })
    form.show(player).then((res) => {
        let [e, name, description, currindex] = res.formValues;
        let curr = currencies[currindex]
        if (!curr) throw new Error('Currency not found')
        if (name.length > 30) return uiManager.open(player, config.uinames.playerShop.edit, id, 'Name must be less than 30 characters', name, description, currindex)
        let s = playerShop.editShop(id, name, description, shop.data.icon, curr.scoreboard)
        if (s === true) return uiManager.open(player, config.uinames.playerShop.view, id), player.success('Edited player shop: ' + name)
    })
})

uiManager.addUI(config.uinames.playerShop.addItem, 'additemplayershop', (player, id) => {
    let shop = playerShop.Database.getByID(id)
    if (!shop) return player.error('need a valid id')
    let form = new ActionForm()
    form.title(`${consts.tag}Select item`)
    form.button(`${consts.header}§bBack\n§7Back to player shop`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerShop.view, id)
    })
    let inv = player.getComponent('inventory')
    let inventory = inv.container
    let slots = []
    for (let i = 0; i < 36; i++) {
        slots.push(inventory.getSlot(i))
    }
    for (const slot of slots) {
        if (!slot.hasItem()) continue;
        form.button(`${slot.nameTag ?? slot.typeId}\n§7x${slot.amount}`, null, (player) => {
            let form2 = new ModalFormData();
            form2.title('Settings')
            form2.textField('Price', 'Set price for item')
            form2.show(player).then((res) => {
                let [price] = res.formValues;
                if (isNaN(+price)) return player.error('Price is not a number')
                playerShop.addItem(shop.id, slot.getItem(), +price)
                player.success('Added item!')
                slot.setItem()
                uiManager.open(player, config.uinames.playerShop.view, id)
            })
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.playerShop.editItem, 'edititemplayershop', (player, id, itemid) => {
    let shop = playerShop.Database.getByID(id)
    if (!shop) return player.error('Tried to open menu without a Shop ID. If you are using /opengui (or scriptevent feathergui), this UI is incompatible with these.')
    let item = shop.data.items.find((_) => _.id == itemid)
    if (!item) return player.error('No item found')
    let form = new ActionForm();
    form.title(`${consts.tag}${item.name}`);
    form.button(`§cBack\n§7Back to item menu`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerShop.viewItem, id, itemid)
    })
    form.divider()
    form.button(`§bIcon\n§7Edit the icon of this item`, item.icon ? item.icon : '.azalea/ClickyClick', (player) => {
        uiManager.open(player, config.uinames.basic.iconViewer, 0, (player, icon) => {
            playerShop.editItem(id, itemid, item.name, item.description, icons.resolve(icon))
            uiManager.open(player, config.uinames.playerShop.editItem, id, itemid)
        })
    })
    form.button(`§eEdit Values\n§7Edit the values of this item`, '.blossom/edit', (player) => {
        let form2 = new ModalFormData();
        form2.title(`Edit item values`)
        form2.textField('Name', 'Name of the item', { defaultValue: item.name })
        form2.textField('Description', 'Description of the item', { defaultValue: item.description })
        form2.show(player).then((res) => {
            let [name, description] = res.formValues
            playerShop.editItem(id, itemid, name, description, item.icon)
            uiManager.open(player, config.uinames.playerShop.editItem, id, itemid)
        })
    })
    form.show(player)
})

uiManager.addUI(config.uinames.playerShop.viewItem, 'viewitemplayershop', (player, id, itemid) => {
    let shop = playerShop.Database.getByID(id)
    if (!shop) return player.error('Tried to open menu without a Shop ID. If you are using /opengui (or scriptevent feathergui), this UI is incompatible with these.')
    let item = shop.data.items.find((_) => _.id == itemid)
    if (!item) return player.error('No item found')
    let form = new ActionForm();
    form.title(`${consts.tag}${item.name}`)
    form.button(`§cBack\n§7Go back to player shop`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerShop.view, id)
    })
    form.body(`Description: ${item.description}\nName: ${item.name}\nPrice: ${item.price} ${prismarineDb.economy.getCurrency(shop.data.currency).displayName}`)
    form.divider()
    if (shop.data.owner == player.id) {
        form.button(`§bEdit Item\n§7Edit this item's icon & values`, '.blossom/edit', (player) => {
            uiManager.open(player, config.uinames.playerShop.editItem, id, itemid)
        })
        form.button(`§4Remove Item\n§7Remove this item from the shop`, '.azalea/SidebarTrash', (player) => {
            playerShop.removeItem(id, itemid, player)
            uiManager.open(player, config.uinames.playerShop.viewItem, id, itemid)
        })
    }
    form.button(`§aBuy\n§7Buy this item (${item.price} ${prismarineDb.economy.getCurrency(shop.data.currency).displayName})`, '.vanilla/emerald', (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'Are you sure you want to buy this for ' + `${item.price} ${prismarineDb.economy.getCurrency(shop.data.currency).displayName}?`, (player) => {
            playerShop.buyItem(id, itemid, player), uiManager.open(player, config.uinames.playerShop.view, id)
        }, (player) => {
            uiManager.open(player, config.uinames.playerShop.viewItem, id, itemid)
        }
        )
    })
    form.show(player)
})

uiManager.addUI(config.uinames.playerShop.view, 'viewplayershop', (player, id) => {
    let shop = playerShop.Database.getByID(id)
    if (!shop) return player.error('Tried to open menu without a Shop ID. If you are using /opengui (or scriptevent feathergui), this UI is incompatible with these.')
    let form = new ActionForm()
    form.title(`${consts.tag}${shop.data.name}`)
    form.body(`Owner: ${playerStorage.getPlayerByID(shop.data.owner).name}\nDescription: ${shop.data.description}`)
    form.button(`§bBack\n§7Go back to menu`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerShop.root)
    })
    form.divider()
    if (prismarineDb.permissions.hasPermission(player, 'playerShopAdmin') || shop.data.owner == player.id) {
        if (shop.data.owner == player.id) {
            form.button(`§aAdd Item\n§7Add an item to the shop`, '.azalea/1', (player) => {
                uiManager.open(player, config.uinames.playerShop.addItem, id)
            })
        }
        form.button(`§eEdit Shop\n§7Edit shop icon & values`, '.blossom/edit', (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}Edit shop`)
            form2.button('§eEdit Values', '.blossom/edit', (player) => {
                uiManager.open(player, config.uinames.playerShop.edit, id)
            })
            form2.button(`§bEdit Icon`, shop.data.icon ?? '.azalea/ClickyClick', (player) => {
                uiManager.open(player, config.uinames.basic.iconViewer, 0, (player, icon) => {
                    playerShop.editShop(id, shop.data.name, shop.data.description, icons.resolve(icon), shop.data.currency)
                    uiManager.open(player, config.uinames.playerShop.view, id)
                    player.success('Edited icon successfully')
                })
            })
            form2.show(player)
        })
        form.button(`§4Delete Shop\n§7Delete shop FOREVER (A long time!)`, '.azalea/SidebarTrash', (player) => {
            uiManager.open(player, config.uinames.basic.confirmation, 'You will lose all the items in the shop! Are you sure?', (player) => {
                playerShop.deleteShop(shop.id)
                uiManager.open(player, config.uinames.playerShop.root)
                player.info('Deleted shop :(')
            }, (player) => {
                uiManager.open(player, config.uinames.playerShop.view, id)
            })
        })
        form.divider()
    }
    for (const item of shop.data.items) {
        let itemStack = itemDb.getItem(item.stash, item.slot)
        let guh = `§7${itemStack.typeId} | ${item.description}`.slice(0, 43)
        form.button(`${item.name}\n${guh}`, item.icon ?? null, (player) => {
            uiManager.open(player, config.uinames.playerShop.viewItem, id, item.id)
        })
    }
    form.show(player)
})

system.run(async () => {
    await system.waitTicks(2)
    commands.addCommand('playershop', 'Create or buy from Player Shops', 'Economy', ({ msg }) => {
        if (!modules.get('playershop')) return msg.sender.error('!playershop is disabled. :(')
        uiManager.open(msg.sender, config.uinames.playerShop.root)
    }, true, null, ['pshop'])
})

