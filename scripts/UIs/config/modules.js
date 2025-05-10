import { ModalFormData } from '@minecraft/server-ui'
import uiManager from '../../Libraries/uiManager'
import config from '../../config'
import modules from '../../Modules/modules'
import { translate } from '../../translate'
import preview from '../../preview'
import { system, world } from '@minecraft/server'

uiManager.addUI(config.uinames.config.modules, 'config modules', (player) => {
    let form = new ModalFormData()
    let langs = [{name:'English',val:'en'},{name:'Español',val:'es'},{name:'Português Brasileiro',val:'br'}]
    form.title('')
    if(preview) {
    form.header(`${translate(config.lang.config.modules.header)}`)
    form.divider()
    form.label(`${translate(config.lang.config.modules.desc)}`)
    form.divider();
    }
    form.toggle(`${translate(config.lang.config.modules.toggles.ranks)}`, {defaultValue: modules.get('cr')})
    form.toggle(`DevMode (Mostly unfinished or broken buttons)`, {defaultValue: modules.get('devMode') ?? false})
    if(preview) form.divider()
    form.dropdown(`${translate(config.lang.config.modules.lang)}`, langs.map(_=>_.name), {defaultValueIndex: langs.findIndex(_=>_.val==modules.get('language'))})
    form.show(player).then((res) => {
        if(res.canceled) return uiManager.open(player, config.uinames.config.root);
        let[cr,dev,l] = res.formValues
        let lang = langs[l]
        modules.set('devMode', dev)
        modules.set('cr', cr)
        modules.set('language',lang.val)
        system.run(() => {uiManager.open(player, config.uinames.config.root)})
    })
})