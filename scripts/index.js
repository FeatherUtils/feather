import { world, system, ScriptEventSource, Player } from '@minecraft/server'
import './UIs/index'
import { prismarineDb } from './Libraries/prismarinedb'
import './Networking/currentNetworkingLib'
import config from './config'
import uiManager from './Libraries/uiManager'
import handleChat from './handleChat'
import modules from './Modules/modules'
import playerStorage from './Libraries/playerStorage'
import formatter from './Formatting/formatter'
import './Openers/form'
import './IconPacks/index'
import http from './Networking/currentNetworkingLib'

Player.prototype.error = function (msg) {
    this.sendMessage(`§c§lERROR§8 >>§r§7 ${msg}`)
}
Player.prototype.success = function (msg) {
    this.sendMessage(`§a§lSUCCESS§8 >>§r§7 ${msg}`)
}
Player.prototype.info = function (msg) {
    this.sendMessage(`§b§lINFO§8 >>§r§7 ${msg}`)
}

system.run(() => {
    world.sendMessage(`§d${config.info.name} §e- §b${config.info.versionString()} §e- §bLoaded!`)
    if(!prismarineDb.permissions.getRole('admin')) prismarineDb.permissions.createRole('admin')
    prismarineDb.permissions.setAdmin('admin', true)
})

world.beforeEvents.itemUse.subscribe(e => {
    system.run(() => {
        if (e.itemStack.typeId == `${config.config.ui}`) {
            if (e.source.isOp()) {
                if (!e.source.hasTag('admin')) {
                    e.source.addTag('admin');
                    if (e.source.hasTag('admin')) {
                        e.source.success('You have been granted admin privileges because you are already an operator.');
                        if(!prismarineDb.permissions.hasPermission(e.source, 'config')) return e.source.error('FATAL ERROR: COULD NOT FIND ADMIN ROLE. RESTART THE SERVER TO FIX THIS.')
                    } else {
                        e.source.error('Failed to automatically give "admin" tag.');
                    }
                } else {
                    if(!prismarineDb.permissions.hasPermission(e.source, 'config')) return e.source.error('FATAL ERROR: COULD NOT FIND ADMIN ROLE. RESTART THE SERVER TO FIX THIS.')
                }
            }
            uiManager.open(e.source, config.uinames.config.root);
        }
    });
});

system.runInterval(() => {
    for (const plr of world.getPlayers()) {
        plr.nameTag = `${formatter.format(`§r<bc>[§r{{joined_ranks}}§r<bc>]§r §r<nc><name>`, plr)}`   
    }
}, 20)

world.beforeEvents.playerLeave.subscribe(e => {
    playerStorage.saveData(e.player)
})

function betterArgs(myString) {
    var myRegexp = /[^\s"]+|"([^"]*)"/gi;
    var myArray = [];

    do {
        var match = myRegexp.exec(myString);
        if (match != null) {
            myArray.push(match[1] ? match[1] : match[0]);
        }
    } while (match != null);

    return myArray;
}

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (
        e.id.startsWith(config.config.openui) &&
        e.sourceType == ScriptEventSource.Entity &&
        e.sourceEntity.typeId == "minecraft:player"
    ) {
        let args = betterArgs(e.message);
        uiManager.open(e.sourceEntity, e.id.replaceAll(config.config.openui, ''), ...args.slice(1))
    }
    if (e.id == `blossom:run`) {
        commandManager.run(e)
    }
})

world.beforeEvents.chatSend.subscribe(e => {
    if(e.message.startsWith('.')) return;
    if (!modules.get('cr')) return;
    e.cancel = true;
    handleChat(e)
})