import uiManager from "../../../Libraries/uiManager";
import moderation from "../../../Modules/moderation";
import config from "../../../config";
import { ActionForm } from "../../../Libraries/prismarinedb";
import {consts} from "../../../cherryUIConsts";
import moment from '../../../Libraries/moment'
import icons from "../../../Modules/icons";
import playerStorage from "../../../Libraries/playerStorage";

uiManager.addUI(config.uinames.moderation.bans.root, 'Bans UI', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rBans`)
    form.button(`§aBan\n§7Ban someone from the server`, null, (player) => {
        uiManager.open(player,config.uinames.moderation.bans.create)
    })
    for(const ban of moderation.Database.findDocuments({type:'BAN'})) {
        let plr = playerStorage.getPlayerByID(ban.data.player)
        if(!plr) continue;
        form.button(`§c${plr.name}\n§7Expires ${moment(ban.data.time).fromNow()}`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§r${plr.name}'s ban`);
            form2.body(`§bReason§7:§r ${ban.data.reason}\n§aExpires ${moment(ban.data.time).fromNow()}`)
            form2.button(`§cBack`, null, (player) => {
                uiManager.open(player,config.uinames.moderation.bans.root)
            })
            form2.button(`§aUnban player`, null, (player) => {
                moderation.delete(ban.id)
                uiManager.open(player,config.uinames.moderation.bans.root)
                player.sendMessage(`§a§lSUCCESS!§r §8>> §7Unbanned ${plr.name} from server :)`)
            })
            form2.show(player)
        })
    }
    form.show(player)
})