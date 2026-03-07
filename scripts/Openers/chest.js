import chestBuilder from "../Modules/chestBuilder";
import icons from "../Modules/icons";
import { ChestFormData } from "../Libraries/ChestUI/chestUI";
import formatter from "../Formatting/formatter";
import common from "../Libraries/ChestUI/common";
import { commands } from "../Modules/commands";
import actionParser from "../Modules/actionParser";
import { prismarineDb } from "../Libraries/prismarinedb";
import { consts } from "../cherryUIConsts";
import { ActionForm } from "../Libraries/form_func";
import { world } from "@minecraft/server";

export async function openChest(e) {
    let message = commands.parseArgs(e.message)
    let chest = chestBuilder.db.findFirst({ uniqueId: message[0] })
    let u = chest.data
    let player = e.sourceEntity
    if (!player || player.typeId !== 'minecraft:player') return;
    let form = new ChestFormData(u.rows * 9);
    async function format(text) {
        return await formatter.format(text, player)
    }
    form.title(await format(u.title))
    for (const button of u.buttons) {
        if (button.requiredTag) {
            let rqtf = await format(button.requiredTag)
            if (!e.sourceEntity.hasTag(rqtf.replace('!', '')) && !rqtf.startsWith('!')) continue;
            if (e.sourceEntity.hasTag(rqtf.replace('!', '')) && rqtf.startsWith('!')) continue;
        }
        let pos = common.rowColToSlotId(button.coordinates[0], button.coordinates[1])
        if (button.meta == 'buybutton') {
            form.button(
                pos,
                await format(button.text),
                await Promise.all(button.lore.map(async (_) => await format(_.lore))),
                button.icon ? icons.resolve(button.icon) : icons.resolve('azalea/NoTexture'),
                1,
                false,
                async () => {
                    let buyform = new ActionForm();
                    async function buy(amount) {
                        let p = +button.buyButtonSettings.price
                        if (!prismarineDb.economy.getCurrency(button.buyButtonSettings.scoreboard)) prismarineDb.economy.addCurrency(button.buyButtonSettings.scoreboard, '$', `${button.buyButtonSettings.scoreboard}`)
                        let money = prismarineDb.economy.getMoney(player, button.buyButtonSettings.scoreboard)
                        if (money < p * amount) return buyform.show(player), player.playSound('random.glass')
                        prismarineDb.economy.removeMoney(player, p, button.buyButtonSettings.scoreboard)
                        player.runCommand(`playsound random.orb`)
                        if (button.buyButtonSettings.item) {
                            let scf = world.gameRules.sendCommandFeedback
                            world.gameRules.sendCommandFeedback = false
                            for (let i = 0; i < amount; i++) {
                                player.runCommand('give @s ' + button.buyButtonSettings.item)
                            }
                            world.gameRules.sendCommandFeedback = scf
                        } else {
                            for (const ac of button.actions) {
                                actionParser.runAction(player, await format(ac.action))
                            }
                        }
                        buyform.show(player)
                    }
                    buyform.title(consts.tag)
                    buyform.button(`Back\n§7Back to menu`, null, () => player.runCommand('open @s "' + u.uniqueId + '"'))
                    buyform.button(`Buy 1\n§7${+button.buyButtonSettings.price} ${button.buyButtonSettings.scoreboard}`, null, () => buy(1))
                    if (button.buyButtonSettings.item) {
                        buyform.button(`Buy 8\n§7${+button.buyButtonSettings.price * 8} ${button.buyButtonSettings.scoreboard}`, null, () => buy(8))
                        buyform.button(`Buy 16\n§7${+button.buyButtonSettings.price * 16} ${button.buyButtonSettings.scoreboard}`, null, () => buy(16))
                        buyform.button(`Buy 32\n§7${+button.buyButtonSettings.price * 32} ${button.buyButtonSettings.scoreboard}`, null, () => buy(32))
                        buyform.button(`Buy 64\n§7${+button.buyButtonSettings.price * 64} ${button.buyButtonSettings.scoreboard}`, null, () => buy(64))
                    }
                    buyform.show(player)
                }
            )
            continue;
        }
        if (button.meta == 'sellbutton') {
            form.button(
                pos,
                await format(button.text),
                await Promise.all(button.lore.map(async (_) => await format(_.lore))),
                button.icon ? icons.resolve(button.icon) : icons.resolve('azalea/NoTexture'),
                1,
                false,
                async () => {
                    let buyform = new ActionForm();
                    function hasItem(player, typeId) {
                        let amount = 0
                        let inventory = player.getComponent('inventory')
                        for (let i = 0; i < inventory.inventorySize; i++) {
                            let item1 = inventory.container.getItem(i)
                            if (item1 && item1.typeId == typeId) {
                                amount = amount + item1.amount
                                console.log(item1.typeId)
                                continue;
                            }
                        }
                        return amount;
                    }
                    async function buy(amount) {
                        let quantity = amount
                        if (!prismarineDb.economy.getCurrency(button.sellButtonSettings.scoreboard)) prismarineDb.economy.addCurrency(button.sellButtonSettings.scoreboard, '$', `${button.sellButtonSettings.scoreboard}`)
                        let money = prismarineDb.economy.getMoney(player, button.sellButtonSettings.scoreboard)
                        let price = +button.sellButtonSettings.price * amount
                        if (hasItem(player, button.sellButtonSettings.item) < quantity) return buyform.show(player), player.runCommand(`playsound random.glass`);
                        if (button.sellButtonSettings.item) {
                            prismarineDb.economy.addMoney(player, price, button.sellButtonSettings.scoreboard)
                            player.runCommand(`clear @s ${button.sellButtonSettings.item} 0 ${quantity}`)
                        }
                        player.runCommand(`playsound random.orb`)
                        player.runCommand(`feather:open @s ${e.message}`)
                        buyform.show(player)
                    }
                    buyform.title(consts.tag)
                    buyform.button(`Back\n§7Back to menu`, null, () => player.runCommand('open @s "' + u.uniqueId + '"'))
                    buyform.button(`Sell 1\n§7${+button.sellButtonSettings.price} ${button.sellButtonSettings.scoreboard}`, null, () => buy(1))
                    buyform.button(`Sell 8\n§7${+button.sellButtonSettings.price * 8} ${button.sellButtonSettings.scoreboard}`, null, () => buy(8))
                    buyform.button(`Sell 16\n§7${+button.sellButtonSettings.price * 16} ${button.sellButtonSettings.scoreboard}`, null, () => buy(16))
                    buyform.button(`Sell 32\n§7${+button.sellButtonSettings.price * 32} ${button.sellButtonSettings.scoreboard}`, null, () => buy(32))
                    buyform.button(`Sell 64\n§7${+button.sellButtonSettings.price * 64} ${button.sellButtonSettings.scoreboard}`, null, () => buy(64))
                    buyform.button(`Sell All\n§7${+button.sellButtonSettings.price * hasItem(player,button.sellButtonSettings.item)} ${button.sellButtonSettings.scoreboard}`, null, () => buy(hasItem(player,button.sellButtonSettings.item)))
                    buyform.show(player)
                }
            )
            continue;
        }
        form.button(
            pos,
            await format(button.text),
            await Promise.all(button.lore.map(async (_) => await format(_.lore))),
            button.icon ? icons.resolve(button.icon) : icons.resolve('azalea/NoTexture'),
            1,
            false,
            async () => {
                for (const ac of button.actions) {
                    actionParser.runAction(player, await format(ac.action))
                }
            }
        )
    }
    form.show(player)
}