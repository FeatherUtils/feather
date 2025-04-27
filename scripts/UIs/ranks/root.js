import { ActionForm } from "../../Libraries/prismarinedb";
import ranks from "../../Modules/ranks";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { NUT_UI_TAG, NUT_UI_HEADER_BUTTON } from "../../cherryUIConsts";

uiManager.addUI(config.uinames.ranks.root, 'ranks root', (player)=>{
    let form = new ActionForm()
    form.title(`${NUT_UI_TAG}Ranks`)
    form.button(`${NUT_UI_HEADER_BUTTON}§cBack\n§7Go back to main menu`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`§aAdd`, 'textures/blossom_icons/addrank', (player)=>{
        uiManager.open(player, config.uinames.ranks.add)
    })
    for (const r of ranks.getAll()) {
        form.button(`${r.data.name}\n§r§7${r.data.tag}`, `textures/blossom_icons/editrank`, (player) => {
            uiManager.open(player, config.uinames.ranks.edit, r.id)
        })
    }
    form.show(player)
})