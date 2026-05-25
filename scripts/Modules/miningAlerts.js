import modulesV2 from "./modulesV2";
import { world, system } from '@minecraft/server'
import uiManager from "../Libraries/uiManager";
import config from "../config";
import { ModalFormData } from "@minecraft/server-ui";
import { consts } from "../cherryUIConsts";
import { prismarineDb } from "../Libraries/prismarinedb";

modulesV2.register('MiningAlertsBlocks', modulesV2.Types.String, 'minecraft:diamond_ore,minecraft:deepslate_diamond_ore,minecraft:ancient_debris')
modulesV2.register('MiningAlertsEnabled', modulesV2.Types.Boolean, false)

uiManager.addUI(config.uinames.MiningAlertsConfig, 'Mingingasdj alerts asd! !!', (player) => {
    let form = new ModalFormData()
    form.title(consts.modal + "Mining Alerts")
    form.toggle('Enabled', { defaultValue: modulesV2.get('MiningAlertsEnabled') })
    form.textField('Blocks (seperate blocks with a comma)', 'a', { defaultValue: modulesV2.get('MiningAlertsBlocks') })
    form.show(player).then((res) => {
        let [enabled, blocks] = res.formValues;
        modulesV2.set('MiningAlertsEnabled', enabled)
        if (!blocks) modulesV2.set('MiningAlertsBlocks', 'minecraft:diamond_ore,minecraft:deepslate_diamond_ore,minecraft:ancient_debris')
        if (blocks) modulesV2.set('MiningAlertsBlocks', blocks)
        player.runCommand('feather:open @s config_moderation')
    })
})

world.beforeEvents.playerBreakBlock.subscribe((e) => {
    let alertBlocks = (modulesV2.get('MiningAlertsBlocks') ?? '')
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)

    if (alertBlocks.includes(e.block.typeId)) {
        for (const player of world.getPlayers()) {
            if (prismarineDb.permissions.hasPermission(player, 'recieveMiningAlerts')) {
                if(player.hasTag('muteMiningAlerts')) continue;
                player.sendMessage(
                    '§8[§bMining Alerts§8] §r§6' +
                    e.player.name +
                    ' §7mined §4' +
                    e.block.typeId
                )
            }
        }
    }
})