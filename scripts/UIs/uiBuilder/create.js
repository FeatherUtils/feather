import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import uiBuilder from "../../Modules/uiBuilder";
import config from "../../config";

uiManager.addUI(config.uinames.uiBuilder.create, 'uiBuilder_create', (player, id = null, folder = null) => {
    let doc = uiBuilder.get(id)
    let d = doc ? doc.data : null
    let form = new ModalFormData();
    let layouts = ['Normal', 'Fullscreen', 'Grid', 'Player Model']
    layouts.push('CherryUI (Recommended)')
    form.title('Create UI')
    form.textField('Title', 'Enter title here...', {defaultValue: d ? d.name : null})
    form.textField('Scriptevent', 'Enter scriptevent here..', {defaultValue: d ? d.scriptevent : null})
    form.dropdown('Layout', layouts, {defaultValueIndex: d ? d.layout : 4})
    form.show(player).then((res) => {
        if(res.canceled) return uiManager.open(player,config.uinames.uiBuilder.root);
        let [title, scriptevent, layout] = res.formValues
        if (!title || !scriptevent) return player.error('Title or scriptevent not entered. This is required.'), uiManager.open(player,config.uinames.uiBuilder.root)
        if (d) {
            try {
                uiBuilder.edit(doc.id, title, d.body, scriptevent, layout)
                uiManager.open(player,config.uinames.uiBuilder.edit, id)
            } catch (e) {
                player.error(e)
                uiManager.open(player,config.uinames.uiBuilder.root)
            }
        } else {
            try {
                let id2 = uiBuilder.create(title, '', scriptevent, layout)
                if(folder) {
                    uiBuilder.addToFolder(id2,folder)
                }
                uiManager.open(player,config.uinames.uiBuilder.root)
            } catch (e) {
                player.error(e)
                uiManager.open(player,config.uinames.uiBuilder.root)
            }
        }
    })
})