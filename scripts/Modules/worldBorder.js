import { system, world } from '@minecraft/server'
import { prismarineDb } from '../Libraries/prismarinedb'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'
import modulesV2 from './modulesV2';
import { dynamicToast } from '../Libraries/chatNotifs'
import uiManager from '../Libraries/uiManager';
import { ModalFormData } from '@minecraft/server-ui';
import { consts } from '../cherryUIConsts';

modulesV2.register("WBEnabled", modulesV2.Types.Boolean, false);
modulesV2.register("WBRange", modulesV2.Types.Integer, 3000000);
modulesV2.register('WBParticlesEnabled', modulesV2.Types.Boolean, true);
modulesV2.register('WBParticle1', modulesV2.Types.String, 'leaf:worldborder');
modulesV2.register('WBParticle2', modulesV2.Types.String, 'leaf:worldborder_ew');
modulesV2.register('WBParticleViewDist', modulesV2.Types.Integer, 32);

const CENTER = { x: 0, y: 0, z: 0 }

function getDistance(center, vec2) {
    const dx = vec2.x - center.x
    const dz = vec2.z - center.z;

    return Math.sqrt(dx * dx + dz * dz);
}
const STEP = 16;
const RADIUS = STEP * 7;
const OFFSET = 8;

function spawnParticle(player, particle, loc, size) {
    if (loc.x > size || loc.x < -size || loc.z > size || loc.z < -size) return;
    try {
        player.spawnParticle(particle, loc)
    } catch {

    }
}

system.runInterval(() => {
    if (
        !modulesV2.get('WBEnabled') ||
        !modulesV2.get('WBParticlesEnabled')
    ) {
        console.log('a')
        return;
    }

    let particle1 = modulesV2.get('WBParticle1');
    let particle2 = modulesV2.get('WBParticle2');
    let size = modulesV2.get('WBRange');
    let VIEWING_DISTANCE = modulesV2.get('WBParticleViewDist');

    for (const player of world.getPlayers()) {
        let distToNorth = Math.floor(player.location.z + size);
        let distToSouth = Math.floor(size - player.location.z);
        let distToEast = Math.floor(size - player.location.x);
        let distToWest = Math.floor(player.location.x + size);

        let location = {
            x: Math.floor(player.location.x / 16) * 16,
            z: Math.floor(player.location.z / 16) * 16,
        };

        if (distToNorth <= VIEWING_DISTANCE) {
            spawnLine(player, particle2, 'z', -size, location.x, size);
        }
        if (distToSouth <= VIEWING_DISTANCE) {
            spawnLine(player, particle2, 'z', size, location.x, size);
        }
        if (distToWest <= VIEWING_DISTANCE) {
            spawnLine(player, particle1, 'x', -size, location.z, size);
        }
        if (distToEast <= VIEWING_DISTANCE) {
            spawnLine(player, particle1, 'x', size, location.z, size);
        }
    }
}, 20 * 3);

function spawnLine(player, particle, axis, fixedValue, centerValue, size) {
    for (let i = -RADIUS; i <= RADIUS; i += STEP) {
        if (axis === 'x') {
            spawnParticle(
                player,
                particle,
                {
                    x: fixedValue,
                    y: player.dimension.heightRange.min + 192,
                    z: centerValue + i - OFFSET,
                },
                size,
            );
        } else {
            spawnParticle(
                player,
                particle,
                {
                    x: centerValue + i - OFFSET,
                    y: player.dimension.heightRange.min + 192,
                    z: fixedValue,
                },
                size,
            );
        }
    }
}
uiManager.addUI('config_worldborder', 'worldborder config', (player) => {
    let form = new ModalFormData();
    form.title(consts.modal + 'WorldBorder');

    form.toggle('Enabled', { defaultValue: modulesV2.get('WBEnabled') });
    form.textField('Range', 'Range for wb', {
        defaultValue: `${modulesV2.get('WBRange')}`,
    });
    form.toggle('Particles Enabled', {
        defaultValue: modulesV2.get('WBParticlesEnabled'),
    });
    form.textField('Viewing Distance', 'Distance to render particles', {
        defaultValue: `${modulesV2.get('WBParticleViewDist')}`,
    });

    form.show(player).then((res) => {
        if (res.canceled) return;

        let [en, rastr, partEnabled, viewDistStr] = res.formValues;

        let ra = +rastr;
        let viewDist = +viewDistStr;

        if (isNaN(ra) || isNaN(viewDist)) {
            player.sendMessage('Range and Viewing Distance must be valid numbers!');
            return player.runCommand('feather:open @s config_world');
        }

        modulesV2.set('WBEnabled', en);
        modulesV2.set('WBRange', ra);
        modulesV2.set('WBParticlesEnabled', partEnabled);
        modulesV2.set('WBParticleViewDist', viewDist);

        player.sendMessage('Successfully set wb values!');
        player.runCommand('feather:open @s config_world');
    });
});
let clamp = (min, val, max) => (val > max ? max : val < min ? min : val);
system.runInterval(() => {
    if (!modulesV2.get('WBEnabled')) return;
    let size = modulesV2.get('WBRange')
    for (const player of world.getPlayers()) {
        let newLoc = {
            x: clamp(-size, player.location.x, size),
            y: player.location.y,
            z: clamp(-size, player.location.z, size),
        };
        if (newLoc.x != player.location.x || newLoc.z != player.location.z) {
            const dx = -player.location.x;
            const dz = -player.location.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const knockback = length === 0
                ? { x: 0, z: 0 }
                : { x: (dx / length) * 3, z: (dz / length) * 3 };
            player.applyKnockback(knockback, 0.7);
            player.applyDamage(2)
            player.info('You reached the world border!')
        }
    }
}, 3)