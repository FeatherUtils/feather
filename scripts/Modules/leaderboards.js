import { prismarineDb } from '../Libraries/prismarinedb';
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented';
import { system, world } from '@minecraft/server';
import playerStorage from '../Libraries/playerStorage';

const DIMENSIONS = ['minecraft:overworld', 'minecraft:nether', 'minecraft:the_end'];

class Leaderboards {
    constructor() {
        this.currentTick = 0;
        this.ready = true;
        system.run(() => {
            this.db = prismarineDb.customStorage('Leaderboards', SegmentedStoragePrismarine);
        });
        system.runInterval(() => this.tick(), 20);
    }

    async waitReady() {
        if (this.db?.loaded) return true;
        return this.ready;
    }

    tick() {
        this.currentTick++;
        if (!this.db?.loaded) return;
        this.refreshAllEntities();
    }

    getById(id) {
        return this.db?.getByID(id) ?? null;
    }

    getByName(name) {
        if (!this.db) return null;
        return this.db.findFirst({ name }) ?? null;
    }

    list() {
        if (!this.db) return [];
        return this.db.findDocuments(null) ?? [];
    }

    async createLeaderboard(payload) {
        await this.waitReady();
        const data = this.normalizePayload(payload);
        if (!data.name || !data.objective) return null;
        if (this.getByName(data.name)) return null;
        return this.db.insertDocument(data);
    }

    async updateLeaderboard(id, payload) {
        await this.waitReady();
        const doc = this.getById(id);
        if (!doc) return false;
        const updated = { ...doc.data, ...this.normalizePayload(payload, doc.data) };
        this.db.overwriteDataByID(id, updated);
        return true;
    }

    async deleteLeaderboard(id) {
        await this.waitReady();
        return this.db.deleteDocumentByID(id);
    }

    normalizePayload(payload = {}, fallback = {}) {
        const obj = { ...fallback, ...payload };
        obj.name = obj.name ?? fallback.name ?? '';
        obj.objective = obj.objective ?? fallback.objective ?? '';
        obj.maxPlayers = Math.max(1, parseInt(obj.maxPlayers ?? fallback.maxPlayers ?? 10));
        obj.header = obj.header ?? fallback.header ?? '§bTop {objective}';
        obj.entry = obj.entry ?? fallback.entry ?? '§f#{rank} §a{name} §7- §e{score}';
        obj.footer = obj.footer ?? fallback.footer ?? '§7Updated automatically';
        obj.descending = obj.descending ?? fallback.descending ?? true;
        return obj;
    }

    buildNameTag(data) {
        const lines = [];
        const header = data.header?.replaceAll('{objective}', data.objective) ?? '';
        if (header) lines.push(header);

        const entries = [];
        try {
            for (const key of playerStorage.keyval.keys()) {
                const pdata = playerStorage.keyval.get(key);
                if (!pdata?.scores) continue;
                const scoreEntry = pdata.scores.find((s) => s.objective === data.objective);
                if (scoreEntry == null || typeof scoreEntry.score !== 'number') continue;
                entries.push({
                    name: pdata.name ?? 'Unknown',
                    score: scoreEntry.score
                });
            }
        } catch {
            // fall through if playerStorage not ready
        }

        if (!entries.length) {
            lines.push(`§cNo scores found for objective ${data.objective}`);
        } else {
            entries
                .sort((a, b) => data.descending ? b.score - a.score : a.score - b.score)
                .slice(0, data.maxPlayers)
                .forEach((entry, idx) => {
                    const line = (data.entry ?? '')
                        .replaceAll('{rank}', `${idx + 1}`)
                        .replaceAll('{name}', entry.name)
                        .replaceAll('{score}', `${entry.score}`)
                        .replaceAll('{objective}', data.objective);
                    lines.push(line);
                });
        }

        if (data.footer) lines.push(data.footer);
        return lines.join('\n');
    }

    spawnLeaderboard(id, location, dimensionId = 'minecraft:overworld') {
        const doc = this.getById(id);
        if (!doc) return null;
        const dim = world.getDimension(dimensionId);
        const entity = dim.spawnEntity('feather:floating_text', location);
        entity.addTag('leaderboard');
        entity.addTag(`lb:${id}`);
        entity.nameTag = this.buildNameTag(doc.data);
        return entity;
    }

    refreshAllEntities() {
        if (!this.db) return;
        const docs = this.list();
        if (!docs.length) return;
        for (const dimId of DIMENSIONS) {
            let dim;
            try { dim = world.getDimension(dimId); } catch { continue; }
            const entities = dim.getEntities({ type: 'feather:floating_text', tags: ['leaderboard'] });
            for (const ent of entities) {
                const tag = ent.getTags().find(t => t.startsWith('lb:'));
                if (!tag) continue;
                const id = parseInt(tag.split(':')[1]);
                const doc = this.getById(id);
                if (!doc) continue;
                ent.nameTag = this.buildNameTag(doc.data);
            }
        }
    }
}

export default new Leaderboards();
