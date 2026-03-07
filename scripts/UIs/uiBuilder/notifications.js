import { system, world } from '@minecraft/server'
import toast from '../../Modules/toast'
import config from '../../config'
import { ActionForm } from '../../Libraries/form_func'
import { ModalFormData } from '@minecraft/server-ui'
import uiManager from '../../Libraries/uiManager'
import { consts } from '../../cherryUIConsts'

uiManager.addUI(config.uinames.uiBuilder.notifications.create, 'notificationcreate', (player) => {
    let form = new ModalFormData();
    form.title(`${consts.modal}Create`)
    form.textField('§6* §8- §cRequired\n\n§rIdentifier §6*', '/shownotification @s <identifier>')
    form.textField('Title §6*', 'Title that will be shown on the notification')
    form.textField('Body', 'What will be shown as the "body" of notification')
    form.show(player).then((res) => {
        let [identifier, title, body] = res.formValues;
        if (!identifier) return player.error('Identifier is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
        if (!title) return player.error('Title is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
        toast.add(identifier, title, body)
        player.success('Created notification successfully')
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
})

uiManager.addUI(config.uinames.uiBuilder.notifications.edit, 'edit notification', (player, id) => {
    let notification = toast.get(id)
    let form = new ActionForm();
    form.title(consts.tag + `Edit`)
    form.label('Use /shownotification @s "' + notification.data.identifier + '" to show this notification')
    form.button(`§cBack\n§7Go back to builder`, '.azalea/2', (player) => {
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.button(`§dEdit Values\n§7Edit title, body`, '.rpgiab/item', (player) => {
        let form2 = new ModalFormData();
        form2.title(consts.modal + 'Notification')
        form2.textField('§6* §8- §cRequired\n\n§rIdentifier §6*', '/shownotification @s <identifier>', {defaultValue:notification.data.identifier})
        form2.textField('Title §6*', 'Title that will be shown on the notification', {defaultValue: notification.data.title})
        form2.textField('Body', 'What will be shown as the "body" of notification', {defaultValue: notification.data.body ?? ''})
        form2.show(player).then((res) => {
            let [identifier, title, body] = res.formValues;
            if (!identifier) return player.error('Identifier is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
            if (!title) return player.error('Title is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
            toast.edit(id, identifier, title, body, notification.data.icon, notification.data.bg)
            player.success('Edited notification successfully')
            uiManager.open(player, config.uinames.uiBuilder.notifications.edit,id)
        })
    })
    form.button(`§6Edit Icon\n§7Edit the icon of this notification`, '.rpgiab/image', (player) => {
        function callback(player,icon) {
            if(icon) {
                let d = notification.data
                toast.edit(id,d.identifier,d.title,d.body,icon,d.bg)
            }
            player.success('Edited notification successfully')
            uiManager.open(player,config.uinames.uiBuilder.notifications.edit,id)
        }
        uiManager.open(player,config.uinames.basic.iconViewer,0,callback)
    })
    form.button(`§aPreview\n§7Show yourself this notification`, '.rpgiab/magnifier', (player) => {
        toast.show(player,notification.data.identifier)
        uiManager.open(player,config.uinames.uiBuilder.notifications.edit,id)
    })
    form.button(`§5Edit Background\n§7Edit the background of this notification`, toast.bgs[notification.data.bg], (player) => {
        let form2 = new ActionForm();
        form2.title(`${consts.tag}Background selector`)
        form2.button(`§cBack\n§7Back to notification`, '.azalea/2', (player) => {
            uiManager.open(player,config.uinames.uiBuilder.notifications.edit,id)
        })
        for(const bg of toast.bgids) {
            form2.button(`${bg}`, toast.bgs[bg], (player) => {
                toast.edit(id,notification.data.identifier,notification.data.title,notification.data.body,notification.data.icon,bg)
                uiManager.open(player,config.uinames.uiBuilder.notifications.edit,id)
                // player.success('Edited notification successfully')
            })
        }
        form2.show(player)
    })
    form.button(`§4Delete\n§7Delete this notification`, '.azalea/SidebarTrash', (player) => {
        toast.del(notification.id)
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
    form.show(player)
})