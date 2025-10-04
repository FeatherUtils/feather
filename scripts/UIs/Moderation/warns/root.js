import uiManager from "../../../Libraries/uiManager";
import moderation from "../../../Modules/moderation";
import config from "../../../config";
import { ActionForm } from "../../../Libraries/prismarinedb";
import {consts} from "../../../cherryUIConsts";
import moment from '../../../Libraries/moment'
import icons from "../../../Modules/icons";
import playerStorage from "../../../Libraries/playerStorage";

uiManager.addUI(config.uinames.moderation.warns.root, 'Warn UI', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rWarns`)
    form.button(`§aWarn\n§7Warn someone`, null, (player) => {
        uiManager.open(player,config.uinames.moderation.warns.create)
    })
    for(const ban of moderation.Database.findDocuments({type:'WARNING'})) {
        let plr = playerStorage.getPlayerByID(ban.data.player)
        if(!plr) continue;
        form.button(`§c${plr.name}\n§7[ View ]`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§r${plr.name}'s warn`);
            form2.body(`§bReason§7:§r ${ban.data.reason}`)
            form2.button(`§cBack`, null, (player) => {
                uiManager.open(player,config.uinames.moderation.warns.root)
            })
            form2.button(`§aUnban player`, null, (player) => {
                moderation.delete(ban.id)
                uiManager.open(player,config.uinames.moderation.warns.root)
                player.sendMessage(`§a§lSUCCESS!§r §8>> §7Unbanned ${plr.name} from server :)`)
            })
            form2.show(player)
        })
    }
    form.show(player)
})