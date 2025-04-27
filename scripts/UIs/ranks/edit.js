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
    form.button(`§bEdit\n§7Edit this rank`,'textures/blossom_icons/editrank',(player)=>{
        let form2 = new ModalForm()
        let colornamescolored = colors.getColorNamesColored()
        .map(color => ({ option: color.trim() }));
        form2.title('§dRanks')
        form2.header(`§dEDIT RANK`)
        form2.label(`§bCurrently, editing Tags is not enabled due to bugs.`)
        form2.divider()
        form2.textField('§dDisplay', 'Enter rank display..', rank.data.name)
        form2.dropdown('§dBracket Color', colornamescolored, colors.getColorCodes().findIndex(_=>_===rank.data.bc))
        form2.dropdown('§dChat Color', colornamescolored, colors.getColorCodes().findIndex(_=>_===rank.data.cc))
        form2.dropdown('§dName Color', colornamescolored, colors.getColorCodes().findIndex(_=>_===rank.data.nc))
        form2.show(player, false, (player,res)=>{
            let[display,bcc,ccc,ncc] = res.formValues;
            if(!display) return player.error('Missing fields'), uiManager.open(player, config.uinames.ranks.root)
            let bc = colors.getColorCodes()[bcc]
            let cc = colors.getColorCodes()[ccc]
            let nc = colors.getColorCodes()[ncc]
            ranks.edit(rank.id,display,cc,nc,bc)
            uiManager.open(player, config.uinames.ranks.edit, id)
        })
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