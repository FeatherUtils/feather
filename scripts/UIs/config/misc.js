import { ActionForm } from "../../Libraries/form_func";
import config from "../../config";
import uiManager from "../../Libraries/uiManager";
import { consts } from "../../cherryUIConsts";
import { prismarineDb } from "../../Libraries/prismarinedb";
import { ModalFormData } from "@minecraft/server-ui";
import modules from "../../Modules/modules";
import { translate } from "../../translate";
import clans from "../../Modules/clans";
import { world } from "@minecraft/server";
import { themes } from "../../cherryThemes";
import homes from "../../Modules/homes";

uiManager.addUI(config.uinames.config.misc, 'misc settings', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}${consts.themed}${themes[51][0]}§rConfig UI - Misc`)
    form.button(`${consts.left}${consts.disablevertical}§rMain Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'main_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}${consts.alt}${themes[51][0]}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    form.button(`§cChat Rank Format`, '.blossom/rank', (player)=>{
        let form2 = new ModalFormData();
        form2.title(`Code Editor`)
        form2.textField(`${translate(config.lang.config.modules.text.crf)}`, `${translate(config.lang.config.modules.text.desc.crf)}`, {defaultValue: modules.get('crf')})
        form2.show(player).then((res) => {
            let [crf] = res.formValues;
            if(crf === '') return modules.set('crf', config.info.defaultChatRankFormat), uiManager.open(player, config.uinames.config.misc);
            modules.set('crf', crf)
            uiManager.open(player, config.uinames.config.misc)
        })
    })
    form.button(`§bPlatform Settings`, `.azalea/devices(little changes)`, (player) => {
        uiManager.open(player,config.uinames.platformSettings.root)
    })
    form.button(`§eEconomy Editor`, `.vanilla/emerald`, (player) => {
        uiManager.open(player,config.uinames.economyEditor.root)
    })
    form.button(`§6Clans Settings`, '.vanilla/diamond_sword', (player) => {
        let form2 = new ModalFormData();
        let currencyScoreboard = clans.settingsKV.get('currencyScoreboard')
        form2.title('Clans Settings')
        form2.textField(`Currency Scoreboard`, 'money', {defaultValue: currencyScoreboard,tooltip:'This is for the clan bank. This is the scoreboard used for money usually'})
        form2.show(player).then((res) => {
            let[scoreboard] = res.formValues;
            if(!scoreboard) return player.error('Please enter a scoreboard');
            if(!world.scoreboard.getObjective(scoreboard)) world.scoreboard.addObjective(scoreboard);
            if(!prismarineDb.economy.getCurrencies().find(_=>_.scoreboard === scoreboard)) prismarineDb.economy.addCurrency(scoreboard, '$', scoreboard);
            clans.settingsKV.set('currencyScoreboard', scoreboard)
        })
    })
    form.button(`§5Homes Settings`, '.vanilla/ender_pearl', (player) => {
        let form2 = new ModalFormData();
        let maxHomes = homes.kv.get('maxHomes')
        let teleportTime = homes.kv.get('teleportTime')
        form2.title(consts.modal + 'Homes Settings')
        form2.textField(`Max homes`, 'Example: 20', {defaultValue: `${maxHomes}`})
        form2.textField(`Teleport time (seconds)`, 'Example: 5', {defaultValue: `${teleportTime}`})
        form2.show(player).then((res) => {
            let[mh,tt] = res.formValues;
            if(isNaN(+mh)) return player.error('Please enter a vaild number for max homes');
            if(isNaN(+tt)) return player.error('Please enter a vaild number for teleport time');
            homes.kv.set('maxHomes', +mh)
            homes.kv.set('teleportTime', +tt)
        })
    })
    form.show(player)
})