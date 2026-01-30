import { consts } from '../../cherryUIConsts'
import { prismarineDb } from '../../Libraries/prismarinedb'
import { ActionForm } from '../../Libraries/form_func'
import moment from '../../Libraries/moment'
import uiManager from '../../Libraries/uiManager'
import config from '../../config'
import uiBuilder from '../../Modules/uiBuilder'
import emojis from '../../Formatting/emojis'
import { world } from '@minecraft/server'
import modules from '../../Modules/modules'
import icons from '../../Modules/icons'
import { ModalFormData } from '@minecraft/server-ui'
import { themes } from '../../cherryThemes'

uiManager.addUI(config.uinames.uiBuilder.builtInUIs, 'Built in UIS', (player) => {
    let form = new ActionForm()
    form.title(`${consts.tag}Built In UIS`)
    form.button(`${consts.disablevertical}${consts.left}§rMy UIs`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.button(`${consts.right}${consts.alt}§rBuilt-In UIs`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
    })
    form.button(`§bForce Reset built-in UIs`, null, (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'This will reset ALL built in uis. It will forcefully insert new ones and remove old ones. Only do this if you catastrophically messed up something with Built-In UIs.', (player) => {
            uiBuilder.forceresetbuiltinuis()
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        }, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
        })
    })
    form.button(`§eSoft Reset built-in UIs`, null, (player) => {
        uiManager.open(player, config.uinames.basic.confirmation, 'This will check for new built in uis. It will insert new ones if there is not an old one in its place. If there is an old one, it will not replace it. If you want to replace that specific one, go to the menu for it and click "Reset Built-In UI"', (player) => {
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

uiManager.addUI(config.uinames.uiBuilder.root, 'ui buidlder :3!!!~ :3', (player) => {
    let form = new ActionForm()
    form.title(`${consts.tag}UI Builder`)
    form.button(`${consts.header}§cBack\n§7Go back to main menu`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.disablevertical}${consts.left}${consts.alt}§rMy UIs`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.button(`${consts.right}§rBuilt-In UIs`, null, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.builtInUIs)
    })
    form.button(`${consts.disablevertical}${consts.left}§r§aCreate UI\n§7Make a UI`, `textures/azalea_icons/1`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.create)
    })
    form.button(`${consts.right}§r§bCreate Folder\n§7Make UI Folders`, `textures/folders/rainbow`, (player) => {
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
    form.button(`§rImport`, icons.resolve(`azalea/Import`), (player) => {
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
    form.button(`§r§bTrash\n§7View UIs in Trash`, `textures/azalea_icons/SidebarTrash`, (player) => {
        let form2 = new ActionForm();
        form2.title('Trashed UIs')
        form2.body(`§cWARNING:\n§7All UIs here will be deleted in 30 days!`)
        form2.button(`§cBack\n§7Go back`, 'textures/azalea_icons/2', (player) => {
            uiManager.open(player, config.uinames.uiBuilder.root)
        })
        for (const ui of uiBuilder.db.getTrashedDocuments()) {
            form2.button(`§b${ui.data.name}\n§7[ View ]`, null, (player) => {
                let form3 = new ActionForm()
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
    for (const folder of uiBuilder.db.getFolders()) {
        form.button(`§b${folder}`, `textures/folders/rainbow`, (player) => {
            uiManager.open(player, config.uinames.uiBuilder.folders.view, folder)
        })
    }
    let fd = uiBuilder.db.findDocuments()
    let fdSorted = fd.sort((a, b) => b.updatedAt - a.updatedAt);
    for (const doc of fdSorted) {
        if (doc.data.type == '__keyval__') continue;
        if (doc.data.isBuiltIn) continue;
        let text = `§b${doc.data.name}\n`
        let subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()} | ${emojis.chat} ${doc.data.scriptevent}`
        if (subtext.length > 43) subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()}`
        form.button(text + subtext, `${doc.data.icon ?? `textures/azalea_icons/ClickyClick`}`, async (player) => {
            uiManager.open(player, config.uinames.uiBuilder.edit, doc.id)
        })
    }
    form.show(player)
})