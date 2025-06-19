import { ActionForm } from "../../Libraries/form_func";
import sidebarEditor from "../../Modules/sidebarEditor";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";

uiManager.addUI(config.uinames.sidebarEditor.create, 'create se', (player) => {
    let form = new ModalFormData();
    form.title(`Create sidebar`)
    form.textField('Name', 'Example: Main')
    form.show(player).then((res) => {
        let[name] = res.formValues;
        if(!name) return player.error('No name provided');
        let sd = sidebarEditor.addSidebar(name)
        if(!sd) player.error('Something went wrong, please try again with a different name');
        uiManager.open(player,config.uinames.sidebarEditor.root)
    })
})