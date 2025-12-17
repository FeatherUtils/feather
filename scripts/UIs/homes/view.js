import homes from "../../Modules/homes";
import { ActionForm } from "../../Libraries/form_func";
import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import playerStorage from "../../Libraries/playerStorage";
import { system, world } from "@minecraft/server";

uiManager.addUI(config.uinames.homes.view, 'View homes', (player, id, shared = false) => {
    let home = homes.db.getByID(id)
    let owner = playerStorage.getPlayerByID(home.data.plrid)
    let form = new ActionForm();
    if (shared) {
        form.title(`${consts.tag}@${owner.name}'s home`)
        form.label(`§6Name: ${home.data.name}`)
        form.label(`§aOwner: ${owner.name}`)
    } else {
        form.title(`${consts.tag}${home.data.name}`)
        form.label(`§aOwner: You`)
    }
    form.label(`§aX: ${Math.floor(home.data.loc.pos.x)} §eY: ${Math.floor(home.data.loc.pos.y)} §7Z: ${Math.floor(home.data.loc.pos.z)}`)
    form.divider()
    form.button(`§cBack\n§7Go back to homes list`, 'textures/azalea_icons/2', (player) => {
        uiManager.open(player, config.uinames.homes.root, shared)
    })
    form.button(`§6Teleport\n§7Teleport to this home`, 'textures/items/ender_pearl', async (player) => {
        let tp = await homes.tp(player, id)
        if (tp === false) return uiManager.open(player, config.uinames.homes.view, id, shared);
        player.success('Teleported to home')
    })
    if (!shared) {
        form.button(`§eEdit\n§7Edit this home's name`, 'textures/blossom_icons/edit', (player) => {
            let form2 = new ModalFormData();
            form2.title('Edit name')
            form2.textField(`Name`, `Example: Base`, { defaultValue: `${home.data.name}` })
            form2.show(player).then((res) => {
                let [name] = res.formValues;
                if (!name) return player.error('No name given');
                if (player.name != owner.name) return player.error(`You can't change the name of this home, silly!`);
                homes.editName(player, id, name)
                uiManager.open(player, config.uinames.homes.view, id, shared);
            })
        })
        form.button(`§4Delete\n§7Delete this home`, `textures/azalea_icons/SidebarTrash`, (player) => {
            if (player.name != owner.name) return player.error(`You can't delete this home, silly!`);
            function yuh(player) {
                homes.del(id)
                uiManager.open(player, config.uinames.homes.root, shared);
            }
            function nuhnuh(player) {
                uiManager.open(player, config.uinames.homes.view, id, shared);
            }
            uiManager.open(player, config.uinames.basic.confirmation, `Do you want to delete the home "${home.data.name}"`, yuh, nuhnuh)
        })
        form.button(`§5Share\n§7Share this home to other people`, `textures/azalea_icons/8-old`, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§rShare Home`)
            form2.button(`${consts.header}§cBack`, `textures/azalea_icons/2`, (player) => {
                uiManager.open(player, config.uinames.homes.view, id, shared);
            })
            for (const plr of world.getPlayers()) {
                if (home.data.shares.find(_ => playerStorage.getID(plr) === _)) continue;
                if (plr.name === player.name) continue;
                form2.button(`§e${plr.name}`, `textures/azalea_icons/8-old`, (player) => {
                    homes.share(home.id,plr)
                    uiManager.open(player, config.uinames.homes.view, id, shared);
                })
            }
            form2.show(player)
        })
        form.button(`§3Unshare\n§7Remove shares from this home`, `textures/azalea_icons/Delete`, async (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§rUnshare Home`)
            form2.button(`${consts.header}§cBack`, `textures/azalea_icons/2`, (player) => {
                uiManager.open(player, config.uinames.homes.view, id, shared);
            })
            for (const plrid of home.data.shares) {
                let plr = await playerStorage.getPlayerByID(plrid)
                await system.waitTicks(20)
                if(!plr) continue;
                if (plr.name === player.name) continue;
                form2.button(`§c${plr.name}`, `textures/azalea_icons/8-old`, (player) => {
                    homes.removeShare(id,plrid)
                    uiManager.open(player, config.uinames.homes.view, id, shared);
                })
            }
            form2.show(player)
        })
    }
    form.show(player)
})