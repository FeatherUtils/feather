import { ActionForm } from "../../../Libraries/form_func";
import config from "../../../config";
import uiBuilder from "../../../Modules/uiBuilder";
import { consts } from "../../../cherryUIConsts";
import uiManager from "../../../Libraries/uiManager";
import icons from "../../../Modules/icons";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import preview from "../../../preview";

uiManager.addUI(config.uinames.uiBuilder.buttons.edit, 'edit button', (player, uiID, id) => {
    let b = uiBuilder.getButton(uiID, id)
    if (!b) return player.error(`No button found`);
    let form = new ActionForm();
    form.title(`${consts.tag}§bEdit Button: ${b.text}`)
    form.button(`${consts.header}§r§cBack\n§7Go back to edit all buttons`, icons.resolve('azalea/2'), (player) => {
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID)
    })
    if (b.type === 'button') {
        form.button(`§aEdit Actions\n§7Edit this button's actions`, icons.resolve('azalea/CustomCommands2'), (player) => {
            uiManager.open(player, config.uinames.uiBuilder.buttons.editActions, uiID, id)
        })
        form.button(`§eEdit Meta\n§7Make the button behave differently`, icons.resolve('azalea/ExtIcon'), (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}§rEdit Meta`)
            form2.button(`${!b.meta ? `${consts.alt}§rNo meta` : `§rNo meta`}\n§7Remove meta`, icons.resolve('azalea/Delete'), (player) => {
                uiBuilder.meta(uiID, id, null)
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
            form2.button(`${b.meta === 'warp' ? `${consts.alt}§rWarps` : `§rWarps`}\n§7Warps list (<warpname>)`, icons.resolve('azalea/WarpEditor'), (player) => {
                uiBuilder.meta(uiID, id, 'warp')
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
            form2.button(`${b.meta === 'playerlist' ? `${consts.alt}§rPlayer List` : `§rPlayer List`}\n§7Player list (<name2>)`, icons.resolve('azalea/8-old'), (player) => {
                uiBuilder.meta(uiID, id, 'playerlist')
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
            form2.button(`${b.meta === 'buybutton' ? `${consts.alt}§rBuy Button` : `§rBuy Button`}\n§7Buy Button (adds settings)`, icons.resolve('vanilla/emerald'), (player) => {
                uiBuilder.meta(uiID, id, 'buybutton')
                if (!b.buyButtonSettings) uiBuilder.buyButtonSettings(uiID, id, { price: '0', item: null, scoreboard: 'money' })
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
            form2.button(`${b.meta === 'sellbutton' ? `${consts.alt}§rSell Button` : `§rSell Button`}\n§7Sell Button (adds settings)`, icons.resolve('vanilla/diamond'), (player) => {
                uiBuilder.meta(uiID, id, 'sellbutton')
                if (!b.sellButtonSettings) uiBuilder.sellButtonSettings(uiID, id, { price: '0', item: null, scoreboard: 'money' })
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
            form2.show(player)
        })
        if (b.meta === 'buybutton') {
            form.button(`§aBuy Button Settings\n§7Configure buy button`, `.vanilla/emerald`, (player) => {
                let form2 = new ModalFormData();
                form2.title('Buy Button Settings')
                form2.textField('Price', `Example: 50`, { defaultValue: b.buyButtonSettings.price })
                form2.textField('Scoreboard', `Example: money`, { defaultValue: b.buyButtonSettings.scoreboard })
                form2.textField('Item', `Example: minecraft:wheat`, { defaultValue: b.buyButtonSettings.item ?? null })
                form2.show(player).then((res) => {
                    let [price, scoreboard, item] = res.formValues;
                    if (isNaN(+price)) return player.error('Price is not a number')
                    if (!item) item = null
                    uiBuilder.buyButtonSettings(uiID, id, { price, scoreboard, item })
                    uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id)
                })
            })
        }
        if (b.meta === 'sellbutton') {
            form.button(`§aSell Button Settings\n§7Configure sell button`, `.vanilla/diamond`, (player) => {
                let form2 = new ModalFormData();
                form2.title('Sell Button Settings')
                form2.textField('Price', `Example: 50`, { defaultValue: b.sellButtonSettings.price })
                form2.textField('Scoreboard', `Example: money`, { defaultValue: b.sellButtonSettings.scoreboard })
                form2.textField('Item', `Example: minecraft:wheat`, { defaultValue: b.sellButtonSettings.item ?? null })
                form2.show(player).then((res) => {
                    let [price, scoreboard, item] = res.formValues;
                    if (isNaN(+price)) return player.error('Price is not a number')
                    if (!item) item = null
                    uiBuilder.sellButtonSettings(uiID, id, { price, scoreboard, item })
                    uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id)
                })
            })
        }
        form.button(`§bEdit Icon\n§7Edit icon of this Button`, b.icon ? icons.resolve(b.icon) : null, (player) => {
            function callback(player, icon) {
                let ui2 = uiID
                let id2 = id
                uiBuilder.buttonIcon(ui2, id2, icon)
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, ui2, id2)
            }
            uiManager.open(player, config.uinames.basic.iconViewer, 0, callback)
        })
        form.button(`§6Edit Values\n§7Edit values of button`, icons.resolve(`azalea/Extra UI settings`), (player) => {
            let form2 = new ModalFormData();
            form2.title('Create Button')
            if (preview) form2.label('§c* §e- §rRequired')
            form2.textField('Text§c*', `This button's text`, { defaultValue: b.text })
            form2.textField('Subtext', `This button's subtext`, { defaultValue: b.subtext })
            form2.textField(`Required Tag`, `Required tag of this button`, { defaultValue: b.requiredTag })
            form2.show(player).then((res) => {
                console.log(res.formValues)
                let [a, text, subtext, requiredTag] = res.formValues
                if (!text) return player.error('Please enter text'), uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);

                uiBuilder.editButton(uiID, id, text, subtext, requiredTag, b.icon);
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, id);
            })
        })
    }
    if (b.type == 'header' || b.type == 'label') {
        form.button(`§eEdit Header/Label\n§7Edit this header/label's text`, `.azalea/ClickyClick`, (player) => {
            let form2 = new ModalFormData();
            form2.title(`Code Editor`)
            form2.textField(`Code`, 'Enter text..', { defaultValue: b.text })
            form2.show(player).then((res) => {
                let [code] = res.formValues
                if (!code) return player.error('Enter text :<');
                uiBuilder.editHeaderorLabel(uiID, b.id, code)
                uiManager.open(player, config.uinames.uiBuilder.buttons.edit, uiID, b.id);
            })
        })
    }
    form.button(`${consts.left}${consts.disablevertical}§r§aUP`, `.blossom/upvote`, (player) => {
        uiBuilder.moveButtonInUI(uiID, id, 'up')
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
    })
    form.button(`${consts.right}§r§cDOWN`, `.blossom/downvote`, (player) => {
        uiBuilder.moveButtonInUI(uiID, id, 'down')
        uiManager.open(player, config.uinames.uiBuilder.buttons.editall, uiID);
    })
    form.button(`§cDelete Item\n§7Delete this item`, icons.resolve(`azalea/SidebarTrash`), (player) => {
        function ye(player) {
            let id1 = uiID
            let id2 = id
            uiBuilder.deleteButton(id1, id2)
            uiManager.open(player, config.uinames.uiBuilder.buttons.editall, id1)
        }
        function nah(player) {
            let id1 = uiID
            let id2 = id
            uiManager.open(player, config.uinames.uiBuilder.buttons.edit, id1, id2)
        }
        uiManager.open(player, config.uinames.basic.confirmation, 'Are you sure you want to delete this item?', ye, nah)
    })
    form.show(player)
})