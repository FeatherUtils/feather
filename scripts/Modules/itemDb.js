// Credits: github/TrashyDaFox/Leaf

import {
    system,
    world,
    EquipmentSlot,
    ScriptEventSource,
    ItemStack,
    BlockVolume,
    EntityEquippableComponent,
} from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
const equipmentSlots = [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet,
    EquipmentSlot.Offhand,
];
class ItemDB {
    constructor() {
        this.db = prismarineDb.customStorage("ItemDB", SegmentedStoragePrismarine);
        this.db.waitLoad().then(() => {
            this.initializeKeyval()
        })
    }

    async initializeKeyval() {
        this.keyval = await this.db.keyval("config");
    }

    getItemCount() {
        return this.keyval.get("itemCount") ? this.keyval.get("itemCount") : 0;
    }

    getStash() {
        return Math.floor(this.getItemCount() / 62);
    }

    saveItem(itemStack) {
        if (!(itemStack instanceof ItemStack)) return;

        const stash = this.getStash();
        const stasherName = `itemstash_${stash}`;
        const id = `itemstash:stash_${stash}`;
        const player = world.getPlayers()[0];

        if (!player) return;
        player.runCommand(`structure load "${id}" ~ 0 ~`)
        let stasher = player.dimension.getEntities({ name: stasherName })[0];

        if (!stasher) {
            stasher = player.dimension.spawnEntity("feather:item_stasher", {
                x: player.location.x,
                y: 0,
                z: player.location.z,
            });
            stasher.nameTag = stasherName;
        }

        const inv = stasher.getComponent("inventory").container;

        let slot = Math.max(inv.firstEmptySlot(), 0);
        inv.setItem(slot, itemStack);
        player.runCommand(`structure save "${id}" ~ 0 ~ ~ 0 ~ true disk false`);

        stasher.triggerEvent("feather:despawn");
        stasher.nameTag = "despawned";

        this.keyval.set("itemCount", this.getItemCount() + 1);
        return [stash, slot];
    }

    getItem(stash, slot) {
        const id = `itemstash:stash_${stash}`;
        const stasherName = `itemstash_${stash}`;
        const player = world.getPlayers()[0];

        if (!player) return;
        if (
            player.runCommand(`structure load "${id}" ~ 0 ~`).successCount === 0
        ) {
            throw `Failed to load stash "${stash}"`;
        }

        const stasher = player.dimension.getEntities({ name: stasherName })[0];
        const inv = stasher.getComponent("inventory").container;

        const item = inv.getItem(slot);
        stasher.triggerEvent("feather:despawn");
        stasher.nameTag = "despawned";

        return item;
    }

    deleteItem(stash) {
        const id = `itemstash:stash_${stash}`;
        world.getDimension("overworld").runCommand(`structure delete "${id}"`);
    }
}

export default new ItemDB();