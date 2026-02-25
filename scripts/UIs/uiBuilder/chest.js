import config from "../../config";
import uiManager from "../../Libraries/uiManager";
import chestBuilder from "../../Modules/chestBuilder";
import { ActionForm } from "../../Libraries/form_func";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";
import { ChestFormData } from "../../Libraries/ChestUI/chestUI";

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
    form.button(`§2Edit Buttons\n§7Edit buttons in the chest`, '.azalea/ClickyClick', (player) => {
        uiManager.open(player, config.uinames.uiBuilder.chest.buttons.editall, id)
    })
    form.button(`§dEdit Form\n§7Configure title, unique id, rows`, '.azalea/EditUi', (player) => {
        let form2 = new ModalFormData();
        form2.title(`${consts.modal}Edit chestui`)
        form2.textField('Title', 'Title of menu, example: Amethyst Kit', { defaultValue: ui.data.title })
        form2.textField('Unique ID', 'Recommended to not have spaces. Example: amethyst_kit', { defaultValue: ui.data.uniqueId })
        form2.slider('Rows', 1, 6,{defaultValue:ui.data.rows})
        form2.show(player).then((res) => {
            let [title, uniqueid, rows] = res.formValues;
            try {
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
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.chest.buttons.editall, 'a', (player,id) => {
    let form = new ChestFormData(ui.data.rows * 9)
})