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
import uiBuilder from '../../Modules/uiBuilder'

uiManager.addUI(config.uinames.config.root, 'config root fr', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'config')) return player.error(`${translate(config.lang.noperms.config.root)}`)
    if(uiBuilder.db.findFirst({scriptevent: 'config_main'}) && !player.hasTag('oldconfig')) return player.runCommand('scriptevent feather:open config_main')
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}${consts.themed}${themes[51][0]}§r${translate(config.lang.config.root.title)}`)
    form.button(`§aBack to New UI\n§7Change back to the new Config UI`, '.azalea/2', (player) => {
        player.removeTag('oldconfig')
        player.runCommand('open @s config_main')
    })
    form.button(`${consts.disablevertical}${consts.left}§a§l§t§b§t§n§u§p§d§4§r${translate(config.lang.config.root.main_settings)}`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'config')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    for (const btn of api.get()) {
        if (btn.permission) {
            if (prismarineDb.permissions.hasPermission(player, btn.permission)) {
                form.button(`${btn.text}\n§7${btn.subtext}`, btn.icon ?? null, (player) => {
                    for (const ac of btn.actions) {
                        console.log(ac)
                        actionParser.runAction(player, `${ac}`)
                    }
                })
            }
        } else {
            form.button(`${btn.text}\n§7${btn.subtext}`, btn.icon ?? null, (player) => {
                for (const ac of btn.actions) {
                    console.log(ac)
                    actionParser.runAction(player, `${ac}`)
                }
            })
        }
    }
    form.button(`§gCredits\n§7People who contributed to the addon`, `.azalea/credits(little changes)`, (player) => {
        uiManager.open(player, config.uinames.config.credits)
    })
    if (prismarineDb.permissions.hasPermission(player, 'modules')) {
        form.button(`${translate(config.lang.config.root.modules)}`, `textures/blossom_icons/edit`, (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'modules')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.config.modules)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'ui_builder')) {
        form.button(`${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§dUI Builder\n§7Create amazing UIs`, `textures/azalea_icons/GUIMaker/FormsV2`, (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'ui_builder')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.uiBuilder.root)
        });
    }
    if (prismarineDb.permissions.hasPermission(player, 'ranks')) {
        form.button(`${NUT_UI_LEFT_HALF}${translate(config.lang.config.mainSettings.ranks)}`, `textures/blossom_icons/rank`, (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'ranks')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.ranks.root)
        })
    }
    form.button(`${consts.left}${consts.disablevertical}§cModeration\n§7Moderate users`, `textures/azalea_icons/5`, (player) => {
        uiManager.open(player, config.uinames.moderation.root)
    })
    if (prismarineDb.permissions.hasPermission(player, 'sidebar_editor')) {
        form.button(`${consts.right}§bSidebar Editor\n§7Create sidebars`, '.azalea/Sidebar', (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'sidebar_editor')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.sidebarEditor.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'administrator')) {
        form.button(`§uPermissions\n§7Create roles and set permissions`, '.azalea/4', (player) => [
            uiManager.open(player, config.uinames.permissions.root)
        ])
    }
    if (prismarineDb.permissions.hasPermission(player, 'events')) {
        form.button(`§eEvents\n§7Do something when an event is triggered`, '.blossom/event2', (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'events')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.events.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'voting_admin')) {
        form.button(`§aVoting\n§7Allow your players to vote on things`, '.blossom/vote', (player) => {
            uiManager.open(player, config.uinames.voting.root)
        })

    }
    form.show(player)
})
