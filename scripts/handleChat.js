import { world, system } from '@minecraft/server'
import ranks from './Modules/ranks'
import formatter from './Formatting/formatter'
import modules from './Modules/modules'

export default function (msg) {
    system.run(() => {
        if(msg.message == '_PRINTDB') {
            let a = []
            for(const das of world.getDynamicPropertyIds()) {
                a.push(`${das} - ${world.getDynamicProperty(das)}`)
            }
            msg.sender.sendMessage(a.join('\n'))
        }
        world.sendMessage(formatter.format(`${modules.get('crf')}`, msg.sender, msg.message))
    })
}