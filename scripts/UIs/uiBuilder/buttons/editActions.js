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
        uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, bid)
    })
    form.button(`${consts.header}§r§aAdd\n§7Add an action`, icons.resolve('azalea/1'), (player) => {
        let form3 = new ModalFormData();
        form3.title(`Code Editor`)
        form3.textField(`Action`, `Add action`)
        form3.show(player).then((res) => {
            let [action] = res.formValues;
            if (!action) return player.error(`Please enter an action >:(`);
            uiBuilder.addAction(uiID, bid, action)
            uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
        })
    })
    for (const a of b.actions) {
        form.button(`${a.action}`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§rEDIT ACTION: ${a.action}`)
            form2.button(`${consts.header}§r§cBack\n§7Go back to edit actions`, icons.resolve('azalea/2'), (player) => {
                uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
            })
            form2.button(`§eEdit\n§7Edit this action`, null, (player) => {
                let form3 = new ModalFormData();
                form3.title(`Code Editor`)
                form3.textField(`Action`, `Edit action`, {defaultValue:a.action})
                form3.show(player).then((res) => {
                    let [action] = res.formValues;
                    if (!action) return player.error(`Please enter an action >:(`);
                    uiBuilder.editAction(uiID, bid, a.id, action)
                    uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
                })
            })
            form2.button(`§4Delete\n§7Delete this action`, null, (player) => {
                uiBuilder.removeAction(uiID, bid, a.id)
                uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
            })
            form2.button(`§aUP\n§7Move action up`, null, (player)=>{
                uiBuilder.moveActioninButton(uiID,bid,a.id,'up')
                uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
            })
            form2.button(`§cDOWN\n§7Move action down`, null, (player)=>{
                uiBuilder.moveActioninButton(uiID,bid,a.id,'down')
                uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, bid)
            })
            form2.show(player)
        })
    }
    form.show(player)
})