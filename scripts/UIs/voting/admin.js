import { ActionForm } from "../../Libraries/form_func";
import voting from "../../Modules/voting";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";

uiManager.addUI(config.uinames.voting.admin, 'voting admin', (player) => {
    let form = new ActionForm();
    form.title('§f§0§0§f§rVoting Admin')
    form.button('§cBack\n§7Back to previous UI', 'textures/azalea_icons/2', (player) => {
        uiManager.open(player, config.uinames.voting.root)
    })
    form.button(`§aStart\n§7Start a referendum`, 'textures/azalea_icons/1', (player) => {
        uiManager.open(player, config.uinames.voting.start)
    })
    for (const r of voting.db.findDocuments({ type: 'Referendum' })) {
        form.button(`§d${r.data.title}\n§7[ Edit Referendum ]`, r.data.icon ? r.data.icon : null, (player) => {
            uiManager.open(player, config.uinames.voting.edit, r.id)
        })
    }
    form.show(player)
})