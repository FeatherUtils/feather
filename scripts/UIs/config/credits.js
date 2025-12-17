import { prismarineDb } from '../../Libraries/prismarinedb';
import uiManager from '../../Libraries/uiManager'
import { ActionForm } from '../../Libraries/form_func';
import config from '../../config'
import { consts } from '../../cherryUIConsts';
import preview from '../../preview';
import { translate } from '../../translate';
import { ActionFormData } from '@minecraft/server-ui'

uiManager.addUI(config.uinames.config.credits, 'cc', (player)=>{
    let form = new ActionForm();
    form.title(`${consts.tag}Credits`)
    for(const contributor of config.credits) {
        form.button(`${contributor.name}\n§7${contributor.description}`)
    }
    form.show(player)
})