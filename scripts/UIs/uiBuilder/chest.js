import config from "../../config";
import uiManager from "../../Libraries/uiManager";
import chestBuilder from "../../Modules/chestBuilder";
import { ActionForm } from "../../Libraries/form_func";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";
import { ChestFormData } from "../../Libraries/ChestUI/chestUI";
import common from "../../Libraries/ChestUI/common";
import icons from "../../Modules/icons";
import { system } from "@minecraft/server";

uiManager.addUI(config.uinames.uiBuilder.chest.create, 'Create ChestUI', (player) => {
    let form = new ModalFormData();
    form.title(`${consts.modal}Create ChestUI`)
    form.textField('Title', 'Title of menu, example: Amethyst Kit')
    form.textField('Unique ID', 'Recommended to not have spaces. Example: amethyst_kit')
    form.slider('Rows', 1, 6)
    form.show(player).then((res) => {
        let [title, uniqueid, rows] = res.formValues;
        try {
            chestBuilder.create(title, uniqueid, rows)
            player.success('Created successfully')
        } catch (e) {
            player.error(e.toString().replace('Error: ', ''))
        }
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
})
uiManager.addUI(config.uinames.uiBuilder.chest.edit, 'Edit ChestUI', (player, id) => {
    let ui = chestBuilder.get(id)
    if (!ui) throw new Error('No chestui found')
    let form = new ActionForm();
    form.title(`${consts.tag}Edit chestui`)
    form.body(`Open this menu by running\n/open @s "${ui.data.uniqueId}"`)
    form.button(`§2Edit Buttons\n§7Edit buttons in the chest`, '.azalea/ClickyClick', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
    })
    form.button(`§dEdit Form\n§7Configure title, unique id, rows`, '.azalea/EditUi', (player) => {
        let form2 = new ModalFormData();
        form2.title(`${consts.modal}Edit chestui`)
        form2.textField('Title', 'Title of menu, example: Amethyst Kit', { defaultValue: ui.data.title })
        form2.textField('Unique ID', 'Recommended to not have spaces. Example: amethyst_kit', { defaultValue: ui.data.uniqueId })
        form2.slider('Rows', 1, 6, { defaultValue: ui.data.rows })
        form2.show(player).then((res) => {
            let [title, uniqueid, rows] = res.formValues;
            try {
                for (const b of ui.data.buttons) {
                    if (b.coordinates[0] > rows) return player.error('There is a button outside of the rows set.'), uiManager.open(player, config.uinames.uiBuilder.chest.edit, id)
                }
                chestBuilder.edit(id, title, uniqueid, rows)
                player.success('Edited successfully')
            } catch (e) {
                player.error(e.toString().replace('Error: ', ''))
            }
            uiManager.open(player, config.uinames.uiBuilder.chest.edit, id)
        })
    })
    form.button(`§cDelete\n§7Delete this chest ui`, '.azalea/SidebarTrash', (player) => {
        chestBuilder.delete(id)
        player.success('Deleted menu successfully')
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.chest.buttons.editall, 'a', (player, id) => {
    let ui = chestBuilder.get(id)
    if (!ui) throw new Error('No chestui found')
    let form = new ChestFormData((ui.data.rows * 9).toString());
    form.title(`Edit Buttons`)
    for (let i = 0; i < ui.data.rows * 9; i++) {
        form.button(i, '§aCreate button', ['§7Create a button at this position'], 'textures/blocks/tinted_glass', 1, false, () => {
            uiManager.open(player, config.uinames.uiBuilder.chest.buttons.create, id, common.slotIdToRowCol(i))
        })
    }
    for (const button of ui.data.buttons) {
        let pos = common.rowColToSlotId(button.coordinates[0], button.coordinates[1])
        form.button(
            pos,
            button.text,
            button.lore.map(_ => _.lore),
            button.icon ? icons.resolve(button.icon) : icons.resolve('azalea/NoTexture'),
            1,
            false,
            () => {
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, button.id)
            }
        )
    }
    form.show(player).then((res) => {
        if (res.canceled) uiManager.open(player, config.uinames.uiBuilder.chest.edit, id)
    })
})

uiManager.addUI(config.uinames.uiBuilder.chest.buttons.create, 'a', (player, uiID, coordinates, icon = null) => {
    let ui = chestBuilder.get(uiID)
    if (!ui) throw new Error('No ChestUI found :(')
    if (!icon) return uiManager.open(player, config.uinames.basic.iconViewer, 0, (player, ic) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.create, uiID, coordinates, ic)
    })
    let form = new ModalFormData();
    form.title(consts.modal)
    form.textField('Text', 'Text on the button')
    form.textField('First Line', 'Text under the button text')
    form.textField('First Action', 'The first command to run when clicking button')
    form.textField('Required Tag', 'The required tag of the button')
    form.show(player).then(async (res) => {
        if (res.canceled) return uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, uiID)
        let [text, firstline, firstaction, requiredtag] = res.formValues;
        if (!text) return player.error('Text is invalid!'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.create, uiID, coordinates, icon)
        let bid = chestBuilder.addButton(uiID, text, firstline, firstaction, coordinates, requiredtag)
        chestBuilder.buttonIcon(uiID, bid, icon)
        await system.waitTicks(2)
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, uiID)
    })
})
uiManager.addUI(config.uinames.uiBuilder.chest.buttons.actions, '', (player, uiID, bid) => {
    let ui = chestBuilder.get(uiID)
    if (!ui) throw new Error('No ChestUI found :(')
    let btn = chestBuilder.getButton(uiID, bid)
    if (!btn) throw new Error('No button found!')
    let form = new ActionForm();
    form.title(consts.tag + 'Actions')
    form.button(`§cBack\n§7Go back to previous page`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, uiID, bid)
    })
    form.button(`§aCreate\n§7Create an action`, '.azalea/1', (player) => {
        let form2 = new ModalFormData();
        form2.title('Code Editor')
        form2.textField('Code', 'Code')
        form2.show(player).then((res) => {
            let [action] = res.formValues;
            if (!action) return player.error('Enter action first'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            chestBuilder.addAction(uiID, bid, action)
            uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            player.success('Created action successfully!')
        })
    })
    for (const ac of btn.actions) {
        form.button(`${ac.action}`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(consts.tag + 'Action')
            form2.button(`§cBack`, null, (player) => {
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            })
            form2.button(`§eEdit`, null, (player) => {
                let form3 = new ModalFormData();
                form3.title('Code Editor')
                form3.textField('Code', 'Code', { defaultValue: ac.action })
                form3.show(player).then((res) => {
                    let [action] = res.formValues;
                    if (!action) return player.error('Enter action first'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
                    chestBuilder.editAction(uiID, bid, ac.id, action)
                    uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
                    player.success('Edited action successfully!')
                })
            })
            form2.button(`§aUp`, null, (player) => {
                chestBuilder.moveActioninButton(uiID, bid, ac.id, 'up')
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            })
            form2.button(`§4Down`, null, (player) => {
                chestBuilder.moveActioninButton(uiID, bid, ac.id, 'down')
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            })
            form2.button(`§dDelete`, null, (player) => {
                chestBuilder.removeAction(uiID, bid, ac.id)
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, uiID, bid)
            })
            form2.show(player)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.uiBuilder.chest.buttons.edit, '', (player, id, bid) => {
    let ui = chestBuilder.get(id)
    if (!ui) throw new Error('No ChestUI found :(')
    let btn = chestBuilder.getButton(id, bid)
    if (!btn) throw new Error('No button found!')
    let form = new ActionForm();
    form.title(`${consts.tag}§r${btn.text}§r`)
    form.button(`§cBack\n§7Go back to previous page`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
    })
    form.button(`§6Edit\n§7Edit the values of this button`, `.blossom/edit`, (player) => {
        let form2 = new ModalFormData();
        form2.title(consts.modal)
        form2.textField('Text', 'Text on the button', { defaultValue: btn.text })
        form2.textField('Required Tag', 'Required tag of the button', { defaultValue: btn.requiredTag })
        form2.show(player).then((res) => {
            let [text, requiredtag] = res.formValues;
            if (!text) return player.error('Text is invalid!'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
            chestBuilder.editButton(id, bid, text, requiredtag)
            uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
            player.success('Edited button successfully!')
        })
    })
    form.button(`§bMove\n§7Move this button`, '.azalea/ChangeCategory', (player) => {
        let form2 = new ChestFormData((ui.data.rows * 9).toString());
        for (let i = 0; i < ui.data.rows * 9; i++) {
            form2.button(i, '§bMove', ['§7Move the button to this location'], 'textures/blocks/tinted_glass', 1, false, () => {
                chestBuilder.moveButton(id, bid, common.slotIdToRowCol(i))
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
                player.success('Moved button successfully!')
            })
        }
        for (const button of ui.data.buttons) {
            let pos = common.rowColToSlotId(button.coordinates[0], button.coordinates[1])
            form2.button(
                pos,
                button.text,
                ['§7Swap these buttons'],
                button.icon ? icons.resolve(button.icon) : icons.resolve('azalea/NoTexture'),
                1,
                false,
                () => {
                    let btnCoordinates = btn.coordinates
                    chestBuilder.moveButton(id, bid, button.coordinates)
                    chestBuilder.moveButton(id, button.id, btnCoordinates)
                    uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
                    player.success('Swapped buttons successfully!')
                }
            )
        }
        form2.show(player)
    })
    form.button(`§eIcon\n§7Edit the icon of this button`, btn.icon ? icons.resolve(btn.icon) : icons.resolve('azalea/NoTexture'), (player) => {
        uiManager.open(player, config.uinames.basic.iconViewer, 0, (player, ic) => {
            if (!ic) return uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
            chestBuilder.buttonIcon(id, bid, ic)
            uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
        })
    })
    form.button(btn.meta ? `${consts.alt}§rMeta\n§7Edit the meta of this button` : `§rMeta\n§7Edit the meta of this button`, `.azalea/ExtIcon`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.meta, id, bid)
    })
    if (btn.meta === 'buybutton') {
        form.button(`§bBuy Button Settings\n§7Configure buy button`, '.vanilla/emerald', (player) => {
            let form2 = new ModalFormData();
            form2.title(consts.modal + 'Buy Button Settings')
            form2.textField('Price', `Example: 50`, { defaultValue: btn.buyButtonSettings.price })
            form2.textField('Scoreboard', `Example: money`, { defaultValue: btn.buyButtonSettings.scoreboard })
            form2.textField('Item', `Example: minecraft:wheat`, { defaultValue: btn.buyButtonSettings.item ?? null })
            form2.show(player).then((res) => {
                let [price, scoreboard, item] = res.formValues;
                if (isNaN(+price)) return player.error('Price is not a number')
                if (!item) item = null
                chestBuilder.buyButtonSettings(id, bid, { price, scoreboard, item })
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
            })
        })
    }
    if (btn.meta === 'sellbutton') {
        form.button(`§aSell Button Settings\n§7Configure sell button`, '.vanilla/diamond', (player) => {
            let form2 = new ModalFormData();
            form2.title(consts.modal + 'Sell Button Settings')
            form2.textField('Price', `Example: 50`, { defaultValue: btn.sellButtonSettings.price })
            form2.textField('Scoreboard', `Example: money`, { defaultValue: btn.sellButtonSettings.scoreboard })
            form2.textField('Item', `Example: minecraft:wheat`, { defaultValue: btn.sellButtonSettings.item ?? null })
            form2.show(player).then((res) => {
                let [price, scoreboard, item] = res.formValues;
                if (isNaN(+price)) return player.error('Price is not a number')
                if (!item) item = null
                chestBuilder.sellButtonSettings(id, bid, { price, scoreboard, item })
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, id, bid)
            })
        })
    }
    form.button(`§dEdit Lore\n§7Edit lore of this button`, '.azalea/Chat', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, id, bid)
    })
    form.button(`§vEdit Actions\n§7Edit actions of this button`, '.azalea/CustomCommands', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.actions, id, bid)
    })
    form.button(`§4Delete\n§7Delete this button`, `.azalea/SidebarTrash`, (player) => {
        chestBuilder.deleteButton(id, bid)
        player.success('Deleted button successfully!')
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.chest.buttons.meta, 'm', (player, uiID, bID) => {
    let ui = chestBuilder.get(uiID)
    if (!ui) throw new Error('No ChestUI found :(')
    let btn = chestBuilder.getButton(uiID, bID)
    if (!btn) throw new Error('No button found!')
    let form = new ActionForm();
    form.title(`${consts.tag}§rMeta§r`)
    form.button(!btn.meta ? `No meta\n§7Remove meta` : `${consts.alt}§rNo meta\n§7Remove meta`, '.azalea/Delete', (player) => {
        chestBuilder.buttonMeta(uiID, bID, null)
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, uiID, bID)
    })
    form.button(btn.meta == 'buybutton' ? `${consts.alt}§rBuy Button\n§7Buy button (adds settings)` : `Buy Button\n§7Buy button (adds settings)`, '.vanilla/emerald', (player) => {
        chestBuilder.buttonMeta(uiID, bID, 'buybutton')
        chestBuilder.buyButtonSettings(uiID, bID, { price: '0', item: null, scoreboard: 'money' })
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, uiID, bID)
    })
    form.button(btn.meta == 'sellbutton' ? `${consts.alt}§rSell Button\n§7Sell button (adds settings)` : `Sell Button\n§7Sell button (adds settings)`, '.vanilla/diamond', (player) => {
        chestBuilder.buttonMeta(uiID, bID, 'sellbutton')
        chestBuilder.sellButtonSettings(uiID, bID, { price: '0', item: null, scoreboard: 'money' })
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, uiID, bID)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.chest.buttons.lore, 'l', (player, uiID, bid) => {
    let ui = chestBuilder.get(uiID)
    if (!ui) throw new Error('No ChestUI found :(')
    let btn = chestBuilder.getButton(uiID, bid)
    if (!btn) throw new Error('No button found!')
    let form = new ActionForm();
    form.title(consts.tag + 'Lore')
    form.button(`§cBack\n§7Go back to previous page`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.edit, uiID, bid)
    })
    form.button(`§aCreate\n§7Create lore`, '.azalea/1', (player) => {
        let form2 = new ModalFormData();
        form2.title('Code Editor')
        form2.textField('Code', 'Code')
        form2.show(player).then((res) => {
            let [lore] = res.formValues;
            if (!lore) return player.error('Enter lore first'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            chestBuilder.addLore(uiID, bid, lore)
            uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            player.success('Created lore successfully!')
        })
    })
    for (const l of btn.lore) {
        form.button(`${l.lore}`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(consts.tag + 'Lore')
            form2.button(`§cBack`, null, (player) => {
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            })
            form2.button(`§eEdit`, null, (player) => {
                let form3 = new ModalFormData();
                form3.title('Code Editor')
                form3.textField('Code', 'Code', { defaultValue: l.lore })
                form3.show(player).then((res) => {
                    let [lore] = res.formValues;
                    if (!lore) return player.error('Enter lore first'), uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
                    chestBuilder.editLore(uiID, bid, l.id, lore)
                    uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
                    player.success('Edited lore successfully!')
                })
            })
            form2.button(`§aUp`, null, (player) => {
                chestBuilder.moveLoreinButton(uiID, bid, l.id, 'up')
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            })
            form2.button(`§4Down`, null, (player) => {
                chestBuilder.moveLoreinButton(uiID, bid, l.id, 'down')
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            })
            form2.button(`§dDelete`, null, (player) => {
                chestBuilder.delLore(uiID, bid, l.id)
                uiManager.open(player, config.uinames.uiBuilder.chest.buttons.lore, uiID, bid)
            })
            form2.show(player)
        })
    }
    form.show(player)
})