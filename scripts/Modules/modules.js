import config from "../config";
import { prismarineDb } from "../Libraries/prismarinedb";
import { system } from '@minecraft/server'
import './iconViewer'

class Modules {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.table('Modules')
            this.kv = await this.db.keyval('Modules')
            if(!this.has('cr')) this.set('cr', true);
            if(!this.get('crf')) this.set('crf', config.info.defaultChatRankFormat);
            if(!this.get('language')) this.set('language', 'en')
        })
    }
    get(key) {
        return this.kv.get(key)
    }
    set(key, val) {
        return this.kv.set(key, val)
    }
    has(key) {
        return this.kv.has(key)
    }
}

export default new Modules;