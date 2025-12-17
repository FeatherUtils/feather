import { ActionForm } from "../../Libraries/form_func";
import sidebarEditor from "../../Modules/sidebarEditor";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";

uiManager.addUI(config.uinames.sidebarEditor.root, 'se root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}Sidebar Editor`)
    form.button(`§aCreate\n§7Create a sidebar`, `.azalea/1`, (player) => {
        uiManager.open(player,config.uinames.sidebarEditor.create)
    })
    for(const sd of sidebarEditor.db.findDocuments()) {
        form.button(`§b${sd.data.name}§r\n§7[ ${sd.data.isDefault ? 'Default Sidebar' : `Tag: "sidebar:${sd.data.name}"`} ]`, `textures/azalea_icons/Sidebar`, (player) => {
            uiManager.open(player,config.uinames.sidebarEditor.view,sd.id)
        })
    }
    form.show(player)
})