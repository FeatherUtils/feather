import { ModalFormData } from '@minecraft/server-ui'
import uiManager from '../../Libraries/uiManager'
import config from '../../config'
import modules from '../../Modules/modules'
import { translate } from '../../translate'
import preview from '../../preview'
import { system, world } from '@minecraft/server'
import { consts } from '../../cherryUIConsts'

uiManager.addUI(config.uinames.config.modules, 'config modules', (player) => {
    let form = new ModalFormData()
    let langs = [{name:'English',val:'en'},{name:'Español',val:'es'},{name:'Português Brasileiro',val:'br'}]
    form.title(consts.modal)
    form.toggle(`${translate(config.lang.config.modules.toggles.ranks)}`, {defaultValue: modules.get('cr')})
    form.toggle(`DevMode (Mostly unfinished or broken buttons)`, {defaultValue: modules.get('devMode') ?? false})
    form.toggle(`/pay`, {defaultValue: modules.get('pay')})
    form.toggle(`/homes`, {defaultValue: modules.get('homes')})
    form.toggle('/nick', {defaultValue: modules.get('nick')})
    form.toggle('/vote', {defaultValue: modules.get('vote')})
    form.toggle('/bounty', {defaultValue: modules.get('bounty')})
    form.dropdown(`${translate(config.lang.config.modules.lang)}`, langs.map(_=>_.name), {defaultValueIndex: langs.findIndex(_=>_.val==modules.get('language'))})
    form.show(player).then((res) => {
        if(res.canceled) return uiManager.open(player, config.uinames.config.root);
        let[cr,dev,pay,homes,nick,vote,bounty,l] = res.formValues
        let lang = langs[l]
        modules.set('devMode', dev)
        modules.set('cr', cr)
        modules.set('pay', pay)
        modules.set('homes', homes)
        modules.set('nick', nick)
        modules.set('vote', vote)
        modules.set('bounty', bounty)
        modules.set('language',lang.val)
        system.run(() => {uiManager.open(player, config.uinames.config.root)})
    })
})