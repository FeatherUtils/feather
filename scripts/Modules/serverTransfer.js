import { system } from '@minecraft/server'
import { transferPlayer } from '@minecraft/server-admin'
import { prismarineDb } from '../Libraries/prismarinedb'

class ServerTransfer {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('ServerTransfer')
        })
    }
    addServer(text,subtext,requiredTag,ip,port) {
        if(this.db.findFirst({ip})) return false;
        let server = this.db.insertDocument({
            text,
            subtext,
            requiredTag,
            ip,
            port
        })
        return server;
    }
    deleteServer(id) {
        return this.db.deleteDocumentByID(id)
    }
    editServer(id,text,subtext,requiredTag,ip,port) {
        let s2 = this.db.getByID(id)
        let s = s2.data
        if(!s) return false;
        s.text = text
        s.subtext = subtext
        s.requiredTag = requiredTag
        s.ip = ip
        s.port = port
        return this.db.overwriteDataByID(id,s)
    }
    getAll() {
        return this.db.findDocuments();
    }
    join(id,player) {
        let server = this.db.getByID(id)
        if(!server) return player.error('Server not found');
        transferPlayer(player, server.data.ip, server.data.port)
    }
}

export default new ServerTransfer();