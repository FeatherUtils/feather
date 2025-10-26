import shop from "../Modules/shop";
import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../Libraries/uiManager";
import { ActionForm } from "../Libraries/form_func";
import { prismarineDb } from "../Libraries/prismarinedb";
import config from "../config";
import { consts } from "../cherryUIConsts";
import { world } from "@minecraft/server";

uiManager.addUI(config.uinames.shop.root, 'srot', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Shop')
    if (prismarineDb.permissions.hasPermission(player, 'uiBuilder')) {
        form.body('This is a simple shop system. For something more advanced, use the UI Builder with buy and sell buttons.\n(This is showing to you because you have permission to use the UI Builder, normal players cant see this)')
    }
    if (!shop.db.findDocuments({ type: 'CATEGORY' })) {
        form.button('§cClose')
    }
    if (prismarineDb.permissions.hasPermission(player, 'editShop')) {
        form.button(`§aAdd Category\n§7Add a category`, '.azalea/1', (player) => {
            uiManager.open(player, config.uinames.shop.addCategory)
        })
    }
    for (const cat of shop.db.findDocuments({ type: "CATEGORY" })) {
        form.button(`§r${cat.data.name}\n§r§7${cat.data.description}`, null, (player) => {
            uiManager.open(player, config.uinames.shop.viewCategory, cat.id)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.shop.editCategory, 'editcat', (player, id) => {
    let form = new ActionForm();
    let cat = shop.db.getByID(id)
    if(!cat) return;
    form.title(consts.tag + 'Edit category')
    form.button('§aAdd Item\n§7Add an item to this category', '.azalea/1', (player) => {
        uiManager.open(player,config.uinames.shop.addItem,id)
    })
    for(const item of cat.data.items) {
        form.button(`${item.displayName}\n§r§7${item.itemstack.typeId} | EDIT`, `.blossom/edit`, (player) => {
            uiManager.open(player,config.uinames.shop.editItem,item.id)
        })
    }
    form.button(`§4DELETE CATEGORY`, `.azalea/SidebarTrash`, (player) => {
        shop.del(cat.id)
        uiManager.open(player,config.uinames.shop.root)
    })
    form.show(player);
})
uiManager.addUI(config.uinames.shop.viewCategory, 'viewcat', (player, id) => {
    let form = new ActionForm();
    let cat = shop.db.getByID(id)
    if (!cat) return;
    form.title(`${consts.tag}View Category`)
    if (prismarineDb.permissions.hasPermission(player, 'editShop')) {
        form.button(`§eEdit Category\n§7Edit this category`, `.feather/edit`, (player) => {
            uiManager.open(player, config.uinames.shop.editCategory, id)
        })
    }
    for (const itm of cat.data.items) {
        form.button(`§r${itm.displayName}\n§r§7${itm.itemstack.typeId} | ${cat.data.symbol}${itm.price}`, null, (player) => {
            uiManager.open(player, config.uinames.shop.viewItem, itm.id)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.shop.addCategory, 'ac', (player) => {
    let form = new ModalFormData();
    let currencies = prismarineDb.economy.getCurrencies();
    let cnames = currencies.map(_ => _.displayName);
    form.title(`${consts.modal}Add category`)
    form.textField('Name', 'Example: Food')
    form.textField('Description', 'Example: Buy food here!')
    form.dropdown('Currency', cnames)
    form.textField('Symbol', 'Example: $')
    form.show(player).then((res) => {
        let [name, description, c, symbol] = res.formValues;
        let crnc = currencies[c]
        if (!name) return player.error('Please enter name');
        if (!description) description = 'No description';
        if (!symbol) symbol = '$';
        let a = shop.addCategory(name, description, crnc.scoreboard, symbol)
        if (!a) return player.error('Something went wrong');
        player.success('Successfully created category')
        uiManager.open(player, config.uinames.shop.root)
    })
})
