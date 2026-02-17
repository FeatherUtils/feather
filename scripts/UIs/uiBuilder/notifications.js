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
    form.textField('§6* §8- §cRequired\n\n§rIdentifier §6*', '/shownotification <identifier>')
    form.textField('Title §6*', 'Title that will be shown on the notification')
    form.textField('Body', 'What will be shown as the "body" of notification')
    form.show(player).then((res) => {
        let [identifier, title, body] = res.formValues;
        if (!identifier) return player.error('Identifier is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
        if (!title) return player.error('Title is invalid'), uiManager.open(player, config.uinames.uiBuilder.root)
        toast.add(identifier,title,body)
        player.success('Created notification successfully')
        uiManager.open(player,config.uinames.uiBuilder.root)
    })
})