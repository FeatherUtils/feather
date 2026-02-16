import { prismarineDb } from "../Libraries/prismarinedb";
import { world,system } from '@minecraft/server'
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class Toasts {
    constructor() {
        this.Database = prismarineDb.customStorage('BUILDER:TOASTS', SegmentedStoragePrismarine)
    }
    add(identifier,title,body) {}
}

export default new Toasts;