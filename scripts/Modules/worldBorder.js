import { system, world } from '@minecraft/server'
import { prismarineDb } from '../Libraries/prismarinedb'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'

class WorldBorder {
    constructor() {
        system.run(async () => {
            this.Database = prismarineDb.customStorage('WorldBorder', SegmentedStoragePrismarine)
            await this.Database.waitLoad();
            this.Keyval = await this.Database.keyval('Settings')
        })
    }
}

export default new WorldBorder;