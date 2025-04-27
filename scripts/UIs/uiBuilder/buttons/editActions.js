import { ActionForm } from "../../../Libraries/form_func";
import config from "../../../config";
import uiBuilder from "../../../Modules/uiBuilder";
import { consts } from "../../../cherryUIConsts";
import uiManager from "../../../Libraries/uiManager";
import icons from "../../../Modules/icons";
import { ModalFormData } from "@minecraft/server-ui";
import preview from "../../../preview";

uiManager.addUI(config.uinames.uiBuilder.buttons.editActions, 'edit actions', (player, uiID, bid) => {
    let b = uiBuilder.getButton(uiID, bid)
    if (!b) return player.error('Invalid Button');
    let form = new ActionForm();
    form.title(`${consts.tag}§rActions`)
    form.button(`${consts.header}§r§cBack\n§7Go back to edit button`, icons.resolve('azalea/2'), (player) => {
        uiManager.open(player,config.uinames.uiBuilder.buttons.edit,uiID,bid)
    })
    for(const a of b.actions) {
        form.button(`${a}`, null, (player)=>{
            let form2 = new ActionForm();
            form2.title('a')
        })
    }
    form.show(player)
})