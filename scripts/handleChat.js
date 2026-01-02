import { world, system } from '@minecraft/server'
import ranks from './Modules/ranks'
import formatter from './Formatting/formatter'
import modules from './Modules/modules'
import moment from './Libraries/moment'
import moderation from './Modules/moderation'
import playerStorage from './Libraries/playerStorage'
import events from './Modules/events'
import { prismarineDb } from './Libraries/prismarinedb'

export default function (msg) {
    system.run(async () => {
        let mute = moderation.Database.findFirst({ type: 'MUTE', player: playerStorage.getID(msg.sender) })
        if (mute) return msg.sender.sendMessage(`§cYou have been §4muted! §eReason: ${mute.data.reason}. Expires ${mute.data.time ? moment(mute.data.time).fromNow() : 'in forever'}`);
        let chatevents = events.db.findDocuments({ type: 'CHAT' })
        for (const ev of chatevents) {
            if (!ev.data.settings) continue;
            if (await formatter.format(ev.data.settings?.message,msg.sender) == msg.message) {
                if (ev.data.settings?.cancel == true) return;
            }
        }
        if (msg.message == '_PRINTDB') {
            let a = []
            for (const das of world.getDynamicPropertyIds()) {
                a.push(`${das} - ${world.getDynamicProperty(das)}`)
            }
            msg.sender.sendMessage(a.join('\n'))
        }
        let isDevMode = modules.get('devMode')
        let bp = false;
        if(!isDevMode) bp = prismarineDb.permissions.hasPermission(msg.sender,'bypassAntiSpam')
        if(modules.get('antiSpam') == true && bp == false) {
            let spamSeconds = +modules.get('antiSpamSeconds') ?? 3
            let spamSecondsinMs = spamSeconds * 1000
            let lastMessageDate = msg.sender.getDynamicProperty('lastMessageTime') ?? 0
            let allowedDate = lastMessageDate + spamSecondsinMs
            let now = Date.now()
            const diffMs = allowedDate - now;
            if(!(Date.now() > lastMessageDate + spamSecondsinMs)) {
                return msg.sender.error(modules.get('antiSpamMessage').replace('{s}', moment.duration(diffMs).seconds()) ?? 'Spamming is not allowed on the server. Cooldown: ' + moment.duration(diffMs).seconds() + 's')
            }
        }
        msg.sender.setDynamicProperty('lastMessageTime', Date.now())
        world.sendMessage(await formatter.format(`${modules.get('crf')}`, msg.sender, msg.message))
    })
}