import uiManager from "../../../Libraries/uiManager";
import moderation from "../../../Modules/moderation";
import config from "../../../config";
import { ActionForm } from "../../../Libraries/prismarinedb";
import {consts} from "../../../cherryUIConsts";
import moment from '../../../Libraries/moment'
import icons from "../../../Modules/icons";
import playerStorage from "../../../Libraries/playerStorage";

uiManager.addUI(config.uinames.moderation.mutes.root, 'Mutes root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rMutes`)
    form.button(`§aMute\n§7Mute someone from the server`, icons.resolve('azalea/1'), (player) => {
        uiManager.open(player, config.uinames.moderation.mutes.create)
    })
    for (const mute of moderation.Database.findDocuments({ type: 'MUTE' })) {
        let plr = playerStorage.getPlayerByID(mute.data.player)
        if (!plr) continue;
        form.button(`§c${plr.name}\n§7Expires ${moment(mute.data.time).fromNow()}`, icons.resolve('azalea/8-old'), (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§r${plr.name}'s mute`);
            form2.body(`§bReason§7:§r ${mute.data.reason}\n§aExpires ${moment(mute.data.time).fromNow()}`)
            form2.button(`§cBack`, null, (player) => {
                uiManager.open(player, config.uinames.moderation.mutes.root)
            })
            form2.button(`§aUnmute player`, null, (player) => {
                moderation.delete(mute.id)
                uiManager.open(player, config.uinames.moderation.mutes.root)
                player.sendMessage(`§a§lSUCCESS!§r §8>> §7Unmuted ${plr.name} :)`)
            })
            form2.show(player)
        })
    }
    form.show(player)
})