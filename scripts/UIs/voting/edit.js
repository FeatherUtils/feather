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
    form.button('§cBack', '.azalea/2', (player) => {
        uiManager.open(player,config.uinames.voting.admin)
    })
    form.button(`§dEdit Values`, 'textures/azalea_icons/ClickyClick', (player) => { 
        let f = new ModalFormData();
        f.title('Edit Values')
        f.textField('Title', `The thing people will see before click`, {defaultValue:r.data.title})
        f.textField('Body', 'People will see this after clicking', {defaultValue:r.data.body})
        f.show(player).then((res) => {
            let[title,body] = res.formValues;
            if(!title || !body) return player.error('Missing fields');
            voting.edit(id,title,body)
            uiManager.open(player, config.uinames.voting.edit, id)
        })
    })
    form.button(`§bEdit Icon\n§7Edit referendum's icon`, r.data.icon ? `.${r.data.icon}` : null, (player) => {
        function cb(player, icon) {
            voting.edit(id,r.data.title,r.data.body,icon)
            uiManager.open(player,config.uinames.voting.edit,id)
        }
        uiManager.open(player, config.uinames.basic.iconViewer, 0, cb)
    })
    form.button(`§cDelete\n§7Delete this referendum`, 'textures/azalea_icons/Delete', (player)=>{
        voting.delete(id)
        uiManager.open(player, config.uinames.voting.admin)
    })
    form.show(player)
})