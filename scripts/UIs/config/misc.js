import { ActionForm } from "../../Libraries/form_func";
import config from "../../config";
import uiManager from "../../Libraries/uiManager";
import { consts } from "../../cherryUIConsts";
import { prismarineDb } from "../../Libraries/prismarinedb";
import { ModalFormData } from "@minecraft/server-ui";
import modules from "../../Modules/modules";
import { translate } from "../../translate";

uiManager.addUI(config.uinames.config.misc, 'misc settings', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rConfig UI - Misc`)
    form.button(`${consts.left}${consts.disablevertical}§rMain Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'main_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}${consts.alt}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    form.button(`Chat Rank Format`, null, (player)=>{
        let form2 = new ModalFormData();
        form2.title(`Code Editor`)
        form2.textField(`${translate(config.lang.config.modules.text.crf)}`, `${translate(config.lang.config.modules.text.desc.crf)}`, {defaultValue: modules.get('crf')})
        form2.show(player).then((res) => {
            let [crf] = res.formValues;
            if(crf === '') return modules.set('crf', config.info.defaultChatRankFormat), uiManager.open(player, config.uinames.config.misc);
            modules.set('crf', crf)
            uiManager.open(player, config.uinames.config.misc)
        })
    })
    form.show(player)
})