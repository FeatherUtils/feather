import uiManager from "../../../Libraries/uiManager";
import moderation from "../../../Modules/moderation";
import config from "../../../config";
import { ActionForm } from "../../../Libraries/prismarinedb";
import { ModalFormData } from "@minecraft/server-ui";
import {consts} from "../../../cherryUIConsts";
import playerStorage from "../../../Libraries/playerStorage";
import icons from "../../../Modules/icons";
import moment from '../../../Libraries/moment'

uiManager.addUI(config.uinames.moderation.warns.create,'add warn cuz funny :3',(player,name='')=>{
    let form = new ActionForm();
    form.title(`${consts.tag}§rCreate warn`)
    form.button(`§cBack\n§7Go back to warn ui`, null, (player) => {
        uiManager.open(player,config.uinames.moderation.warns.root)
    })
    let players = playerStorage.searchPlayersByName(name)
    for(const plr2 of players) {
        let plr = playerStorage.getPlayerByID(plr2)
        if(plr.name === player.name) continue;
        if(plr.tags.includes('moderationexempt')) continue;
        form.button(`§c${plr.name}\nWarn this player (${moderation.Database.findDocuments({type:'WARNING',player:plr2}).length} warning(s))`, null, (player) => {
            let form2 = new ModalFormData();
            form2.title(`§cWarn ${plr.name}`)
            form2.textField(`Reason`, `Example: Not listening to admin`)
            form2.show(player).then((res) => {
                let [reason] = res.formValues;
                if(!reason) return player.error('Please enter a reason')
                moderation.addWarning(plr2, reason)
                player.sendMessage(`${plr.name} was warned!`)
                return;
            })
        })
    }
    form.show(player)
})