import { prismarineDb } from "../Libraries/prismarinedb";
import { world,system, Player } from '@minecraft/server'
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
import { dynamicToast } from "../Libraries/chatNotifs";

class Notifications {
    constructor() {
        this.Database = prismarineDb.customStorage('BUILDER:NOTIFICATIONS', SegmentedStoragePrismarine)
        this.bgs = {
            'grey': 'textures/ui/greyBorder',
            'pink': 'textures/ui/pinkBorder'
        }
    }
    add(identifier,title,body) {
        this.Database.insertDocument({
            identifier,
            title,
            body,
            icon: 'azalea/label',
            bg: 'grey'
        })
    }
    edit(id,identifier,title,body,icon,bg) {
        let not = this.get(id)
        if(!not) return false;
        not.data.identifier = identifier
        not.data.title = title
        not.data.body = body
        not.data.icon = icon
        not.data.bg = bg
        this.Database.overwriteDataByID(not.id,not.data)
        return true;
    }
    del(id) {
        return this.Database.deleteDocumentByID(id)
    }
    getByIdentifier(identifier) {
        return this.Database.findFirst({identifier})
    }
    get(id) {
        return this.Database.getByID(id)
    }
    /**
     * 
     * @param {Player} player
     * 
     */
    show(player,identifier) {
        let not = this.getByIdentifier(identifier)
        if(!not) return false;
        let ic = not.data.icon == 'azalea/label' ? null : not.data.icon
        player.sendMessage(dynamicToast(not.data.title, not.data.body, ic, this.bgs[not.data.bg]))
    }
}

export default new Notifications;