import { world } from '@minecraft/server'
import { ActionForm } from '../Libraries/form_func'
import { FormResponse, ModalFormData } from '@minecraft/server-ui'
import playerStorage from '../Libraries/playerStorage'
import { consts } from '../cherryUIConsts'
import uiManager from '../Libraries/uiManager'
import config from '../config'
import moderation from '../Modules/moderation'
import { prismarineDb } from '../Libraries/prismarinedb'

uiManager.addUI(config.uinames.playerManagement.root, 'plrmgmnt root', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Player Management')
    form.button('§6Search\n§7Search for players', '.azalea/Look for UI', (player) => {
        let form2 = new ModalFormData();
        form2.title('Search')
        form2.textField('Name', 'Example: ' + player.name)
        form2.show(player).then((res) => {
            let [name] = res.formValues;
            uiManager.open(player, config.uinames.playerManagement.search, name)
        })
    })
    form.show(player)
})

uiManager.addUI(config.uinames.playerManagement.search, 'plrmgmnt search', (player, name) => {
    let form = new ActionForm()
    let results = playerStorage.searchPlayersByName(name)
    form.title(consts.tag + 'Search')
    if (!results) form.body('No results found :(')
    form.button('§cBack\n§7Go back to previous UI', '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerManagement.root)
    })
    for (const plrid of results) {
        let plr = playerStorage.getPlayerByID(plrid)
        form.button(`§6${plr.name}\n§7[View]`, '.azalea/8', (player) => {
            uiManager.open(player, config.uinames.playerManagement.view, plrid)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.playerManagement.view, 'plrmgmnt view', (player, id) => {
    let form = new ActionForm()
    let plr = playerStorage.getPlayerByID(id)
    form.title(consts.tag + 'View player: ' + plr.name)
    form.body(`Tags: ${plr.tags.join(", ")}\n§rWarnings: ${moderation.Database.findDocuments({ type: 'WARNING', player: id }).length}\n§rLast location: X: ${Math.floor(plr.location.x)}, Y: ${Math.floor(plr.location.y)}, Z: ${Math.floor(plr.location.z)}`)
    form.button(`§cBack\n§7Back to previous UI`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.playerManagement.root)
    })
    if (prismarineDb.permissions.hasPermission(player, 'bans')) {
        form.button(`§bBan\n§7Ban this player`, '.azalea/5', (player) => {
            uiManager.open(player, config.uinames.moderation.bans.create, plr.name)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'warn')) {
        form.button(`§4Warn\n§7Warn this player`, '.azalea/ReportedPlayer', (player) => {
            uiManager.open(player, config.uinames.moderation.warns.create, plr.name)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'mute')) {
        form.button(`§2Mute\n§7Mute this player`, `.azalea/Remove condition`, (player) => {
            uiManager.open(player, config.uinames.moderation.mutes.create, plr.name)
        })
    }
    let warns = moderation.Database.findDocuments({ type: 'WARNING', player: id })
    for (const warn of warns) {
        form.button(`§cWarning: ${warn.data.reason}`)
    }
    form.show(player)
})