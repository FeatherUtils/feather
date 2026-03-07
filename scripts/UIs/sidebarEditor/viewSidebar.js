import { ActionForm } from "../../Libraries/form_func";
import sidebarEditor from "../../Modules/sidebarEditor";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";
import modules from "../../Modules/modules";

uiManager.addUI(config.uinames.sidebarEditor.view, 'view sidebar', (player, id) => {
    let sd = sidebarEditor.get(id)
    if (!sd) uiManager.open(player, config.uinames.sidebarEditor.root);
    let form = new ActionForm();
    form.title(`${consts.tag}§r${sd.data.name}`)
    form.body(`Sidebar name: ${sd.data.name}§r\nID: ${sd.id}`)
    form.button(`${consts.header}§r§cBack\n§7Go back to sidebar editor`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.sidebarEditor.root)
    })
    form.button(`§eEdit Name\n§7Edit name of this sidebar`, `textures/azalea_icons/Pencil`, (player) => {
        let form2 = new ModalFormData();
        form2.title('Edit Name: ' + sd.data.name)
        form2.textField('Name', 'Example: Main', { defaultValue: sd.data.name })
        form2.show(player).then((res) => {
            let [name] = res.formValues;
            if (!name) return player.error('No name found in text field');
            let status = sidebarEditor.editName(id, name)
            if (!status) player.error('Something went wrong. Try again with another name');
            uiManager.open(player, config.uinames.sidebarEditor.view, id)
        })
    })
    form.button(`§bEdit Lines\n§7Edit lines in this sidebar`, `textures/azalea_icons/Sidebar`, (player) => {
        uiManager.open(player, config.uinames.sidebarEditor.viewlines, id)
    })
    form.button(`§aMake Default\n§7Make this sidebar the default`, `textures/azalea_icons/10`, (player) => {
        sidebarEditor.setDefault(id)
        uiManager.open(player, config.uinames.sidebarEditor.view, id)
    })
    if (modules.get('devMode')) {
        form.button(`§dExport\n§7Export this sidebar`, '.azalea/ExtIcon', (player) => {
            let d = JSON.stringify(sd.data)
            let form2 = new ModalFormData();
            form2.title('Code Editor')
            form2.textField('a','a',{defaultValue:d})
            form2.show(player).then((res) => {
                uiManager.open(player,config.uinames.sidebarEditor.view,id)
            })
        })
    }
    form.button(`§cDelete\n§7Permenantly delete this sidebar`, `textures/azalea_icons/SidebarTrash`, (player) => {
        function ye(player) {
            sidebarEditor.del(id)
            uiManager.open(player, config.uinames.sidebarEditor.root)
        }
        function nah(player) {
            uiManager.open(player, config.uinames.sidebarEditor.view, id)
        }
        uiManager.open(player, config.uinames.basic.confirmation, 'Are you sure you want to delete this sidebar?', ye, nah)
    })
    form.show(player)
})