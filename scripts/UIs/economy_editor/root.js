import { ActionForm } from "../../Libraries/form_func";
import { prismarineDb } from "../../Libraries/prismarinedb";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import {consts} from "../../cherryUIConsts"
import { themes } from "../../cherryThemes";

uiManager.addUI(config.uinames.economyEditor.root, 'ec root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}§rEconomy Editor`)
    form.body(`Welcome to the Economy Editor, this is the entire backbone for the addon's economy`)
    form.button(`${consts.header}§cBack\n§7Back to Config UI`, '.azalea/2', (player) => {
        player.runCommand('open @s config_world')
    })
    form.button(`§aCreate\n§7Create a currency`, `.azalea/1`, (player) => {
        uiManager.open(player,config.uinames.economyEditor.create)
    })
    for(const currency of prismarineDb.economy.getCurrencies()) {
        form.button(`§b${currency.displayName}\n§r§7${currency.scoreboard}`, '.vanilla/emerald', (player) => {
            uiManager.open(player,config.uinames.economyEditor.editCurrency,currency.scoreboard)
        })
    }
    form.show(player)
})