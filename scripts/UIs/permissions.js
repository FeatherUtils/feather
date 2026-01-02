import uiManager from "../Libraries/uiManager";
import { ActionForm } from "../Libraries/form_func";
import { ModalFormData } from "@minecraft/server-ui";
import config from "../config";
import { consts } from "../cherryUIConsts";
import { prismarineDb } from "../Libraries/prismarinedb";

uiManager.addUI(config.uinames.permissions.root, 'Permissions', (player) => {
    let roles = prismarineDb.permissions.getRoles()
    let form = new ActionForm();
    form.title(consts.tag + 'Permissions')
    form.button(`§aCreate Role\n§7Create a role`, '.azalea/1', (player) => {
        uiManager.open(player,config.uinames.permissions.create)
    })
    for (const role of roles) {
        form.button(`${role.tag}§r§7\n[EDIT]`, role.isAdmin ? '.azalea/AdminPlayerIcon' : '.azalea/11', (player) => {
            uiManager.open(player,config.uinames.permissions.edit,role.tag)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.permissions.create,'permissions create', (player) => {
    let form = new ModalFormData();
    form.title(consts.modal + 'Create Role')
    form.textField('Tag', 'Example: mod')
    form.show(player).then((res) => {
        let[tag] = res.formValues;
        if(!tag) return player.error('Tag must be defined')
        prismarineDb.permissions.createRole(tag)
        player.success('Created role successfully')
        uiManager.open(player,config.uinames.permissions.root)
    })
})
uiManager.addUI(config.uinames.permissions.edit,'permissions edit', (player,tag) => {
    let role = prismarineDb.permissions.getRole(tag)
    if(!role) throw new Error('Invalid ID; if you see this without entering any shenanigans into a scriptevent, ask for help in the discord.')
    let form = new ActionForm();
    form.title(consts.tag + tag)
    form.button(`§cBack`, '.azalea/2', (player) => {
        uiManager.open(player,config.uinames.permissions.root)
    })
    form.button('§6Edit Permissions', '.azalea/11', (player) => {
        uiManager.open(player,config.uinames.permissions.editPermissions,tag)
    })
    if(!role.defaultAdmin && !role.default) {
        form.button(`§4Delete`, '.azalea/SidebarTrash', (player) => {
            prismarineDb.permissions.deleteRole(tag)
            uiManager.open(player,config.uinames.permissions.root)
            player.success('Deleted role successfully: ' + tag)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.permissions.editPermissions,'Edit role permissions', (player,tag) => {
    let form = new ModalFormData();
    let role = prismarineDb.permissions.getRole(tag)
    if(!role) throw new Error('Invalid ID; if you see this without entering any shenanigans into a scriptevent, ask for help in the discord.')
    let perms = config.permissions
    let getperms = role.data.permissions
    form.title(consts.modal + 'Edit Permissions')
    for(const perm of perms) {
        form.toggle(perm.display, {defaultValue: getperms.find(_=>_==perm.perm) ? true : false})
    }
    form.show(player).then((res) => {
    let fv = res.formValues;
    let roleperms = [];

    fv.forEach((v, i) => {
        if (v === true) {
            roleperms.push(perms[i].perm);
        }
    });

    prismarineDb.permissions.setPerms(tag, roleperms);
    player.sendMessage(`Set ${tag} permissions to: ${roleperms.join(', ')}`);
    uiManager.open(player, config.uinames.permissions.edit, tag);
});
})