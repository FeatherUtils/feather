import * as mc from '@minecraft/server';
import * as ui from '@minecraft/server-ui'
class ActionParser {
    runAction(player, action) {
        mc.system.run(() => {
            let command = action.startsWith('/') ? action.substring(1) : action;
            if (command.startsWith('js ')) {
                eval(`(({mc, ui})=>{${command.substring('js '.length)}})`)({ mc, ui })
                return;
            }
            try {
                player.runCommand(command);
            } catch (e) {
                player.error(`${e.message}`)
            }
        })
    }
}
export default new ActionParser();