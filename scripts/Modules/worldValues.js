import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class WorldValues {
    constructor() {
        system.run(async () => {
            this.Database = prismarineDb.customStorage('WorldValues', SegmentedStoragePrismarine)
            this.kv = await this.Database.keyval('WorldValues')
            if(!this.kv.get('values')) this.kv.set('values', [])
        })
    }
    save(arr) {
        this.kv.set('values', arr)
    }
    addValue(value) {
        let values = this.kv.get('values')
        if(values.includes(value)) return;
        values.push(value)
        this.save(values)
    }
    getValues() {
        let values = this.kv.get('values')
        return values;
    }
    includesValue(value) {
        let values = this.kv.get('values')
        return values.includes(value);
    }
    removeValue(value) {
        let values = this.kv.get('values')
        this.save(values.filter((_) => _ != value))
    }
}

export default new WorldValues();