import { prismarineDb } from '../../Libraries/prismarinedb';
import uiManager from '../../Libraries/uiManager'
import { ActionForm } from '../../Libraries/form_func';
import config from '../../config'
import { consts, NUT_UI_TAG, NUT_UI_RIGHT_HALF, NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_LEFT_HALF } from '../../cherryUIConsts';
import preview from '../../preview';
import { translate } from '../../translate';
import { ActionFormData } from '@minecraft/server-ui'
import { themes } from '../../cherryThemes';
import api from './api';
import actionParser from '../../Modules/actionParser';

uiManager.addUI(config.uinames.config.root, 'config root fr', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'config')) return player.error(`${translate(config.lang.noperms.config.root)}`)
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${consts.themed}${themes[51][0]}§r${translate(config.lang.config.root.title)}`)
    form.button(`${consts.disablevertical}${consts.left}§a§l§t§b§t§n§u§p§d§4§r${translate(config.lang.config.root.main_settings)}`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'main_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    for (const btn of api.get()) {
        form.button(`${btn.text}\n§7${btn.subtext}`, btn.icon ?? null, (player) => {
            for(const ac of btn.actions) {
                console.log(ac)
                actionParser.runAction(player, `${ac}`)
            }
        })
    }
    form.button(`§gCredits\n§7People who contributed to the addon`, `.azalea/credits(little changes)`, (player) => {
        uiManager.open(player, config.uinames.config.credits)
    })
    form.button(`${translate(config.lang.config.root.modules)}`, `textures/blossom_icons/edit`, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'modules')) return player.error(`${translate(config.lang.noperms.default)}`)
        uiManager.open(player, config.uinames.config.modules)
    })
    form.button(`${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§dUI Builder\n§7Create amazing UIs`, `textures/azalea_icons/GUIMaker/FormsV2`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    });
    form.button(`${NUT_UI_LEFT_HALF}${translate(config.lang.config.mainSettings.ranks)}`, `textures/blossom_icons/rank`, (player) => {
        uiManager.open(player, config.uinames.ranks.root)
    })
    form.button(`${consts.left}${consts.disablevertical}§cModeration\n§7Moderate users`, `textures/azalea_icons/5`, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'moderation')) return;
        uiManager.open(player, config.uinames.moderation.root)
    })
    form.button(`${consts.right}§bSidebar Editor\n§7Create sidebars`, '.azalea/Sidebar', (player) => {
        uiManager.open(player, config.uinames.sidebarEditor.root)
    })
    form.button(`§eEvents\n§7Do something when an event is triggered`, '.blossom/event2', (player) => {
        uiManager.open(player, config.uinames.events.root)
    })
    form.button(`§aVoting\n§7Allow your players to vote on things`, '.blossom/vote', (player) => {
        uiManager.open(player, config.uinames.voting.root)
    })
    form.show(player)
})