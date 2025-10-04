import { ModalFormData } from "@minecraft/server-ui";
import { ActionForm } from "../../Libraries/form_func";
import voting from "../../Modules/voting";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";

uiManager.addUI(config.uinames.voting.edit, 'edit referendum', (player,id) => {
    let r = voting.get(id)
    if(!r) return;
    let form = new ActionForm();
    form.title('§f§0§0§f§rEdit Referendum')
    form.button(`§dEdit Values`, 'textures/azalea_icons/ClickyClick', (player) => { 
        let f = new ModalFormData();
        f.title('Edit Values')
        f.textField('Title', `The thing people will see before click`, r.data.title)
        f.textField('Body', 'People will see this after clicking', r.data.body)
        f.show(player).then((res) => {
            let[title,body] = res.formValues;
            if(!title || !body) return player.error('Missing fields');
            voting.edit(id,title,body)
            uiManager.open(player, config.uinames.voting.edit, id)
        })
    })
    form.button(`§bEdit Icon\n§7Edit referendum's icon`, r.data.icon ? r.data.icon : null, (player) => {
        uiManager.open(player, config.uinames.basic.iconViewer, 'azalea_icons', 'vote', r.id)
    })
    form.button(`§cDelete\n§7Delete this referendum`, 'textures/azalea_icons/Delete', (player)=>{
        voting.delete(id)
        uiManager.open(player, config.uinames.voting.admin)
    })
    form.show(player)
})