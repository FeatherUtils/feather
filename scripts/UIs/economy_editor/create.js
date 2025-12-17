import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import { prismarineDb } from "../../Libraries/prismarinedb";
import config from "../../config";
import { consts } from "../../cherryUIConsts";

uiManager.addUI(config.uinames.economyEditor.create, 'ec 123123123xzahksdfuhdd', (player) => {
    let form = new ModalFormData();
    form.title(`${consts.modal}Create Currency`)
    form.textField('Scoreboard', `The scoreboard of this currency`)
    form.textField(`Display Name`, `The display name of this currency`)
    form.show(player).then((res) => {
        let[scoreboard,display] = res.formValues
        if(!scoreboard) return player.error('Enter a scoreboard')
        if(!display) return player.error('Enter a display name')
        prismarineDb.economy.addCurrency(scoreboard,'$',display)
        uiManager.open(player,config.uinames.economyEditor.root)
    })
})