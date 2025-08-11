import { world, system } from '@minecraft/server'
import ranks from './Modules/ranks'
import formatter from './Formatting/formatter'
import modules from './Modules/modules'
import moment from './Libraries/moment'
import moderation from './Modules/moderation'
import playerStorage from './Libraries/playerStorage'
import events from './Modules/events'

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
        world.sendMessage(await formatter.format(`${modules.get('crf')}`, msg.sender, msg.message))
    })
}