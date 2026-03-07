import { EnchantmentTypes, world } from "@minecraft/server";
import { ActionForm } from "../Libraries/form_func";
import config from "../config";
import { consts } from '../cherryUIConsts'
import uiManager from "../Libraries/uiManager";
import { ChestFormData } from "../Libraries/ChestUI/chestUI";


function getInventory(player) {
    return player.getComponent("minecraft:inventory").container;
}

function getAllInventoryItems(player) {
    const inventory = getInventory(player);
    const size = inventory.size;
    const items = [];
    for (let i = 0; i < size; i++) {
        const item = inventory.getItem(i);
        items.push({item,slot:i});
    }
    return items;
}

function transferItem(giver, receiver, slotIndex) {
    const giverInv = getInventory(giver);
    const receiverInv = getInventory(receiver);
    const item = giverInv.getItem(slotIndex);
    if (!item) return false;
    const leftover = receiverInv.addItem(item);
    if (!leftover) {
        giverInv.setItem(slotIndex, undefined);
    } else {
        giverInv.setItem(slotIndex, leftover);
    }
    return true;
}

uiManager.addUI(config.uinames.inventorySee, 'INVSEE', (player, user) => {
    let form = new ChestFormData('double')
    let items = getAllInventoryItems(user)
    form.title(`${user.name}'s inventory`)
    for (const slotData of items) {
        const slot = slotData.slot;
        const item = slotData.item;
        const enchantable = item?.getComponent('minecraft:enchantable')
        if (item) {
            form.button(
                slot,
                item.nameTag ?? item.typeId,
                item.nameTag ? [item.typeId] : null,
                item.typeId,
                item.amount,
                enchantable ? enchantable.getEnchantments().length > 0 ? true : false : false,
                () => {
                    transferItem(user, player, slot);
                }
            );
        } else {
            form.button(
                slot,
                "Empty",
                [],
                "",
                0,
                false,
                () => { }
            );
        }
    }
    form.show(player)
});


