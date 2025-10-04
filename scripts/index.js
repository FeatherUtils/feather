import { world, system, ScriptEventSource, Player } from '@minecraft/server'
import communication from './communication'
communication.register('feather:pushToConfig', ({ args }) => {
    console.log(api.get().toString())
    system.run(async () => {
        await system.waitTicks(10)
        console.log(args[0])
        api.add(JSON.parse(args[0]))
    })
})
communication.register('feather:test', ({args}) => {
    system.run(() => {
        world.sendMessage(args.join(" "))
    })
})
import events from './Modules/events'
import './UIs/index'
import { prismarineDb } from './Libraries/prismarinedb'
import './Networking/currentNetworkingLib'
import config from './config'
import uiManager from './Libraries/uiManager'
import './customCommandHandler'
import handleChat from './handleChat'
import modules from './Modules/modules'
import playerStorage from './Libraries/playerStorage'
import formatter from './Formatting/formatter'
import moment from './Libraries/moment'
import './Openers/form'
import './IconPacks/index'
import moderation from './Modules/moderation'
import binding from './Modules/binding'
import sidebarEditor from './Modules/sidebarEditor'
import actionParser from './Modules/actionParser'
import api from './UIs/config/api'


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
    if (!prismarineDb.permissions.getRole('admin')) prismarineDb.permissions.createRole('admin')
    prismarineDb.permissions.setAdmin('admin', true)
})

world.afterEvents.playerSpawn.subscribe(e => {
    if(!e.initialSpawn) return;
    const ban = moderation.Database.findFirst({ type: 'BAN', player: e.player.id })
    if (ban) {
        world.getDimension('minecraft:overworld').runCommand(`kick "${e.player.name}" You are banned for ${moment(ban.data.time).fromNow()}.\nReason:\n${ban}`)
    }
    const warnings = moderation.Database.findDocuments({type:'WARNING',player:e.player.id})
    let warningsformatted = [];
    if(warnings.length > 0) {
        warningsformatted.push('-=-=-=-WARNINGS-=-=-=-')
        warningsformatted.push('')
    }
    let i = 0
    for(const warning of warnings) {
        i++
        warningsformatted.push(`Warning ${i}: ${warning.data.reason}`)
    }
    if(warningsformatted.length > 0) {
        e.player.sendMessage(warningsformatted.join('\n'))
    }
})

let btns = [];



world.beforeEvents.itemUse.subscribe(e => {
    for (const bind of binding.db.findDocuments()) {
        if (bind.data.typeID == e.itemStack.typeId) {
            e.cancel = true
            actionParser.runAction(e.source, bind.data.cmd)
        }
    }
    system.run(() => {
        if (e.itemStack.typeId == `${config.config.ui}`) {
            uiManager.open(e.source, config.uinames.config.root);
        }

    });
});

system.runInterval(async () => {
    for (const plr of world.getPlayers()) {
        plr.nameTag = `${await formatter.format(`§r<bc>[§r{{joined_ranks}}§r<bc>]§r §r<nc><name>`, plr)}`
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
    if (!modules.get('cr')) {
        let mute = moderation.Database.findFirst({ type: 'MUTE', player: e.sender.id })
        if (mute) return e.sender.sendMessage(`§cYou have been §4muted! §eReason: ${mute.data.reason}. Expires ${mute.data.time ? moment(mute.data.time).fromNow() : 'in forever'}`), e.cancel = true;
        return;
    }
    e.cancel = true;
    handleChat(e)
})