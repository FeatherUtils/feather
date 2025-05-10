import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../../Libraries/uiManager";
import uiBuilder from "../../../Modules/uiBuilder";
import config from "../../../config";
import preview from "../../../preview";

uiManager.addUI(config.uinames.uiBuilder.buttons.create, 'create button', (player,uiID)=>{
    let ui = uiBuilder.get(uiID);
    if(!ui) return uiManager.open(player,config.uinames.uiBuilder.buttons.editall,uiID);
    let form = new ModalFormData();
    form.title('Create Button')
    if(preview) form.label('§c* §e- §rRequired')
    form.textField('Text§c*', `This button's text`)
    form.textField('Subtext', `This button's subtext`)
    form.textField(`Required Tag`, `Required tag of this button`)
    form.textField(`First Action§c*`, `This button's first actions`)
    form.show(player).then((res) => {
        let[text,subtext,requiredTag,firstAction] = res.formValues
        if(!text || !firstAction) return player.error('Please enter text and a first action'), uiManager.open(player,config.uinames.uiBuilder.buttons.editall,uiID);
        uiBuilder.addButton(uiID,text,subtext,requiredTag,null,firstAction);
        uiManager.open(player,config.uinames.uiBuilder.buttons.editall,uiID);
    })
})