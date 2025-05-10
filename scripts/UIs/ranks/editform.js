import { ActionForm, colors } from "../../Libraries/prismarinedb";
import { ModalForm } from "../../Libraries/form_func";
import { NUT_UI_TAG, NUT_UI_HEADER_BUTTON } from "../../cherryUIConsts";
import ranks from "../../Modules/ranks";
import config from "../../config";
import uiManager from "../../Libraries/uiManager";


uiManager.addUI(config.uinames.ranks.editform, 'edit form rrnaks wow', (player, rank) => {
    let colornamescolored = colors.getColorNamesColored()
        .map(color => ({ option: color.trim() }));
    
    let form = new ModalForm()
    form.title('§dRanks')
    form.header(`§dEDIT RANK`)
    form.divider()
    form.textField('§dDisplay', 'Enter rank display..', rank.data.name)
    
    let bcIndex = Math.max(0, colors.getColorCodes().findIndex(_ => _ === rank.data.bc));
    let ccIndex = Math.max(0, colors.getColorCodes().findIndex(_ => _ === rank.data.cc));
    let ncIndex = Math.max(0, colors.getColorCodes().findIndex(_ => _ === rank.data.nc));
    
    form.dropdown('§dBracket Color', colornamescolored, bcIndex)
    form.dropdown('§dChat Color', colornamescolored, ccIndex)
    form.dropdown('§dName Color', colornamescolored, ncIndex)
    
    form.show(player, false, (player, res) => {
        try {
            console.log(res.formValues)
            let [header,divider,display, bcc, ccc, ncc] = res.formValues;
            if (!display) {
                player.error('Missing display field');
                return uiManager.open(player, config.uinames.ranks.root);
            }
            
            let bc = colors.getColorCodes()[bcc];
            let cc = colors.getColorCodes()[ccc];
            let nc = colors.getColorCodes()[ncc];
            
            ranks.edit(rank.id, display, cc, nc, bc);
            uiManager.open(player, config.uinames.ranks.edit, rank.id);
        } catch (error) {
            player.error(`Edit form error: ${error.message}`);
            uiManager.open(player, config.uinames.ranks.root);
        }
    });
});
