import warps from "../Modules/warps";
import uiManager from "../Libraries/uiManager";
import { ActionForm } from "../Libraries/form_func";
import { ModalFormData } from "@minecraft/server-ui";
import config from "../config";
import { consts } from '../cherryUIConsts'

uiManager.addUI(config.uinames.warpManagement, 'warp management', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Warp Management')
    form.button('§cBack\n§7Back to config ui', '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.config.misc)
    })
    for(const warp of warps.db.findDocuments()) {
        form.button(`§b${warp.data.name}`, '.vanilla/ender_pearl', (player) => {
            let form2 = new ActionForm();
            form2.title(consts.tag + warp.data.name)
            form2.button(`§cBack\n§7Back to warp management`, '.azalea/2', (player) => {
                uiManager.open(player, config.uinames.warpManagement)
            })
            form2.button(`§6Edit Values\n§7Edit values of this warp`, '.azalea/Extra UI settings', (player) => {
                let form3 = new ModalFormData();
                form3.title('Edit Values')
                form3.textField('Required Tag', 'Set required tag', {defaultValue: warp.data.requiredTag ?? ''})
                form3.show(player).then((res) => {
                    let[requiredTag] = res.formValues;
                    warps.setRequiredTag(warp.id,requiredTag)
                    uiManager.open(player,config.uinames.warpManagement)
                })
            })
            form2.button(`§aSet Location\n§7Set the warp to your current location`, 'textures/azalea_icons/main', (player) => {
                let dim = player.dimension.id
                let coords = player.location
                warps.setLocation(warp.id, coords, dim)
                player.success('Successfully set location to your location!')
                uiManager.open(player,config.uinames.warpManagement)
            })
            form2.button(`§4Delete\n§7Delete this warp`, '.azalea/SidebarTrash', (player) => {
                warps.del(warp.id)
                player.success('Successfully deleted warp!')
                uiManager.open(player, config.uinames.warpManagement)
            })
            form2.show(player)
        })
    }
    form.show(player)
})