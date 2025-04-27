import { world, system } from '@minecraft/server'
import ranks from './Modules/ranks'
import formatter from './Formatting/formatter'
import modules from './Modules/modules'

export default function (msg) {
    system.run(() => {
        world.sendMessage(formatter.format(`${modules.get('crf')}`, msg.sender, msg.message))
    })
}