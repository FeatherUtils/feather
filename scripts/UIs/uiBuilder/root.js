import { consts } from '../../cherryUIConsts'
import { prismarineDb } from '../../Libraries/prismarinedb'
import { ActionForm } from '../../Libraries/form_func'
import moment from '../../Libraries/moment'
import uiManager from '../../Libraries/uiManager'
import config from '../../config'
import uiBuilder from '../../Modules/uiBuilder'
import emojis from '../../Formatting/emojis'
import { world, system } from '@minecraft/server'
import modules from '../../Modules/modules'
import icons from '../../Modules/icons'
import { ModalFormData } from '@minecraft/server-ui'
import { themes } from '../../cherryThemes'
import { http } from '../../Networking/index'
import featherNetwork from '../../Networking/featherNetwork'
import events from '../../Modules/events'

uiManager.addUI(config.uinames.uiBuilder.builtInUIs, 'Built in UIS', (player) => {
    let form = new ActionForm()
    form.title(`${consts.tag}${consts.themed}${themes[52][0]}Built In`)
    form.button(`${consts.disablevertical}${consts.left}§rMy Creations`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.button(`${consts.right}${consts.alt}${themes[52][0]}§rBuilt-In`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
    })
    form.button(`§bForce Reset built-in creations`, null, (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'This will reset ALL built in creations. It will forcefully insert new ones and remove old ones. Only do this if you catastrophically messed up something with Built-In UIs.', (player) => {
            uiBuilder.forceresetbuiltinuis()
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        }, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        })
    })
    form.button(`§eSoft Reset built-in creations`, null, (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'This will check for new built in creations. It will insert new ones if there is not an old one in its place. If there is an old one, it will not replace it. If you want to replace that specific one, go to the menu for it and click "Reset Built-In UI"', (player) => {
            uiBuilder.softresetbuiltinuis()
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        }, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        })
    })
    form.button(`§dReset Config UI`, null, (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'This will reset config uis. It will forcefully insert new ones and remove old ones. Only do this if you have not changed the Config UI or there is something wrong with it', (player) => {
            uiBuilder.resetConfigUIs()
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        }, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        })
    })
    let fd = uiBuilder.db.findDocuments()
    let fdSorted = fd.sort((a, b) => b.updatedAt - a.updatedAt);
    for (const doc of fdSorted) {
        if (doc.data.type == '__keyval__') continue;
        if (!doc.data.isBuiltIn) continue;
        let text = `§b${doc.data.name}\n`
        let subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()} | ${emojis.chat} ${doc.data.scriptevent}`
        if (subtext.length > 43) subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()}`
        form.button(text + subtext, `${doc.data.icon ?? `textures/azalea_icons/ClickyClick`}`, async (player) => {
            uiManager.open(player, config.uinames.uiBuilder.edit, doc.id)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.uiBuilder.root, 'ui buidlder :3!!!~ :3', (player, page = 1) => {
    let form = new ActionForm()
    form.title(`${consts.tag}${consts.themed}${themes[52][0]}Builder`)
    form.button(`${consts.header}§cBack\n§7Go back to main menu`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.disablevertical}${consts.left}${consts.alt}${themes[52][0]}§rMy Creations`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    if (!prismarineDb.permissions.hasPermission(player, 'ui_builder')) return player.error(`You don't have sufficient permissions to use Builder.`)
    form.button(`${consts.right}§rBuilt-In`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
    })
    if (http.enabled && !player.getDynamicProperty('MCBEToolsToken')) {
        form.button(`${consts.alt}${consts.themed}${themes[52][0]}§rSign in with MCBETools\n§7Sign into Feather Network`, '.azalea/7', (player) => {
            uiManager.open(player, config.uinames.MCBEToolsAuth, async () => {
                await system.waitTicks(2)
                uiManager.open(player, config.uinames.uiBuilder.root)
            })
        })
    }
    if (http.enabled && player.getDynamicProperty('MCBEToolsToken')) {
        form.button(`${consts.alt}${consts.themed}${themes[52][0]}§rSign out of MCBETools\n§7Sign out of your MCBETools account`, '.azalea/7', async (player) => {
            player.runCommand('scriptevent mcbetools:logout')
            await system.waitTicks(3)
            uiManager.open(player, config.uinames.uiBuilder.root)
        })
    }
    if (featherNetwork.isConnected()) {
        form.button(`§bFeather Network\n§7Browse and import UIs on Feather Network`, '.azalea/server', (player) => {
            uiManager.open(player, config.uinames.FeatherNetwork)
        })
    }
    if (http.enabled) {
        form.divider()
    }
    form.button(`§r§aCreate\n§7Make a creation`, `textures/azalea_icons/1`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.makeCreation)
    })
    form.button(`§r§bCreate Folder\n§7Create a folder`, `textures/folders/rainbow`, (player) => {
        let form2 = new ModalFormData();
        form2.title('Create Folder')
        form2.textField(`Name`, `Enter folder name`)
        form2.show(player).then((res) => {
            let [name] = res.formValues;
            if (res.canceled) uiManager.open(player, config.uinames.uiBuilder.root);
            if (!name) return player.error("Enter name please"), uiManager.open(player, config.uinames.uiBuilder.root);
            uiBuilder.addFolder(name)
            uiManager.open(player, config.uinames.uiBuilder.root)
        })
    })
    form.button(`${consts.disablevertical}${consts.left}§dImport\n§7Import a creation`, icons.resolve(`azalea/Import`), (player) => {
        let form2 = new ModalFormData();
        form2.title(`Code Editor`)
        form2.textField(`Code`, `Code`)
        form2.show(player).then((res) => {
            let [code] = res.formValues;
            try {
                uiBuilder.import(code)
            } catch (e) {
                player.error(`${e} | ${e.stack}`)
            }
            uiManager.open(player, config.uinames.uiBuilder.root);
        })
    })
    form.button(`${consts.right}§r§bTrash\n§7Trashed creations`, `textures/azalea_icons/SidebarTrash`, (player) => {
        let form2 = new ActionForm();
        form2.title(consts.tag + 'Trashed Creations')
        form2.body(`§cWARNING:\n§7All Creations here will be deleted in 30 days!`)
        form2.button(`§cBack\n§7Go back`, 'textures/azalea_icons/2', (player) => {
            uiManager.open(player, config.uinames.uiBuilder.root)
        })
        for (const ui of uiBuilder.db.getTrashedDocuments()) {
            form2.button(`§b${ui.data.name}\n§7[ View ]`, null, (player) => {
                let form3 = new ActionForm()
                form3.title(`${consts.tag}Creation`)
                form3.button(`§cBack\n§7Go back`, `textures/azalea_icons/2`, (player) => {
                    form2.show(player)
                })
                form3.button(`§aRecover`, null, (player) => {
                    uiBuilder.recover(ui.id)
                    uiManager.open(player, config.uinames.uiBuilder.root)
                })
                form3.button(`§cDelete FOREVER`, `textures/azalea_icons/Delete`, (player) => {
                    uiBuilder.db.deleteTrashedDocumentByID(ui.id)
                    uiManager.open(player, config.uinames.uiBuilder.root)
                })
                form3.show(player)
            })
        }
        form2.show(player)
    })
    if (uiBuilder.db.getFolders()) {
        form.divider()
        form.label('§6Folders')
    }
    for (const folder of uiBuilder.db.getFolders()) {
        form.button(`§b${folder}`, `textures/folders/rainbow`, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.folders.view, folder)
        })
    }
    form.divider();
    form.label('§dCreations')
    let fd = uiBuilder.getAll()

    function paginate(array, page = 1, pageSize = 30) {
        const totalItems = array.length;
        const totalPages = Math.ceil(totalItems / pageSize);

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const items = array.slice(startIndex, endIndex);

        return {
            items,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }
    let filtered = fd
        .filter(doc => doc.data.type !== '__keyval__')
        .filter(doc => !doc.data.isBuiltIn);

    let fdSorted = filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    let pag = paginate(fdSorted, page, 15);
    for (const doc of pag.items) {
        let eventIcons = {
            "CHAT": "textures/feather_icons/chat",
            "RANDOMNUMBER": "textures/feather_icons/rng",
            "KILL": "textures/blossom_icons/sword",
            "PLACEBLOCK": "textures/blocks/stone",
            "BREAKBLOCK": "textures/items/diamond_pickaxe",
            "JOIN": "textures/azalea_icons/1",
            "DEATH": "textures/blossom_icons/sword"
        }
        let text = `§b${doc.data.name}\n`
        let subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()}${doc.data.scriptevent ? ` | ${emojis.chat} ${doc.data.scriptevent}` : ''}`
        if (subtext.length > 43) subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()}`
        let icon = `textures/azalea_icons/ClickyClick`
        if (doc.data.type === 'AREA') icon = '.azalea/server'
        if (doc.data.type === 'UI' && doc.data.icon) icon = doc.data.icon
        if (events.allowedTypes.includes(doc.data.type)) icon = `${eventIcons[doc.data.type] ?? `.blossom/event2`}`
        if (events.allowedTypes.includes(doc.data.type)) text = `§b${doc.data.identifier}\n`
        form.button(text + subtext, icon, async (player) => {
            if (doc.data.type === 'UI') uiManager.open(player, config.uinames.uiBuilder.edit, doc.id)
            if (doc.data.type === 'AREA') uiManager.open(player, config.uinames.areas.edit, doc.id)
            if (events.allowedTypes.includes(doc.data.type)) uiManager.open(player, config.uinames.events.edit, doc.id)
        })
    }
    if (pag.hasNextPage) {
        form.button(`§aNext Page`, 'textures/ui/arrow_right', (player) => {
            uiManager.open(player, config.uinames.uiBuilder.root, page + 1)
        })
    }
    if (pag.hasPreviousPage) {
        form.button(`§cPrevious Page`, 'textures/ui/arrow_left', (player) => {
            uiManager.open(player, config.uinames.uiBuilder.root, page - 1)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.FeatherNetwork, 'd', async (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}${consts.themed}${themes[52][0]}Feather Network`)
    if (!featherNetwork.isConnected()) {
        form.body('Not connected to feather network')
        return form.show(player);
    }
    let data = await featherNetwork.getUIs()
    const uis = JSON.parse(data).uis

    for (const ui of uis) {
        form.button(
            `§r${ui.displayName}\n§7@${ui.handle}`,
            ui.data?.icon ?? '.azalea/ClickyClick',
            (player) => {
                uiManager.open(
                    player,
                    config.uinames.FeatherNetwork,
                    ui.identification
                )
            }
        )
    }



    form.show(player)
})