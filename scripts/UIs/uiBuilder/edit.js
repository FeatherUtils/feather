import { ModalFormData } from "@minecraft/server-ui";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import icons from "../../Modules/icons";
import uiBuilder from "../../Modules/uiBuilder";
import { consts } from "../../cherryUIConsts";
import config from "../../config";
import { themes } from "../../cherryThemes";

uiManager.addUI(config.uinames.uiBuilder.edit, 'UI Builder Edit UI', (player, id) => {
    let form = new ActionForm();
    let ui = uiBuilder.get(id)
    if (!ui) return uiManager.open(player, config.uinames.uiBuilder.root);
    let pre = ``
    if(ui.data.theme) {
        pre = `${consts.themed}${ui.data.theme}`
    }
    form.title(`${pre}${consts.tag}§rEdit UI`)
    if(ui.data.layout == 3) {
        form.body(`Warning: Body doesn't work in Player Model UIs`)
    }
    form.button(`${consts.header}§r§cBack\n§7Go back to UI Builder`, `textures/azalea_icons/2`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.button(`${consts.header}§r§bIcon\n§7Edit UI Icon`, `${ui.data.icon ?? 'textures/azalea_icons/ClickyClick'}`, (player) => {
        function callback(player, icon) {
            let id2 = id
            uiBuilder.uiIcon(id2, icons.resolve(icon))
            uiManager.open(player, config.uinames.uiBuilder.edit, id2)
        }
        uiManager.open(player, config.uinames.basic.iconViewer, 0, callback)
    })
    form.button(`${consts.disablevertical}${consts.left}§r§dEdit Form\n§7Edit display, more`, `textures/azalea_icons/EditUi`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.create, id)
    })
    form.button(`${consts.right}§r§dEdit Buttons\n§7Configure buttons`, `textures/azalea_icons/ClickyClick`, (player) => {
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, id)
    })
    form.button(`§aEdit Body\n§7Edit the body of this ui`, `textures/blossom_icons/edit`, (player) => {
        let form2 = new ModalFormData();
        form2.title('Code Editor')
        form2.textField(`Body`, `Enter body here..`, ui.data.body)
        form2.show(player).then((res) => {
            let [body] = res.formValues
            uiBuilder.edit(id,ui.data.name,body,ui.data.scriptevent,ui.data.layout)
            uiManager.open(player, config.uinames.uiBuilder.edit, id)
        })
    })
    if(ui.data.layout === 4) {
        form.button(`§9Edit Theme\n§7Edit the theme of this UI`, icons.resolve('azalea/RainbowPaintBrush'), (player)=>{
            let form = new ActionForm();
            form.title(`${consts.tag}§rTheme`)
            form.button(`${consts.header}§cBack\n§7Go back to UI`, icons.resolve('azalea/2'), (player)=>{
                uiManager.open(player, config.uinames.uiBuilder.edit, id)
            })
            for(const theme of themes) {
                form.button(`${theme[1]}`, theme[2], (player)=>{
                    uiBuilder.editTheme(id,theme[0])
                    uiManager.open(player, config.uinames.uiBuilder.edit, id)
                })
            }
            form.show(player)
        })
    }
    form.button(`§bTrash\n§7Send this UI to the Trash`, `textures/azalea_icons/SidebarTrash`, (player) => {
        uiBuilder.delete(id)
        uiManager.open(player, config.uinames.uiBuilder.root)
    })
    form.show(player)
})