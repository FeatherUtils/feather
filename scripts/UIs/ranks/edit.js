import { ActionForm, colors } from "../../Libraries/prismarinedb";
import { ModalForm } from "../../Libraries/form_func";
import { NUT_UI_TAG, NUT_UI_HEADER_BUTTON } from "../../cherryUIConsts";
import ranks from "../../Modules/ranks";
import config from "../../config";
import uiManager from "../../Libraries/uiManager";

uiManager.addUI(config.uinames.ranks.edit, 'ranks edit', (player, id)=>{
    let form = new ActionForm();
    let pre = NUT_UI_TAG
    let rank = ranks.db.getByID(id)
    let head = NUT_UI_HEADER_BUTTON
    form.title(`${pre}Edit Rank`)
    form.button(`${head}§cBack\n§7Back to ranks`, `textures/azalea_icons/2`, (player)=>{
        uiManager.open(player, config.uinames.ranks.root)
    })
    form.button(`§bEdit\n§7Edit this rank`,'textures/blossom_icons/editrank',async (player)=>{
        uiManager.open(player,config.uinames.ranks.editform,rank)
    })
    form.button(`§cDelete\n§7Delete this rank`, `textures/blossom_icons/delrank`, (player)=>{
        function yes(player) {
            let id2 = id
            ranks.remove(id2)
            uiManager.open(player, config.uinames.ranks.root)
        }
        function no(player) {
            uiManager.open(player, config.uinames.ranks.edit, id)
        }
        uiManager.open(player, config.uinames.basic.confirmation, 'Do you want to delete this rank: ' + rank.data.name, yes, no)
    })
    form.show(player)
})