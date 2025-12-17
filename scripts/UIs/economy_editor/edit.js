import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import { prismarineDb } from "../../Libraries/prismarinedb";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import { ActionForm } from "../../Libraries/form_func";

uiManager.addUI(config.uinames.economyEditor.editCurrency, 'easdjk eoafjno', (player,scoreboard) => {
    let currency = prismarineDb.economy.getCurrency(scoreboard)
    if(!currency) return false;
    let form = new ActionForm();
    form.title(`${consts.tag}${currency.displayName}`)
    form.button(`${consts.header}§cBack\n§7Back to Economy Editor`, `.azalea/2`, (player) => {
        uiManager.open(player,config.uinames.economyEditor.root)
    })
    form.button(`§eEdit\n§7Edit values of currency`, `.blossom/edit`, (player) => {
        let form2 = new ModalFormData();
        form2.title(`${consts.modal}Edit Currency`)
        form2.textField(`Display Name`, `${currency.displayName}`, {defaultValue:currency.displayName})
        form2.textField(`Scoreboard`, `${currency.scoreboard}`, {defaultValue:currency.scoreboard})
        form2.show(player).then((res) => {
            let[displayname,scoreboard2] = res.formValues;
            if(!displayname) return player.error('Enter a display name');
            if(!scoreboard2) return player.error('Enter a scoreboard');
            prismarineDb.economy.editDisplayName(scoreboard,displayname)
            prismarineDb.economy.editScoreboard(scoreboard,scoreboard2)
            return uiManager.open(player,config.uinames.economyEditor.editCurrency,scoreboard2)
        })
    })
    if(!currency.default) {
        form.button(`§cDelete\n§7Delete this currency`, '.azalea/SidebarTrash', (player) => {
            prismarineDb.economy.deleteCurrency(scoreboard)
            uiManager.open(player,config.uinames.economyEditor.root)
        })
    }
    form.show(player)
})