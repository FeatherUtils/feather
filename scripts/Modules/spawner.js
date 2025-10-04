import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class StackableSpawners {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.customStorage('StackableSpawners', SegmentedStoragePrismarine)
        })
    }
}