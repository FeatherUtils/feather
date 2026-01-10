import {
    Effect,
    EffectType,
    Player,
    system,
    TicksPerSecond,
    world,
} from "@minecraft/server";
import { prismarineDb, isVec3 } from "../Libraries/prismarinedb";
import modules from "./modules";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class RTP {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.customStorage(
                "rtp",
                SegmentedStoragePrismarine
            );
            this.kv = await this.db.keyval("keyval");

            if (!this.kv.get("cooldown")) this.kv.set("cooldown", 300);
            if (this.kv.get("overworld") == undefined)
                this.kv.set("overworld", true);
            if (this.kv.get("nether") == undefined) this.kv.set("nether", false);
            if (this.kv.get("end") == undefined) this.kv.set("end", false);
            if (this.kv.get("range") == undefined) this.kv.set("range", 3000);
        });
    }
}

var rtp = new RTP();

function vec3ToChunkCoordinates(vec3) {
    if (!isVec3(vec3)) return { x: 0, z: 0 };
    return {
        x: Math.floor(vec3.x / 16),
        z: Math.floor(vec3.z / 16),
    };
}

function XZToChunkCoordinates(x, z) {
    return vec3ToChunkCoordinates({ x, y: 0, z });
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomLocation(radius) {
    let x = randomNumber(-radius, radius);
    let z = randomNumber(-radius, radius);
    return { x, z };
}

function findSafeY(sender, x, z) {
    const dim = sender.dimension;
    const range = dim.heightRange;
    const isNether = dim.id === "minecraft:nether";

    let start;
    let end;
    let step;

    if (isNether) {
        start = range.min;
        end = range.max;
        step = 1;
    } else {
        start = range.max - 2;
        end = range.min;
        step = -1;
    }

    for (let y = start; step > 0 ? y <= end : y >= end; y += step) {
        const block = dim.getBlock({ x, y, z });
        if (!block) continue;

        if (block.typeId.includes("light_block")) continue;
        if (block.isLiquid) continue;

        const above = dim.getBlock({ x, y: y + 1, z });
        const above2 = dim.getBlock({ x, y: y + 2, z });
        if (!above || !above2) continue;

        const isAboveAir =
            !above.isSolid &&
            !above.isLiquid &&
            !above2.isSolid &&
            !above2.isLiquid;

        if (block.isSolid && isAboveAir) {
            return y + 1;
        }
    }

    return null;
}

function startRTP(player) {
    let msg = { sender: player };
    let radius = rtp.kv.get("range");

    let loc1 = {
        x: msg.sender.location.x,
        y: msg.sender.location.y,
        z: msg.sender.location.z,
    };

    let { x, z } = generateRandomLocation(radius);
    let sender = msg.sender;

    if (!(sender instanceof Player)) return;
    if (!sender.isValid) return;

    if (!rtp.kv.get("overworld") && player.dimension.id == "minecraft:overworld")
        return msg.sender.error("RTP is not enabled in the overworld!");
    if (!rtp.kv.get("nether") && player.dimension.id == "minecraft:nether")
        return msg.sender.error("RTP is not enabled in the nether!");
    if (!rtp.kv.get("end") && player.dimension.id == "minecraft:the_end")
        return msg.sender.error("RTP is not enabled in the end!");

    if (!sender.getDynamicProperty("lastRTP")) {
        sender.setDynamicProperty("lastRTP", 0);
    }
    const lastRTP = Number(sender.getDynamicProperty("lastRTP")) || 0;
    const cooldown = rtp.kv.get("cooldown");
    const cdInMs = cooldown * 1000;
    const now = Date.now();

    if (now - lastRTP < cdInMs && !prismarineDb.permissions.hasPermission(player, 'bypassRTPCooldown')) {
        const remaining = cdInMs - (now - lastRTP);
        const remainingSec = Math.ceil(remaining / 1000);
        sender.error(`You must wait ${remainingSec}s before using RTP again.`);
        return;
    }
    let y = sender.dimension.heightRange.max;
    msg.sender.teleport({ x, y, z });


    sender.setDynamicProperty("lastRTP", now);
    let interval = system.runInterval(() => {
        if (!sender.isValid) {
            system.clearRun(interval);
            return;
        }

        try {
            let foundBlock = false;

            function reroll() {
                let randomLocation = generateRandomLocation(radius);
                let running = true;
                let iter = 0;

                while (running) {
                    iter++;
                    randomLocation = generateRandomLocation(radius);
                    if (iter > 15) {
                        running = false;
                        break;
                    }
                    let a = XZToChunkCoordinates(randomLocation.x, randomLocation.z);
                    let x2 = a.x;
                    let z2 = a.z;
                }

                x = randomLocation.x;
                z = randomLocation.z;
                y = sender.dimension.heightRange.max;
                msg.sender.teleport({ x, y, z });
            }

            let block = sender.dimension.getBlock({ x: x, y: 0, z: z });
            if (!block) return;

            const safeY = findSafeY(sender, x, z);

            if (safeY === null) {
                return reroll();
            }

            foundBlock = true;
            y = safeY;

            if (!foundBlock) {
                return reroll();
            }

            sender.addEffect("instant_health", TicksPerSecond * 10, {
                amplifier: 255,
            });
            sender.addEffect("resistance", TicksPerSecond * 10, {
                amplifier: 255,
            });
            sender.setDynamicProperty('lastRTP', Date.now())
            sender.teleport({ x, y, z });
            system.clearRun(interval);
            msg.sender.success("Teleported successfully");
        } catch {
            try {
                msg.sender.teleport(loc1);
                system.clearRun(interval);
            } catch {
                system.clearRun(interval);
            }
        }
    }, 3);
}

system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (
        e.id == "feather:rtp" &&
        e.sourceEntity &&
        e.sourceEntity.typeId == "minecraft:player"
    ) {
        let player = e.sourceEntity;
        startRTP(player);
    }
});

export { rtp, startRTP };