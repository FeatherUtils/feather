import { system, world } from '@minecraft/server';
import modules from './modules';

class AntiAfk {
    constructor() {
        this.lastActive = new Map();
        system.runInterval(() => this.checkPlayers(), 20);
    }

    isEnabled() {
        const val = modules.get('afkKickEnabled');
        return val === true || val === 'true';
    }

    getThresholdMs() {
        const val = modules.get('afkKickSeconds');
        const num = Number(val);
        const seconds = !isNaN(num) && num > 0 ? num : 600;
        return seconds * 1000;
    }

    hasMoved(prev, current) {
        const dx = current.pos.x - prev.pos.x;
        const dy = current.pos.y - prev.pos.y;
        const dz = current.pos.z - prev.pos.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq > 0.01) return true;
        const dr = (current.rot?.y ?? 0) - (prev.rot?.y ?? 0);
        return Math.abs(dr) > 1;
    }

    checkPlayers() {
        if (!this.isEnabled()) return;
        const now = Date.now();
        const threshold = this.getThresholdMs();
        for (const player of world.getPlayers()) {
            if (player.hasTag('afkimmune')) continue;
            const pos = player.location;
            const rot = player.getRotation ? player.getRotation() : { x: 0, y: 0 };
            const current = { pos, rot };
            const prev = this.lastActive.get(player.id);
            if (!prev || this.hasMoved(prev, current)) {
                this.lastActive.set(player.id, { ...current, time: now });
                continue;
            }
            if (now - prev.time >= threshold) {
                player.runCommand(`kick "${player.name}" You were kicked for being AFK too long.`);
                this.lastActive.set(player.id, { ...current, time: now });
            }
        }
    }
}

export default new AntiAfk();
