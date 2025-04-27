import { ModalForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import ranks from "../../Modules/ranks";
import { colors } from "../../Libraries/prismarinedb";

uiManager.addUI(config.uinames.ranks.add, 'add rank', (player)=>{
    let form = new ModalForm();
    let colornamescolored = colors.getColorNamesColored()
    .map(color => ({ option: color.trim() }));
    form.title('§dRanks')
    form.textField('§dDisplay', 'Enter rank display..')
    form.textField('§dTag', 'Enter tag..')
    form.dropdown('§dBracket Color', colornamescolored, 8)
    form.dropdown('§dChat Color', colornamescolored, 7)
    form.dropdown('§dName Color', colornamescolored, 7)
    form.show(player, false, (player,res)=>{
        let[display,tag,bcc,ccc,ncc] = res.formValues;
        if(!display || !tag) return player.error('Missing fields'), uiManager.open(player, config.uinames.ranks.root)
        let bc = colors.getColorCodes()[bcc]
        let cc = colors.getColorCodes()[ccc]
        let nc = colors.getColorCodes()[ncc]
        ranks.add(display,tag,cc,nc,bc)
        uiManager.open(player, config.uinames.ranks.root)
    })
})