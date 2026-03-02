import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import uiBuilder from "../../Modules/uiBuilder";
import config from "../../config";
import { system } from "@minecraft/server"
import { ActionForm } from "../../Libraries/form_func";
import { consts } from "../../cherryUIConsts";

uiManager.addUI(config.uinames.uiBuilder.makeCreation, 'makeCreation', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Make Creation')
    form.button(`${consts.header}§cBack\n§7Go back to Builder`, '.azalea/2', (player) =>{
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.button(`§bUI\n§7Create a UI`, '.azalea/9', (player) => {
        uiManager.open(player,config.uinames.uiBuilder.create)
    })
    form.button(`§6Area\n§7Create an Area`, '.azalea/server', (player) => {
        uiManager.open(player,config.uinames.areas.create)
    })
    form.button(`§eEvent\n§7Create an event`, '.blossom/event2', (player) => {
        uiManager.open(player,config.uinames.events.add,true)
    })
    form.button(`§aNotification\n§7Create a notification`, `.azalea/label`, (player) => {
        uiManager.open(player,config.uinames.uiBuilder.notifications.create)
    })
    form.button(`§2Chest UI\n§7Create a chest ui`, '.vanilla_blocks/chest_front', (player) => {
        uiManager.open(player,config.uinames.uiBuilder.chest.create)
    })
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.create, 'uiBuilder_create', async (player, id = null, folder = null) => {
    let doc = uiBuilder.get(id)
    let d = doc ? doc.data : null
    let form2 = new ModalFormData();
    let layouts = ['Normal', 'Fullscreen', 'Grid', 'Player Model']
    layouts.push('CherryUI (Recommended)')
    form2.title('Create UI')
    form2.textField('Title', 'Enter title here...', { defaultValue: d ? d.name : null })
    form2.textField('Scriptevent', 'Enter scriptevent here..', { defaultValue: d ? d.scriptevent : null })
    form2.dropdown('Layout', layouts, { defaultValueIndex: d ? d.layout : 4 })
    form2.show(player).then(async (res) => {
        if (res.canceled) return uiManager.open(player, config.uinames.uiBuilder.root);
        let [title, scriptevent, layout] = res.formValues
        if (!title || !scriptevent) return player.error('Title or scriptevent not entered. This is required.'), uiManager.open(player, config.uinames.uiBuilder.root)
        if (d) {
            try {
                uiBuilder.edit(doc.id, title, d.body, scriptevent, layout)
                uiManager.open(player, config.uinames.uiBuilder.edit, id)
            } catch (e) {
                player.error(e)
                uiManager.open(player, config.uinames.uiBuilder.root)
            }
        } else {
            try {
                let id2 = uiBuilder.create(title, '', scriptevent, layout)
                if (folder) {
                    await uiBuilder.addToFolder(id2, folder)
                    return system.run(() => {
                        uiManager.open(player, config.uinames.uiBuilder.folders.view, folder)
                    })
                }
                uiManager.open(player,config.uinames.uiBuilder.root)
            } catch (e) {
                player.error(e)
                uiManager.open(player, config.uinames.uiBuilder.root)
            }
        }
    })
})