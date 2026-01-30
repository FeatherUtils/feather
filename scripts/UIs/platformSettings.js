import platformSettings from "../Modules/platformSettings";
import { ActionForm } from "../Libraries/form_func";
import config from "../config";
import { consts } from '../cherryUIConsts'
import uiManager from "../Libraries/uiManager";
import { ModalFormData } from "@minecraft/server-ui";

uiManager.addUI(config.uinames.platformSettings.root, 'pfst root', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Platform Settings')
    form.body(`We strongly discourage using Platform Bans as a way to moderate your server. We suggest getting a moderation team and an anticheat to protect from hackers. We are not obliged to help you with this feature.`)
    form.button(`${consts.header}§cBack\n§7Go back to Config UI`, `.azalea/2`, (player) => {
        player.runCommand('open @s config_world')
    })
    form.button(`§aWhitelist\n§7Allow players to bypass the platform bans`, null, (player) => {
        uiManager.open(player, config.uinames.platformSettings.whitelist)
    })
    form.button(`§cBan Settings\n§7Ban platforms from your server`, null, async (player) => {
        let form2 = new ModalFormData();
        form2.title(`Ban Settings`)
        form2.toggle(`Console`, {defaultValue:await platformSettings.console.get('isBanned')})
        form2.toggle(`Desktop`, {defaultValue:await platformSettings.computer.get('isBanned')})
        form2.toggle(`Mobile`, {defaultValue:await platformSettings.phone.get('isBanned')})
        form2.show(player).then(async (res) => {
            let [console, desktop, mobile] = res.formValues
            await platformSettings.computer.set('isBanned', desktop)
            await platformSettings.console.set('isBanned', console)
            await platformSettings.phone.set('isBanned', mobile)
            uiManager.open(player,config.uinames.platformSettings.root)
        })
    })
    form.show(player)
})
uiManager.addUI(config.uinames.platformSettings.whitelist, 'pfst wl', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Platform Whitelist')
    form.button(`${consts.header}§cBack\n§7Go back to Platform Settings`, `.azalea/2`, (player) => {
        uiManager.open(player, config.uinames.platformSettings.root)
    })
    form.button(`§aAdd\n§7Add someone to the whitelist`, '.azalea/1', (player) => {
        let form2 = new ModalFormData();
        form2.title('Add to Whitelist')
        form2.textField('Username', `Example: ${player.name}`)
        form2.show(player).then((res) => {
            let[username] = res.formValues;
            if(!username) return player.error('Enter a username');
            platformSettings.add(username)
            player.success('Added player to platform settings')
            uiManager.open(player,config.uinames.platformSettings.whitelist)
        })
    })
    for(const doc of platformSettings.db.findDocuments({type:'WHITELIST'})) {
        form.button(`§b${doc.data.username}\n§7[REMOVE]`, null, (player) => {
            platformSettings.remove(doc.id)
            uiManager.open(player,config.uinames.platformSettings.whitelist)
        })
    }
    form.show(player)
})