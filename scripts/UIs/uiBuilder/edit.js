import { ModalFormData } from "@minecraft/server-ui";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import icons from "../../Modules/icons";
import uiBuilder from "../../Modules/uiBuilder";
import { consts } from "../../cherryUIConsts";
import config from "../../config";
import { themes } from "../../cherryThemes";
import modules from '../../Modules/modules'
import featherNetwork from "../../Networking/featherNetwork";
import { system } from '@minecraft/server'

uiManager.addUI(config.uinames.uiBuilder.edit, 'UI Builder Edit UI', async (player, id) => {
    let form = new ActionForm();
    let ui = uiBuilder.get(id)
    if (!ui) return uiManager.open(player, config.uinames.uiBuilder.root);
    let pre = ``
    if (ui.data.theme) {
        pre = `${consts.themed}${ui.data.theme}`
    }
    form.title(`${pre}${consts.tag}§rEdit UI`)
    if (ui.data.layout == 3) {
        form.body(`Warning: Body doesn't work in Player Model UIs`)
    }
    form.button(`${consts.header}§r§cBack\n§7Go back to UI Builder`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    if (ui.data.isBuiltIn || ui.data.scriptevent == 'tpr' || ui.data.scriptevent == 'warps' || ui.data.scriptevent == 'tpr-req') {
        form.button(consts.alt + '§rReset Built-In UI', null, (player) => {
            uiBuilder.resetBuiltInUI(ui.data.scriptevent)
            uiManager.open(player, config.uinames.uiBuilder.root)
        })
        form.divider()
    }
    form.button(`${consts.header}§r§bIcon\n§7Edit UI Icon`, `${ui.data.icon ?? 'textures/azalea_icons/ClickyClick'}`, (player) => {
        function callback(player, icon) {
            let id2 = id
            uiBuilder.uiIcon(id2, icons.resolve(icon))
            uiManager.open(player, config.uinames.uiBuilder.edit, id2)
        }
        uiManager.open(player, config.uinames.basic.iconViewer, 0, callback)
    })
    form.button(`${consts.disablevertical}${consts.left}§r§dEdit Form\n§7Edit display, more`, `textures/azalea_icons/EditUi`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.create, id)
    })
    form.button(`${consts.right}§r§dEdit Buttons\n§7Configure buttons`, `textures/azalea_icons/ClickyClick`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, id)
    })
    form.button(`§aEdit Body\n§7Edit the body of this ui`, `textures/blossom_icons/edit`, (player) => {
        let form2 = new ModalFormData();
        form2.title('Code Editor')
        form2.textField(`Body`, `Enter body here..`, { defaultValue: ui.data.body })
        form2.show(player).then((res) => {
            let [body] = res.formValues
            uiBuilder.edit(id, ui.data.name, body, ui.data.scriptevent, ui.data.layout)
            uiManager.open(player, config.uinames.uiBuilder.edit, id)
        })
    })
    form.button(`§bExport\n§7Export the data of this UI`, icons.resolve(`azalea/export`), (player) => {
        let form2 = new ModalFormData();
        form2.title('Code Editor')
        form2.textField(`Code`, `Code`, { defaultValue: uiBuilder.getExportData(id) })
        form2.show(player)
    })
    if (modules.get('CLog')) {
        form.button(`${ui.data.allowedInCombat ? `§aAllow in Combat\n§7Allow players to open this menu while in combat` : `§cAllow in Combat\n§7Allow players to open this menu while in combat`}`, '.blossom/sword', (player) => {
            if (ui.data.allowedInCombat == true) { ui.data.allowedInCombat = false } else { ui.data.allowedInCombat = true }
            uiBuilder.db.overwriteDataByID(id, ui.data)
            uiManager.open(player, config.uinames.uiBuilder.edit, id)
        })
    }
    if (modules.get('devMode')) {
        form.button(`§bExport as Built In\n§7Export the data of this UI as Built In`, icons.resolve(`azalea/export`), (player) => {
            let form2 = new ModalFormData();
            form2.title('Code Editor')
            form2.textField(`Code`, `Code`, { defaultValue: uiBuilder.getExportData(id, true) })
            form2.show(player)
        })
    }
    if (ui.data.layout === 4) {
        form.button(`§9Edit Theme\n§7Edit the theme of this UI`, icons.resolve('azalea/RainbowPaintBrush'), (player) => {
            let form = new ActionForm();
            form.title(`${consts.tag}§rTheme`)
            form.button(`${consts.header}§cBack\n§7Go back to UI`, icons.resolve('azalea/2'), (player) => {
                uiManager.open(player, config.uinames.uiBuilder.edit, id)
            })
            for (const theme of themes) {
                form.button(`${theme[1]}`, theme[2], (player) => {
                    uiBuilder.editTheme(id, theme[0])
                    uiManager.open(player, config.uinames.uiBuilder.edit, id)
                })
            }
            form.show(player)
        })
    }
    form.button(`${ui.data.isBuiltIn ? consts.disabled : ''}§bTrash\n§7${ui.data.isBuiltIn ? `This UI is Built-in` : `Send this UI to the Trash`}`, `textures/azalea_icons/SidebarTrash`, (player) => {
        if (ui.data.isBuiltIn) return;
        uiBuilder.delete(id)
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    if (featherNetwork.isConnected()) {
        form.divider()
        if (!player.getDynamicProperty('MCBEToolsToken')) {
            form.label(`You must be signed into MCBETools to publish on Feather Network`)
        } else {
            if (await featherNetwork.isPublished(id)) {
                form.button('§cUnpublish', '.azalea/server', async (player) => {
                    await featherNetwork.unpublish(id, player.getDynamicProperty('MCBEToolsToken'))
                    await system.waitTicks(2)
                    uiManager.open(player, config.uinames.uiBuilder.edit, id)
                })
            } else {
                form.button('§aUpload', '.azalea/server', async (player) => {
                    let form2 = new ModalFormData();
                    form2.title('Upload')
                    form2.textField('Display name', 'Example: cool ui')
                    form2.show(player).then(async (res) => {
                        let [displayname] = res.formValues
                        await featherNetwork.upload(displayname, ui, player.getDynamicProperty('MCBEToolsToken'))
                        await system.waitTicks(2)
                        uiManager.open(player, config.uinames.uiBuilder.edit, id)
                    })
                })
            }
        }
    }
    form.show(player)

})