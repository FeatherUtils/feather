import { consts } from "../cherryUIConsts";
import { ActionForm } from "../Libraries/form_func";
import icons from "../Modules/icons";
import uiBuilder from "../Modules/uiBuilder";
import actionParser from "../Modules/actionParser";
import { system, world } from "@minecraft/server";
import warps from "../Modules/warps";
import formatter from "../Formatting/formatter";
import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import { prismarineDb } from "../Libraries/prismarinedb";

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

system.afterEvents.scriptEventReceive.subscribe(async e => {
    if (e.id != 'feather:open') return;
    let ui = uiBuilder.db.findFirst({ scriptevent: e.message })
    if (!ui) return e.sourceEntity.error('UI not found');
    let form = new ActionForm();
    let u = ui.data
    let pre = ''
    if (u.layout == 0) pre = ''
    if (u.layout == 1) pre = '§f§u§l§l§s§c§r§e§e§n§r'
    if (u.layout == 2) pre = '§g§r§i§d§u§i§r'
    if (u.layout == 3) pre = '§t§e§s§t§r'
    if (u.layout == 4) pre = consts.tag
    if (u.theme) {
        pre = `${consts.themed}${u.theme}` + pre + `§r`
    }
    form.title(pre + u.name)
    if (u.body) {
        form.body(await formatter.format(u.body, e.sourceEntity))
    }
    for (const button of u.buttons) {
        if (button.type == 'header') form.header(button.text);
        if (button.type == 'label') form.label(button.text);
        if (button.type == 'divider') form.divider()
    }
    if (u.buttons.length < 1) {
        form.button(`§cClose UI`, icons.resolve('azalea/2'))
    }
    for (const button of u.buttons) {
        if (button.type != 'button') continue;
        let rqt = await formatter.format(button.requiredTag, e.sourceEntity)
        if (button.meta === 'sellbutton') {
            let rqtf2 = rqt
            if (rqtf2) {
                if (!e.sourceEntity.hasTag(rqtf2.replace('!', '')) && !rqtf2.startsWith('!')) continue;
                if (e.sourceEntity.hasTag(rqtf2.replace('!', '')) && rqtf2.startsWith('!')) continue;
            }
            form.button(`§r${await formatter.format(button.text, e.sourceEntity)}${button.subtext ? `\n§r§7${await formatter.format(button.subtext, e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player) => {
                let form2 = new ModalFormData();
                form2.title(`Quantity Selector`)
                form2.slider('Quantity', 1, 64)
                form2.show(player).then((res) => {
                    let [quantity] = res.formValues;
                    let price = +button.sellButtonSettings.price * quantity
                    function ye(player) {
                        if (!prismarineDb.economy.getCurrency(button.sellButtonSettings.scoreboard)) prismarineDb.economy.addCurrency(button.sellButtonSettings.scoreboard, '$', `${button.sellButtonSettings.scoreboard}`)
                        let money = prismarineDb.economy.getMoney(player, button.sellButtonSettings.scoreboard)

                        if (hasItem(player, button.sellButtonSettings.item) < quantity) return player.runCommand(`feather:open @s "${e.message}"`), player.runCommand(`playsound random.glass`);
                        if (button.sellButtonSettings.item) {
                            prismarineDb.economy.addMoney(player, price, button.sellButtonSettings.scoreboard)
                            player.runCommand(`clear @s ${button.sellButtonSettings.item} 0 ${quantity}`)
                        }
                        player.runCommand(`playsound random.orb`)
                        player.runCommand(`feather:open @s "${e.message}"`)
                    }
                    function nah(player) {
                        player.runCommand(`feather:open @s "${e.message}"`)
                    }
                    uiManager.open(player, config.uinames.basic.confirmation, `Are you sure you want to get ${price} ${button.sellButtonSettings.scoreboard} from selling ${button.sellButtonSettings.item}?`, ye, nah)
                })
            })
            continue;
        }
        if (button.meta === 'warp') {
            for (const warp of warps.db.findDocuments()) {
                let rqtf = rqt.replaceAll('<warpname>', warp.data.name)
                if (rqtf) {
                    if (!e.sourceEntity.hasTag(rqtf.replace('!', '')) && !rqtf.startsWith('!')) continue;
                    if (e.sourceEntity.hasTag(rqtf.replace('!', '')) && rqtf.startsWith('!')) continue;
                }
                form.button(`§r${await formatter.format(button.text.replaceAll('<warpname>', warp.data.name), e.sourceEntity)}${button.subtext ? `\n§r§7${await formatter.format(button.subtext.replaceAll('<warpname>', warp.data.name), e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, async (player) => {
                    for (const action of button.actions) {
                        actionParser.runAction(e.sourceEntity, await formatter.format(action.action.replaceAll('<warpname>', warp.data.name), e.sourceEntity))
                    }
                })
            }
            continue;
        }

        if (button.meta === 'buybutton') {
            let rqtf = rqt
            if (rqtf) {
                if (!e.sourceEntity.hasTag(rqtf.replace('!', '')) && !rqtf.startsWith('!')) continue;
                if (e.sourceEntity.hasTag(rqtf.replace('!', '')) && rqtf.startsWith('!')) continue;
            }
            form.button(`§r${await formatter.format(button.text, e.sourceEntity)}${button.subtext ? `\n§r§7${await formatter.format(button.subtext, e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, async (player) => {
                if (button.buyButtonSettings.item) {
                    let form2 = new ModalFormData();
                    form2.title(`Quantity Selector`)
                    form2.slider('Quantity', 1, 64)
                    form2.show(player).then((res) => {
                        let [quantity] = res.formValues;
                        let price = +button.buyButtonSettings.price * quantity
                        async function ye(player) {
                            if (!prismarineDb.economy.getCurrency(button.buyButtonSettings.scoreboard)) prismarineDb.economy.addCurrency(button.buyButtonSettings.scoreboard, '$', `${button.buyButtonSettings.scoreboard}`)
                            let money = prismarineDb.economy.getMoney(player, button.buyButtonSettings.scoreboard)
                            if (money < price) return player.runCommand(`feather:open @s "${e.message}"`), player.runCommand(`playsound random.glass`);
                            prismarineDb.economy.removeMoney(player, price, button.buyButtonSettings.scoreboard)
                            player.runCommand(`give @s ${button.buyButtonSettings.item} ${quantity}`)
                            player.runCommand(`playsound random.orb`)
                            player.runCommand(`feather:open @s "${e.message}"`)
                        }
                        function nah(player) {
                            player.runCommand(`feather:open @s "${e.message}"`)
                        }
                        uiManager.open(player, config.uinames.basic.confirmation, `Are you sure you want to spend ${price} ${button.buyButtonSettings.scoreboard} on this?`, ye, nah)
                    })
                } else {
                    let price = +button.buyButtonSettings.price
                    async function ye(player) {
                        if (!prismarineDb.economy.getCurrency(button.buyButtonSettings.scoreboard)) prismarineDb.economy.addCurrency(button.buyButtonSettings.scoreboard, '$', `${button.buyButtonSettings.scoreboard}`)
                        let money = prismarineDb.economy.getMoney(player, button.buyButtonSettings.scoreboard)
                        if (money < price) return player.runCommand(`feather:open @s "${e.message}"`), player.runCommand(`playsound random.glass`);
                        prismarineDb.economy.removeMoney(player, price, button.buyButtonSettings.scoreboard)
                        player.runCommand(`playsound random.orb`)
                        player.runCommand(`feather:open @s "${e.message}"`)
                        for (const action of button.actions) {
                            actionParser.runAction(e.sourceEntity, await formatter.format(action.action, e.sourceEntity))
                        }
                    }
                    function nah(player) {
                        player.runCommand(`feather:open @s "${e.message}"`)
                    }
                    uiManager.open(player, config.uinames.basic.confirmation, `Are you sure you want to spend ${price} ${button.buyButtonSettings.scoreboard} on this?`, ye, nah)
                }

            })
            continue;
        }
        if (button.meta === 'playerlist') {
            for (const plr of world.getPlayers()) {
                let rqtf = rqt.replaceAll('<name2>', plr.name)
                if (rqtf) {
                    if (!e.sourceEntity.hasTag(rqtf.replace('!', '')) && !rqtf.startsWith('!')) continue;
                    if (e.sourceEntity.hasTag(rqtf.replace('!', '')) && rqtf.startsWith('!')) continue;
                }
                form.button(`§r${await formatter.format(button.text.replaceAll('<name2>', plr.name), e.sourceEntity)}${button.subtext ? `\n§r§7${await formatter.format(button.subtext.replaceAll('<name2>', plr.name), e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, async (player) => {
                    for (const action of button.actions) {
                        actionParser.runAction(e.sourceEntity, await formatter.format(action.action.replaceAll('<name2>', plr.name), e.sourceEntity))
                    }
                })
            }
            continue;
        }
        let rqtf = rqt
        if (rqtf) {
            if (!e.sourceEntity.hasTag(rqtf.replace('!', '')) && !rqtf.startsWith('!')) continue;
            if (e.sourceEntity.hasTag(rqtf.replace('!', '')) && rqtf.startsWith('!')) continue;
        }
        form.button(`§r${await formatter.format(button.text, e.sourceEntity)}${button.subtext ? `\n§r§7${await formatter.format(button.subtext, e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, async (player) => {
            for (const action of button.actions) {
                actionParser.runAction(e.sourceEntity, await formatter.format(action.action, e.sourceEntity))
            }
        })
    }
    form.show(e.sourceEntity);
})