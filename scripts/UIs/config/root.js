import { ActionForm, prismarineDb } from '../../Libraries/prismarinedb';
import uiManager from '../../Libraries/uiManager'
import config from '../../config'
import { consts, NUT_UI_TAG, NUT_UI_RIGHT_HALF, NUT_UI_DISABLE_VERTICAL_SIZE_KEY, NUT_UI_LEFT_HALF } from '../../cherryUIConsts';
import preview from '../../preview';
import { translate } from '../../translate';
import { ActionFormData } from '@minecraft/server-ui'

uiManager.addUI(config.uinames.config.root, 'config root fr', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'config')) return player.error(`${translate(config.lang.noperms.config.root)}`)
    let form = new ActionForm();
    form.title(`${NUT_UI_TAG}§r${translate(config.lang.config.root.title)}`)
    form.button(`${consts.disablevertical}${consts.left}${consts.alt}§r${translate(config.lang.config.root.main_settings)}`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'main_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    form.button(`${translate(config.lang.config.root.modules)}`, `textures/blossom_icons/edit`, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'modules')) return player.error(`${translate(config.lang.noperms.default)}`)
        uiManager.open(player, config.uinames.config.modules)
    })
    form.button(`${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}§dUI Builder\n§7Create amazing UIs`, `textures/azalea_icons/GUIMaker/FormsV2`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    });
    form.button(`${NUT_UI_LEFT_HALF}${translate(config.lang.config.mainSettings.ranks)}`, `textures/blossom_icons/rank`, (player) => {
        uiManager.open(player, config.uinames.ranks.root)
    })
    form.show(player)
})