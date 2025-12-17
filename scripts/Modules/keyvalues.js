import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class KeyValues {
    constructor() {
        system.run(async () => {
            this.Database = prismarineDb.customStorage('KeyValues', SegmentedStoragePrismarine)
            this.KeyValues = await this.Database.keyval('KeyValues')
        })
    }
    set(key, val) {
        return this.KeyValues.set(key, val)
    }
    get(key) {
        return this.KeyValues.get(key)
    }
}

export default new KeyValues();