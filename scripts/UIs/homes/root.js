import homes from "../../Modules/homes";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import playerStorage from "../../Libraries/playerStorage";

uiManager.addUI(config.uinames.homes.root, 'homes root', (player,viewShared=false)=>{
    let form = new ActionForm();
    form.title(`${consts.tag}§rHomes`)
    form.button(`§r§aCreate\n§7Create a home`, 'textures/azalea_icons/1', (player) => {
        uiManager.open(player,config.uinames.homes.create)
    })
    form.button(`${viewShared ? `§a` : `§c`}Toggle Shared\n§7Toggle shared homes view`, 'textures/azalea_icons/8-old', (player) => {
        if(viewShared) {uiManager.open(player,config.uinames.homes.root)} else {uiManager.open(player,config.uinames.homes.root,true)}
    })
    if(viewShared) {
        for(const home of homes.getSharedFromPlayer(player)) {
            form.button(`§r${home.data.name}\n§7By @${playerStorage.getPlayerByID(home.data.plrid).name}`, `textures/azalea_icons/WarpEditor`, (player) => {
                uiManager.open(player,config.uinames.homes.view,home.id,true)
            })
        }
    } else {
        for(const home of homes.getFromPlayer(player)) {
            form.button(`§r${home.data.name}\n§7By @${playerStorage.getPlayerByID(home.data.plrid).name}`, `textures/azalea_icons/WarpEditor`, (player) => {
                uiManager.open(player,config.uinames.homes.view,home.id,false)
            })
        }
    }
    form.show(player)
})