import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../../Libraries/uiManager";
import uiBuilder from "../../../Modules/uiBuilder";
import config from "../../../config";
import preview from "../../../preview";
import { ActionForm } from "../../../Libraries/form_func";
import { consts } from "../../../cherryUIConsts";

uiManager.addUI(config.uinames.uiBuilder.buttons.create, 'create button', (player, uiID) => {
    let ui = uiBuilder.get(uiID);
    if (!ui) return uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
    let form = new ActionForm();
    form.title(`${consts.tag}Create Item`)
    form.button(`§6Button`, null, (player) => {
        let form2 = new ModalFormData();
        form2.title('Create Button')
        if (preview) form2.label('§c* §e- §rRequired')
        form2.textField('Text§c*', `This button's text`)
        form2.textField('Subtext', `This button's subtext`)
        form2.textField(`Required Tag`, `Required tag of this button`)
        form2.textField(`First Action`, `This button's first actions`)
        form2.show(player).then((res) => {
            let [a, text, subtext, requiredTag, firstAction] = res.formValues
            if (!text) return player.error('Please enter text'), uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
            uiBuilder.addButton(uiID, text, subtext, requiredTag, null, firstAction);
            uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
        })
    })
    form.button(`§dDivider`, null, (player) => {
        uiBuilder.addDivider(uiID)
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
    })
    form.button(`§aLabel`, null, (player) => {
        let form2 = new ModalFormData();
        form2.title('Create label')
        form2.label('§c* §e- §rRequired')
        form2.textField('Text§c*', `This label's text`)
        form2.show(player).then((res) => {
            let [a, text] = res.formValues
            if (!text) return player.error('Please enter text'), uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
            uiBuilder.addLabel(uiID, text)
            uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
        })
    })
    form.button(`§eHeader`, null, (player) => {
        let form2 = new ModalFormData();
        form2.title('Create header')
        form2.label('§c* §e- §rRequired')
        form2.textField('Text§c*', `This header's text`)
        form2.show(player).then((res) => {
            let [a, text] = res.formValues
            if (!text) return player.error('Please enter text'), uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
            uiBuilder.addHeader(uiID, text)
            uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
        })
    })
    form.show(player)
})