import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../Libraries/uiManager";
import { prismarineDb } from "../Libraries/prismarinedb";
import config from "../config";
import { consts } from "../cherryUIConsts";
import { world } from "@minecraft/server";

uiManager.addUI(config.uinames.pay, 'pay', (player) => {
    let plrs = world.getPlayers()
    let plrsfiltered = plrs.map(_=>_.name)
    let currencies = prismarineDb.economy.getCurrencies();
    let currenciesDisplay = currencies.map(_=>_.displayName)
    let form = new ModalFormData();
    form.title(`${consts.modal}Pay`)
    form.dropdown('Player', plrsfiltered)
    form.dropdown('Currency', currenciesDisplay)
    form.textField(`Amount`, `Amount to give to user`)
    form.show(player).then((res) => {
        let[playerindex,currencyindex,amount] = res.formValues;
        let plr = plrs[playerindex]
        let currency = currencies[currencyindex]
        if(isNaN(+amount)) return player.error('Amount is not a number');
        if(amount < 1) return player.error('Amount must be above 0')
        if(+amount > prismarineDb.economy.getMoney(player,currency.scoreboard)) return player.error('Not enough ' + currency.displayName)
        prismarineDb.economy.removeMoney(player, +amount, currency.scoreboard)
        prismarineDb.economy.addMoney(plr,+amount,currency.scoreboard)
        plr.sendMessage(`§b${player.name} sent you §a${amount}§r§b ${currency.displayName}`)
    })
})