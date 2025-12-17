import uiManager from "../../Libraries/uiManager";
import moderation from "../../Modules/moderation";
import config from "../../config";
import { ActionForm } from "../../Libraries/prismarinedb";
import {consts} from "../../cherryUIConsts";
import icons from "../../Modules/icons";


uiManager.addUI(config.uinames.moderation.root, 'Moderation Root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rModeration`)
    form.button(`§4Bans\n§7Ban users who break the rules`, icons.resolve('azalea/5'), (player) => {
        uiManager.open(player,config.uinames.moderation.bans.root)
    })
    form.button(`§6Mutes\n§7Mute users who violate chat rules`, icons.resolve('azalea/view reports'), (player) => {
        uiManager.open(player,config.uinames.moderation.mutes.root)
    })
    form.button(`§cWarnings\n§7Warn users who violate minor rules`, icons.resolve('azalea/5-oldmaybe'), (player) => {
        uiManager.open(player,config.uinames.moderation.warns.root)
    })
    form.button(`§aPlayer Management\n§7Moderate/view info on a player`, icons.resolve('azalea/AdminPlayerIcon'), (player) => {
        uiManager.open(player,config.uinames.playerManagement.root)
    })
    form.show(player)
})