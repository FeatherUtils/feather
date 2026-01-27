import events from "../Modules/events";
import { ActionForm } from "../Libraries/form_func";
import config from "../config";
import { consts } from '../cherryUIConsts'
import uiManager from "../Libraries/uiManager";
import { ModalFormData } from "@minecraft/server-ui";

let icons = {
    "CHAT": "textures/feather_icons/chat",
    "RANDOMNUMBER": "textures/feather_icons/rng",
    "KILL": "textures/blossom_icons/sword",
    "PLACEBLOCK": "textures/blocks/stone",
    "BREAKBLOCK": "textures/items/diamond_pickaxe",
    "JOIN": "textures/azalea_icons/1",
    "DEATH": "textures/blossom_icons/sword"
}

uiManager.addUI(config.uinames.events.root, 'ev root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}Events`)
    form.button(`${consts.header}§cBack\n§7Go back to config ui`, `.azalea/2`, (player) => {
        player.runCommand('open @s config_world')
    })
    form.button(`§aAdd\n§7Add a new event`, '.azalea/1', (player) => {
        uiManager.open(player, config.uinames.events.add)
    })
    for (const ev of events.db.findDocuments()) {
        if (ev.data.type == '__keyval__') continue;
        form.button(`${ev.data.identifier}\n§7${ev.data.type} EVENT`, icons[ev.data.type] ?? null, (player) => {
            uiManager.open(player, config.uinames.events.edit, ev.id)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.events.add, 'events add', (player) => {
    let form = new ModalFormData();
    let types = ['KILL', 'DEATH', 'JOIN', 'CHAT', 'RANDOMNUMBER', 'PLAYERKILLENTITY', 'ENTITYDEATH', 'BREAKBLOCK', 'PLAYERHITENTITY', 'PLAYERINTERACTWITHBLOCK', 'PLACEBLOCK', 'PLAYERINTERACTWITHPLAYER', 'PLAYERHITPLAYER', 'WEATHERCHANGE', 'GAMEMODECHANGE']
    form.title(`Add Event`)
    form.textField(`Identifier`, `Example: Kill Scoreboard`, { tooltip: 'This is purely just for you to see on the events ui so you know what you are editing' })
    form.dropdown(`Type`, types, { tooltip: 'What will trigger the event' })
    form.show(player).then((res) => {
        let [iden, typei] = res.formValues;
        if (!iden) return player.error('Identifier required');
        let type = types[typei]
        events.add(iden, type)
        uiManager.open(player, config.uinames.events.root)
    })
})
uiManager.addUI(config.uinames.events.edit, 'edit ev', async (player, id) => {
    let ev = events.db.getByID(id)
    if (!ev) return;
    let form = new ActionForm();
    form.title(`${consts.tag}Edit Event`)
    if (ev.data.type == 'PLACEBLOCK' || ev.data.type == 'BREAKBLOCK') {
        form.body(`Use <typeID> to get the blocks type id (example: minecraft:diamond_ore)`)
        form.button(`§aBlock Options\n§7Options for block event`, '.vanilla/diamond_pickaxe', (player) => {
            let st = ev.data.settings?.block ?? 'ALL'
            let form2 = new ModalFormData();
            form2.title(`Block Options`)
            form2.label('Type ALL in the block field to get all blocks')
            form2.textField(`Block`, `minecraft:stone`, { defaultValue: st })
            form2.show(player).then((res) => {
                let [label, block] = res.formValues;
                if (!block) return player.error('One of the fields are undefined');
                events.editSettings(ev.id, { block })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'PLAYERINTERACTWITHPLAYER') {
        form.body(`Use <name2> in actions to get the player that was interacted with's name. Normal formatting still applies for the main player. The commands are run as the main player.`)
    }
    if (ev.data.type == 'PLAYERHITPLAYER') {
        form.body(`Use <name2> in actions to get the player that was hit's name. Normal formatting still applies for the main player. The commands are run as the main player.`)
    }
    if (ev.data.type == 'RANDOMNUMBER') {
        let num = await events.randomNumberKeyval.get(`${ev.data.identifier}`) ?? '0'
        form.body(
            `How to use random numbers\nYou can trigger this random number event by running\n/scriptevent feather:trigger_event ${ev.data.identifier}\nCurrent number: ${num}\nYou can retrieve the random number in UIs or any place formatting is avaliable by typing <event_rng:${ev.data.identifier}>`
        )
        form.button(`§aRandom Number Options\n§7Options for random number event`, '.feather/rng', (player) => {
            let st = `${ev.data.settings?.startingNumber}` ?? '0'
            if (st == undefined) st = '0'
            let en = `${ev.data.settings?.endingNumber}` ?? '0'
            if (en == undefined) en = '0'
            let form2 = new ModalFormData();
            form2.title(`RNG Options`)
            form2.textField(`Starting number`, `0`, { defaultValue: st })
            form2.textField(`Ending number`, `100`, { defaultValue: en })
            form2.show(player).then((res) => {
                let [startingNumber, endingNumber] = res.formValues;
                if (isNaN(+startingNumber) || isNaN(+endingNumber)) return player.error('One of the fields are Not a Number');
                events.editSettings(ev.id, { startingNumber: +startingNumber, endingNumber: +endingNumber })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'PLAYERINTERACTWITHBLOCK') {
        form.body('Formatting: <blockx> <blocky> <blockz> <blockTypeID>\nWARNING: ONLY WORKS WITH BLOCKS LIKE SIGNS OR BUTTONS')
        form.button(`§aBlock Interact Options\n§7Options for block interact event`, 'textures/blocks/stone', (player) => {
            let form2 = new ModalFormData();
            form2.title(`Block Interact Options`)
            form2.textField(`TypeID`, `Leave blank for no specified block`, { defaultValue: ev.data.settings?.typeId })
            form2.textField(`X`, `X coordinate`, { defaultValue: `${ev.data.settings?.x || ''}`})
            form2.textField(`Y`, `Y coordinate`, { defaultValue: `${ev.data.settings?.y || ''}`})
            form2.textField(`Z`, `Z coordinate`, { defaultValue: `${ev.data.settings?.z || ''}`})
            form2.show(player).then((res) => {
                if (res.canceled) return;

                const [tid, x, y, z] = res.formValues;

                if (x || y || z) {
                    if (isNaN(Number(x)) || isNaN(Number(y)) || isNaN(Number(z))) {
                        player.sendMessage('§cOne of the coordinate fields is not a number!');
                        return;
                    }
                }

                events.editSettings(ev.id, {
                    typeId: tid || undefined,
                    x: x ? Number(x) : undefined,
                    y: y ? Number(y) : undefined,
                    z: z ? Number(z) : undefined
                });

                uiManager.open(player, config.uinames.events.edit, ev.id);
            })
        })
    }
    if (ev.data.type == 'GAMEMODECHANGE') {
        form.body(`Available formatting: <fromgamemode>, <togamemode>`)
    }
    if (ev.data.type == 'WEATHERCHANGE') {
        form.body(`Available formatting: <weathertype>`)
        form.button(`§eWeather Options\n§7Options for weather event`, '.azalea/Settings', (player) => {
            let weathertypes = ['Any', 'Clear', 'Rain', 'Thunder']
            let nw;
            if (!ev.data.settings) nw = 'Any'
            if (ev.data.settings) nw = ev.data.settings.newWeather;
            let currentweathertype = weathertypes.findIndex(_ => _ === nw)
            let form2 = new ModalFormData();
            form2.title('Weather Options')
            form2.dropdown('New weather (If changes to this weather it will run)', weathertypes, { defaultValueIndex: currentweathertype })
            form2.show(player).then((res) => {
                let [newWeatherIndex] = res.formValues;
                let newWeather = weathertypes[newWeatherIndex]
                events.editSettings(ev.id, { newWeather })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'PLAYERHITENTITY') {
        form.body(`Available formatting: <typeID>`)
        form.button(`§eHit Entity Options\n§7Options for hit entity event`, '.azalea/Settings', (player) => {
            let form2 = new ModalFormData();
            form2.title('Hit Entity Options')
            form2.textField('Type id', 'minecraft:zombie', { defaultValue: ev.data.settings?.typeId || '' })
            form2.show(player).then((res) => {
                let [tid] = res.formValues;
                events.editSettings(ev.id, { typeId:tid })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'PLAYERKILLENTITY') {
        form.body(`Available formatting: <typeID>`)
        form.button(`§eKill Entity Options\n§7Options for kill entity event`, '.azalea/Settings', (player) => {
            let form2 = new ModalFormData();
            form2.title('kill Entity Options')
            form2.textField('Type id', 'minecraft:zombie', { defaultValue: ev.data.settings?.typeId || '' })
            form2.show(player).then((res) => {
                let [tid] = res.formValues;
                events.editSettings(ev.id, { typeId:tid })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'ENTITYDEATH') {
        form.body(`Available formatting: <typeID>`)
        form.button(`§eEntity Die Options\n§7Options for death entity event`, '.azalea/Settings', (player) => {
            let form2 = new ModalFormData();
            form2.title('death Entity Options')
            form2.textField('Type id', 'minecraft:zombie', { defaultValue: ev.data.settings?.typeId || '' })
            form2.show(player).then((res) => {
                let [tid] = res.formValues;
                events.editSettings(ev.id, { typeId:tid })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    if (ev.data.type == 'CHAT') {
        form.button(`§aChat Options\n§7Options for chat event`, '.feather/chat', (player) => {
            let msg = `${ev.data.settings?.message}`
            if (msg == `undefined`) msg = '!test'
            let en = ev.data.settings?.cancel ?? false
            if (en == undefined) en = false
            let en3 = ev.data.settings?.closeChat ?? false
            if (en3 == undefined) en3 = false
            let form2 = new ModalFormData();
            form2.title(`Chat Options`)
            form2.textField(`Message`, `!test`, { defaultValue: msg })
            form2.toggle(`Cancel`, { defaultValue: en })
            form2.toggle(`Close Chat`, { defaultValue: en3 })
            form2.show(player).then((res) => {
                let [msg2, en2, en4] = res.formValues;
                if (!msg2) return player.error('Please enter a message');
                events.editSettings(ev.id, { message: msg2, cancel: en2, closeChat: en4 })
                uiManager.open(player, config.uinames.events.edit, ev.id)
            })
        })
    }
    form.button(`${consts.header}§cBack\n§7Go back to events ui`, `.azalea/2`, (player) => {
        uiManager.open(player, config.uinames.events.root)
    })
    if (events.allowedActionTypes.find(_ => _ === ev.data.type)) {
        form.button(`§eEdit Actions\n§7Edit actions of this event`, '.azalea/ClickyClick', (player) => {
            uiManager.open(player, config.uinames.events.editactions, id)
        })
    }
    form.button(`§cDelete\n§7Delete this event and all it's actions`, `.azalea/SidebarTrash`, (player) => {
        events.remove(ev.id)
        uiManager.open(player, config.uinames.events.root)
    })
    form.show(player)
})
uiManager.addUI(config.uinames.events.editactions, 'editactions ev', (player, id) => {
    let ev = events.db.getByID(id)
    if (!ev) return;
    let form = new ActionForm();
    form.title(`${consts.tag}Edit Event Actions`)
    form.button(`${consts.header}§cBack\n§7Go back to event ui`, `.azalea/2`, (player) => {
        uiManager.open(player, config.uinames.events.edit, id)
    })
    form.button(`§aAdd\n§7Add action to event`, `.azalea/1`, (player) => {
        let form3 = new ModalFormData();
        form3.title('Code Editor')
        form3.textField(`Code`, `Add action..`)
        form3.show(player).then((res) => {
            let [ac] = res.formValues;
            if (!ac) return player.error('Enter an action');
            events.addAction(ev.id, ac, ev.data.type)
            uiManager.open(player, config.uinames.events.editactions, id)
        })
    })
    for (const action of ev.data.actions) {
        form.button(`§r${action.action}`, null, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}Action`)
            form2.button(`${consts.header}§cBack\n§7Go back to event actions ui`, `.azalea/2`, (player) => {
                uiManager.open(player, config.uinames.events.editactions, id)
            })
            form2.button(`§eEDIT`, null, (player) => {
                let form3 = new ModalFormData();
                form3.title('Code Editor')
                form3.textField(`Code`, `Edit action..`, { defaultValue: action.action })
                form3.show(player).then((res) => {
                    let [ac] = res.formValues;
                    if (!ac) return player.error('Enter an action');
                    events.editAction(ev.id, action.id, ac)
                    uiManager.open(player, config.uinames.events.editactions, id)
                })
            })
            form2.button(`§cDELETE`, null, (player) => {
                events.removeAction(ev.id, action.id)
                uiManager.open(player, config.uinames.events.editactions, id)
            })
            form2.show(player)
        })
    }
    form.show(player)
})
