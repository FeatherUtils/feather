import { consts } from "../cherryUIConsts";
import { ActionForm } from "../Libraries/form_func";
import icons from "../Modules/icons";
import uiBuilder from "../Modules/uiBuilder";
import actionParser from "../Modules/actionParser";
import { system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe(e => {
    if(e.id != 'feather:open') return;
    let ui = uiBuilder.db.findFirst({scriptevent:e.message})
    if(!ui) return e.sourceEntity.error('UI not found');
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
    form.title(pre + u.name)
    if(u.body) {
        form.body(u.body)
    }
    if(u.buttons.length < 1) {
        form.button(`§cClose UI`, icons.resolve('azalea/2'))
    }
    for(const button of u.buttons) {
        if(button.requiredTag) {
            if(!e.sourceEntity.hasTag(button.requiredTag)) continue;
        }
        form.button(`${button.text}${button.subtext ? `\n§r§7${button.subtext}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player)=>{
            for(const action of button.actions) {
                actionParser.runAction(e.sourceEntity, action)
            }
        })
    }
    form.show(e.sourceEntity)
})