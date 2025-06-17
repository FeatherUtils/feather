import { consts } from "../cherryUIConsts";
import { ActionForm } from "../Libraries/form_func";
import icons from "../Modules/icons";
import uiBuilder from "../Modules/uiBuilder";
import actionParser from "../Modules/actionParser";
import { system, world } from "@minecraft/server";
import warps from "../Modules/warps";
import formatter from "../Formatting/formatter";

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id != 'feather:open') return;
    let ui = uiBuilder.db.findFirst({ scriptevent: e.message })
    if (!ui) return e.sourceEntity.error('UI not found');
    let form = new ActionForm();
    let u = ui.data
    let pre = ''
    if (u.layout == 0) pre = ''
    if (u.layout == 1) pre = '§f§u§l§l§s§c§r§e§e§n§r'
    if (u.layout == 2) pre = '§g§r§i§d§u§i§r'
    if (u.layout == 3) pre = '§t§e§s§t§r'
    if (u.layout == 4) pre = consts.tag
    if (u.theme) {
        pre = `${consts.themed}${u.theme}` + pre + `§r`
    }
    form.title(pre + u.name)
    if (u.body) {
        form.body(u.body)
    }
    if (u.buttons.length < 1) {
        form.button(`§cClose UI`, icons.resolve('azalea/2'))
    }
    for (const button of u.buttons) {
        let rqt = formatter.format(button.requiredTag, e.sourceEntity)
        if (button.meta === 'warp') {
            for (const warp of warps.db.findDocuments()) {
                let rqtf = rqt.replaceAll('<warpname>', warp.data.name)
                if (rqtf) {
                    if (!e.sourceEntity.hasTag(rqtf) && !rqtf.startsWith('!')) continue;
                    if (e.sourceEntity.hasTag(rqtf) && rqtf.startsWith('!')) continue;
                }
                form.button(`${formatter.format(button.text.replaceAll('<warpname>', warp.data.name), e.sourceEntity)}${button.subtext ? `\n§r§7${formatter.format(button.subtext.replaceAll('<warpname>', warp.data.name), e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player) => {
                    for (const action of button.actions) {
                        actionParser.runAction(e.sourceEntity, formatter.format(action.action.replaceAll('<warpname>', warp.data.name),e.sourceEntity))
                    }
                })
            }
            continue;
        }
        if (button.meta === 'playerlist') {
            for (const plr of world.getPlayers()) {
                let rqtf = rqt.replaceAll('<name2>', plr.name)
                if (rqtf) {
                    if (!e.sourceEntity.hasTag(rqtf) && !rqtf.startsWith('!')) continue;
                    if (e.sourceEntity.hasTag(rqtf) && rqtf.startsWith('!')) continue;
                }
                form.button(`${formatter.format(button.text.replaceAll('<name2>', plr.name), e.sourceEntity)}${button.subtext ? `\n§r§7${formatter.format(button.subtext.replaceAll('<name2>', plr.name), e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player) => {
                    for (const action of button.actions) {
                        actionParser.runAction(e.sourceEntity, formatter.format(action.action.replaceAll('<name2>', plr.name), e.sourceEntity))
                    }
                })
            }
            continue;
        }
        if (button.requiredTag) {
            if (!e.sourceEntity.hasTag(button.requiredTag) && !button.requiredTag.startsWith('!')) continue;
            if (e.sourceEntity.hasTag(button.requiredTag) && button.requiredTag.startsWith('!')) continue;
        }
        form.button(`${formatter.format(button.text, e.sourceEntity)}${button.subtext ? `\n§r§7${formatter.format(button.subtext, e.sourceEntity)}` : ''}`, button.icon ? icons.resolve(button.icon) : null, (player) => {
            for (const action of button.actions) {
                actionParser.runAction(e.sourceEntity, formatter.format(action.action,e.sourceEntity))
            }
        })
    }
    form.show(e.sourceEntity)
})