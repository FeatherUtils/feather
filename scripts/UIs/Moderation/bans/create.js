import uiManager from "../../../Libraries/uiManager";
import moderation from "../../../Modules/moderation";
import config from "../../../config";
import { ActionForm } from "../../../Libraries/prismarinedb";
import { ModalFormData } from "@minecraft/server-ui";
import {consts} from "../../../cherryUIConsts";
import playerStorage from "../../../Libraries/playerStorage";
import icons from "../../../Modules/icons";
import moment from '../../../Libraries/moment'

uiManager.addUI(config.uinames.moderation.bans.create,'add ban cuz funny :3',(player)=>{
    let form = new ActionForm();
    form.title(`${consts.tag}§rCreate ban`)
    form.button(`§cBack\n§7Go back to ban ui`, null, (player) => {
        uiManager.open(player,config.uinames.moderation.bans.root)
    })
    let players = playerStorage.searchPlayersByName('')
    for(const plr2 of players) {
        let plr = playerStorage.getPlayerByID(plr2)
        if(plr.name === player.name) continue;
        if(moderation.Database.findFirst({player:plr2,type:'BAN'})) continue;
        if(plr.tags.includes('admin')) continue;
        form.button(`§c${plr.name}\n§7Ban this player`, null, (player) => {
            let form2 = new ModalFormData();
            form2.title(`§cBan ${plr.name}`)
            form2.textField(`Reason`, `Example: Being an abusive admin`)
            form2.divider()
            form2.label(`Do not enter any time if you want to ban this player forever`)
            form2.divider()
            form2.textField(`Seconds`, `How many seconds to ban player for`)
            form2.textField(`Minutes`, `How many minutes to ban player for`)
            form2.textField(`Hours`, `How many hours to ban player for`)
            form2.textField(`Days`, `How many days to ban player for`)
            form2.show(player).then((res) => {
                let [reason,se,mi,ho,da] = res.formValues;
                if(!reason) return player.error('Please enter a reason')
                if(!se && !mi && !ho && !da) {
                    moderation.addBan(plr2, reason)
                    player.sendMessage(`${plr.name} was banned!`)
                    return;
                }
                if(isNaN(+se) || isNaN(+mi) || isNaN(+ho) || isNaN(+da)) return player.sendMessage(`One of the time fields are not a number`)
                let date = new Date()
                date.setSeconds(date.getSeconds() + +se)
                date.setMinutes(date.getMinutes() + +mi)
                date.setHours(date.getHours() + +ho)
                date.setHours(date.getHours() + +da * 24)
                let time = date.getTime();
                moderation.addBan(plr2, reason, time)
            })
        })
    }
    form.show(player)
})