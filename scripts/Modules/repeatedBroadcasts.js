import { prismarineDb } from '../Libraries/prismarinedb'
import { system, world } from '@minecraft/server'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'

class RepeatedBroadcasts {
    constructor() {
        this.currentTick = 0;
        this.ready = new Promise((resolve) => {
            system.run(() => {
                this.Database = prismarineDb.customStorage('repeatedBroadcasts', SegmentedStoragePrismarine);
                if (this.Database.waitLoad) {
                    this.Database.waitLoad().then(resolve);
                } else {
                    resolve(true);
                }
            });
        });

        system.runInterval(() => {
            this.tick();
        }, 1);
    }

    async waitReady() {
        if (this.Database?.loaded) return true;
        return this.ready;
    }

    tick() {
        this.currentTick++;
        if (!this.Database?.loaded) return;
        const broadcasts = this.Database.findDocuments({ enabled: true }) || [];
        for (const entry of broadcasts) {
            const data = entry.data;
            const interval = Math.max(1, Math.floor(data.interval || 0));
            const lastRun = data.lastRunTick ?? this.currentTick;
            if (this.currentTick - lastRun >= interval) {
                this.runBroadcast(entry);
            }
        }
    }

    runBroadcast(doc) {
        const data = doc.data;
        if (!data?.message) return;
        world.sendMessage(`${data.message}`);
        data.lastRunTick = this.currentTick;
        this.Database.overwriteDataByID(doc.id, data);
    }

    async createBroadcast(message, intervalTicks, enabled = true) {
        await this.waitReady();
        if (!message) return null;
        const interval = Math.max(1, Math.floor(Number(intervalTicks)));
        if (isNaN(interval)) return null;
        return this.Database.insertDocument({
            message,
            interval,
            enabled: !!enabled,
            lastRunTick: this.currentTick
        });
    }

    async deleteBroadcast(id) {
        await this.waitReady();
        return this.Database.deleteDocumentByID(id);
    }

    async toggleBroadcast(id, enabled) {
        await this.waitReady();
        const doc = this.Database.getByID(id);
        if (!doc) return false;
        doc.data.enabled = !!enabled;
        this.Database.overwriteDataByID(id, doc.data);
        return true;
    }

    async updateBroadcast(id, { message, intervalTicks }) {
        await this.waitReady();
        const doc = this.Database.getByID(id);
        if (!doc) return false;
        let intervalChanged = false;
        if (message !== undefined) doc.data.message = message;
        if (intervalTicks !== undefined) {
            const interval = Math.max(1, Math.floor(Number(intervalTicks)));
            if (isNaN(interval)) return false;
            doc.data.interval = interval;
            intervalChanged = true;
        }
        if (intervalChanged) doc.data.lastRunTick = this.currentTick;
        this.Database.overwriteDataByID(id, doc.data);
        return true;
    }

    listBroadcasts() {
        if (!this.Database) return [];
        return this.Database.findDocuments(null);
    }
}

export default new RepeatedBroadcasts();
