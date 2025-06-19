import { ActionForm } from "../../Libraries/form_func";
import sidebarEditor from "../../Modules/sidebarEditor";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";

uiManager.addUI(config.uinames.sidebarEditor.viewlines, 'view lines', (player,id) => {
    let form = new ActionForm();
    let sd = sidebarEditor.get(id)
    if(!sd) uiManager.open(player, config.uinames.sidebarEditor.root);
    form.title(`${consts.tag}§rView lines`)
    form.button(`${consts.header}§cBack\n§7Go back to View Sidebar`, '.azalea/2', (player) => {
        uiManager.open(player,config.uinames.sidebarEditor.view,id)
    })
    form.button(`§aCreate\n§7Create a line in this sidebar`, `.azalea/1`, (player) => {
        let form2 = new ModalFormData();
        form2.title('Create line')
        form2.textField('Text', 'Example: My Server!')
        form2.show(player).then((res) => {
            let[text] = res.formValues;
            if(!text) return player.error('You must define text'), uiManager.open(player,config.uinames.sidebarEditor.viewlines,id);
            let status = sidebarEditor.addLine(id,text)
            if(!status) player.error('Could not make line due to an unknown critical error.');
            uiManager.open(player,config.uinames.sidebarEditor.viewlines,id)
        })
    })
    for(const ln of sd.data.lines) {
        form.button(`§r${ln.text}`, null, (player) => {
            uiManager.open(player,config.uinames.sidebarEditor.editline,id,ln.id)
        })
    }
    form.show(player)
})