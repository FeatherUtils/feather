import config from "../../config";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import modules from "../../Modules/modules";
import { NUT_UI_TAG, NUT_UI_LEFT_THIRD, NUT_UI_RIGHT_THIRD, NUT_UI_RIGHT_HALF, NUT_UI_LEFT_HALF, NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_HEADER_BUTTON } from "../../cherryUIConsts";
import { prismarineDb } from "../../Libraries/prismarinedb";
import { translate } from "../../translate";

uiManager.addUI(config.uinames.config.main, 'Main Settings', (player)=>{
    if(!prismarineDb.permissions.hasPermission(player, 'main_settings')) return player.error(`${translate(config.lang.noperms.default)}`);
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${translate(config.lang.config.mainSettings.title)}`)
    form.button(`${NUT_UI_HEADER_BUTTON}§cBack\n§7Go back to main menu`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.config.root)
    })
    form.show(player)
})