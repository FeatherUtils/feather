import { consts } from '../../../cherryUIConsts'
import { prismarineDb } from '../../../Libraries/prismarinedb'
import { ActionForm } from '../../../Libraries/form_func'
import moment from '../../../Libraries/moment'
import uiManager from '../../../Libraries/uiManager'
import config from '../../../config'
import uiBuilder from '../../../Modules/uiBuilder'
import emojis from '../../../Formatting/emojis'
import { system, world } from '@minecraft/server'
import modules from '../../../Modules/modules'
import icons from '../../../Modules/icons'
import { ModalFormData } from '@minecraft/server-ui'

uiManager.addUI(config.uinames.uiBuilder.folders.view, 'ui builder view folder', (player,foldername,deletionMode = false)=>{
    let form = new ActionForm();
    let folderDocuments = uiBuilder.db.getFolderDocuments(foldername);
    form.title(`${consts.tag}§rFolder`)
    form.button(`${consts.header}§r§cBack\n§7Back to UI builder`, icons.resolve('azalea/2'), (player)=>{
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.button(`${consts.disablevertical}${consts.left}§r§aCreate\n§7Create UI in folder`, icons.resolve('azalea/1'), (player)=>{
        uiManager.open(player,config.uinames.uiBuilder.create,null,foldername)
    })
    form.button(`${consts.right}§r§aAdd\n§7Add UI to folder`, icons.resolve('azalea/10'), (player) => {
        let form2 = new ActionForm();
        form2.title(consts.tag + 'Select UI')
        form2.button(`${consts.header}§r§cBack\n§7Back to Folder`, icons.resolve('azalea/2'), (player)=>{
            form.show(player)
        })
        for(const ui of uiBuilder.db.findDocuments()) {
            if(ui.data.type == '__keyval__') continue;
            if(uiBuilder.db.getFolderDocuments(foldername).includes(ui)) continue;
            form2.button(`${ui.data.name}`, ui.data.icon ?? 'textures/azalea_icons/ClickyClick', async (player) => {
                uiBuilder.addToFolder(ui.id,foldername)
                await uiBuilder.db.loadFolders()
                uiManager.open(player,config.uinames.uiBuilder.root)
            })
        }
        form2.show(player)
    })
    form.button(`§cToggle Removal Mode\n§7${deletionMode ? 'On' : 'Off'}`, null, (player)=>{
        if(deletionMode) {
            uiManager.open(player,config.uinames.uiBuilder.folders.view,foldername,false)
        } else {
            uiManager.open(player,config.uinames.uiBuilder.folders.view,foldername,true)
        }
    })
    for (const doc of folderDocuments) {
        if(!doc) continue;
        if (doc.data.type == '__keyval__') continue;
        let text = `§b${doc.data.name}\n`
        let subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()} | ${emojis.chat} ${doc.data.scriptevent}`
        if(subtext.length > 43) subtext = `§r§b${emojis.clock} Updated ${moment(doc.updatedAt).fromNow()}`
        form.button(text + subtext, `${doc.data.icon ?? `textures/azalea_icons/ClickyClick`}`, async (player) => {
            if(deletionMode) {
                let asdasd123 = await uiBuilder.removeFromFolder(doc.id,foldername)
                if(typeof asdasd123 == 'string') player.error(asdasd123)
                uiManager.open(player,config.uinames.uiBuilder.folders.view,foldername,false)
            } else {
                uiManager.open(player, config.uinames.uiBuilder.edit, doc.id)
            }
        })
    }
    form.button(`§cDelete\n§7Delete this folder`, icons.resolve('azalea/SidebarTrash'), (player)=>{
        uiBuilder.deleteFolder(foldername)
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.show(player)
})