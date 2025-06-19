import { ActionForm } from "../../Libraries/form_func";
import sidebarEditor from "../../Modules/sidebarEditor";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import { ModalFormData } from "@minecraft/server-ui";

uiManager.addUI(config.uinames.sidebarEditor.editline, 'edit line se', (player, sdid, id) => {
    let sd = sidebarEditor.get(sdid)
    if (!sd) return;
    let ln = sidebarEditor.getLine(sdid, id)
    if (!ln) return;
    let form = new ActionForm();
    form.title(`${consts.tag}§rView Line`)
    form.body(`Text: ${sidebarEditor.parseLine(sdid, id, player)}§r\nID: ${id}\n§rSidebar ID: ${sdid}`)
    form.button(`${consts.header}§cBack\n§7Go back to View Lines`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.sidebarEditor.viewlines, sdid)
    })
    form.button(`§eEdit Line\n§7Edit the text of this line`, `.azalea/Pencil`, (player) => {
        let form2 = new ModalFormData();
        form2.title(`Edit Line`)
        form2.textField(`Text`, `Example: My server!`, { defaultValue: ln.text })
        form2.show(player).then((res) => {
            let [text] = res.formValues
            if (!text) return player.error('Must enter text'), uiManager.open(player, config.uinames.sidebarEditor.editline, sdid, id);
            let status = sidebarEditor.editLine(sdid, id, text)
            if (!status) player.error('Something went wrong')
            uiManager.open(player, config.uinames.sidebarEditor.editline, sdid, id);
        })
    })
    form.button(`§aUP\n§7Move this line up`, `.blossom/upvote`, (player) => {
        sidebarEditor.moveLineInSidebar(sdid,id,'up')
        uiManager.open(player, config.uinames.sidebarEditor.editline, sdid, id);
    })
    form.button(`§4DOWN\n§7Move this line down`, `.blossom/downvote`, (player) => {
        sidebarEditor.moveLineInSidebar(sdid,id,'down')
        uiManager.open(player, config.uinames.sidebarEditor.editline, sdid, id);
    })
    form.button(`§cDelete\n§7Permenantly delete this line`, `textures/azalea_icons/SidebarTrash`, (player) => {
        function ye(player) {
            sidebarEditor.delLine(sdid, id)
            uiManager.open(player, config.uinames.sidebarEditor.viewlines, sdid)
        }
        function nah(player) {
            uiManager.open(player, config.uinames.sidebarEditor.editline, sdid, id)
        }
        uiManager.open(player, config.uinames.basic.confirmation, 'Are you sure you want to delete this line?', ye, nah)
    })
    form.show(player)
})
