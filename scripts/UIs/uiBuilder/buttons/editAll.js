import { ActionForm } from "../../../Libraries/form_func";
import config from "../../../config";
import uiBuilder from "../../../Modules/uiBuilder";
import { consts } from "../../../cherryUIConsts";
import uiManager from "../../../Libraries/uiManager";
import icons from "../../../Modules/icons";

uiManager.addUI(config.uinames.uiBuilder.buttons.editall, 'edit all buttons', (player,uiID)=>{
    let ui = uiBuilder.get(uiID)
    let form = new ActionForm();
    let u = ui.data
    let pre = ''
    if(u.layout == 0) pre = ''
    if(u.layout == 1) pre = '§f§u§l§l§s§c§r§e§e§n§r'
    if(u.layout == 2) pre = '§g§r§i§d§u§i§r'
    if(u.layout == 3) pre = '§t§e§s§t§r'
    if(u.layout == 4) pre = consts.tag
    if(u.theme) {
        pre = `${consts.themed}${u.theme}` + pre + `§r`
    }
    form.title(`${pre}${u.name}`)
    form.body(`Welcome to the §l§fVIEW BUTTONS MENU\n§r§dEdit buttons under here!`)
    if(u.layout == 4) {
        form.button(`${consts.disablevertical}${consts.left}§cBack\n§7Go back to UI`, icons.resolve('azalea/2'), (player)=>{
            uiManager.open(player,config.uinames.uiBuilder.edit,uiID)
        })
        form.button(`${consts.right}§aCreate\n§7Create a button`, icons.resolve('azalea/1'), (player)=>{
            uiManager.open(player,config.uinames.uiBuilder.buttons.create,uiID)
        })
    } else {
        form.button(`§cBack\n§7Go back to UI`, icons.resolve('azalea/2'), (player)=>{
            uiManager.open(player,config.uinames.uiBuilder.edit,uiID)
        })
        form.button(`§aCreate\n§7Create a button`, icons.resolve('azalea/1'), (player)=>{
            uiManager.open(player,config.uinames.uiBuilder.buttons.create,uiID)
        })
    }
    for(const button of u.buttons) {
        form.button(`${button.text}${button.subtext ? `\n§r§7${button.subtext}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player)=>{
            uiManager.open(player,config.uinames.uiBuilder.buttons.edit,uiID,button.id)
        })
    }
    form.show(player)
})