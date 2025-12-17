import { ActionForm } from "../../Libraries/form_func";
import voting from "../../Modules/voting";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";

uiManager.addUI(config.uinames.voting.root, 'Voting root', (player) => {
    let form = new ActionForm();
    form.title('§f§0§0§f§rVoting')
    if(player.hasTag('admin')) {
        form.body(`To allow non-admin players to vote enable /vote or make a place where they can access it with the command "scriptevent feathergui:voting_root"`)
        form.button('§dAdmin View\n§7Do admin stuff', 'textures/azalea_icons/Settings', (player) => {
            uiManager.open(player, config.uinames.voting.admin)
        })
    } else {
        form.button('Close UI')
    }
    for(const r of voting.db.findDocuments({type:'Referendum'})) {
        let ref = r.data
        form.button(`§d${ref.title}\n§r§7${ref.body}`, ref.icon ? ref.icon : null, (player)=>{
            uiManager.open(player, config.uinames.voting.view, r.id)
        })
    }
    form.show(player)
})