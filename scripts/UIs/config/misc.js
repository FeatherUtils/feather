import { ActionForm } from "../../Libraries/form_func";
import config from "../../config";
import uiManager from "../../Libraries/uiManager";
import { consts } from "../../cherryUIConsts";
import { prismarineDb } from "../../Libraries/prismarinedb";
import { ModalFormData } from "@minecraft/server-ui";
import modules from "../../Modules/modules";
import { translate } from "../../translate";
import clans from "../../Modules/clans";
import { world } from "@minecraft/server";
import { themes } from "../../cherryThemes";
import homes from "../../Modules/homes";
import keyvalues from "../../Modules/keyvalues";
import { rtp } from "../../Modules/rtp";

uiManager.addUI(config.uinames.config.misc, 'misc settings', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}${consts.themed}${themes[51][0]}§rConfig UI - Misc`)
    form.button(`${consts.left}${consts.disablevertical}§rMain Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'config')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.root)
    })
    form.button(`${consts.right}${consts.alt}${themes[51][0]}§rMisc Settings`, null, (player) => {
        if (!prismarineDb.permissions.hasPermission(player, 'misc_settings')) return player.error(translate(config.lang.noperms.default))
        uiManager.open(player, config.uinames.config.misc)
    })
    if (prismarineDb.permissions.hasPermission(player, 'crf')) {
        form.button(`${consts.disablevertical}${consts.left}§cChat Rank Format`, '.blossom/rank', (player) => {
            uiManager.open(player, config.uinames.config.crf)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'platform_settings')) {
        form.button(`${consts.right}§bPlatform Settings`, `.azalea/devices(little changes)`, (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'platform_settings')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.platformSettings.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'economy')) {
        form.button(`${consts.disablevertical}${consts.left}§eEconomy Editor`, `.vanilla/emerald`, (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'economy')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.economyEditor.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'warps')) {
        form.button(`${consts.right}§uWarp Management`, 'textures/azalea_icons/main', (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'warps')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.warpManagement)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'clan_settings')) {
        form.button(`${consts.disablevertical}${consts.left}§6Clans Settings`, '.vanilla/diamond_sword', (player) => {
            uiManager.open(player, config.uinames.config.clans)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'codes')) {
        form.button(`${consts.right}§dCodes Admin`, '.azalea/11', (player) => {
            uiManager.open(player, config.uinames.codes.admin)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'repbroad')) {
        form.button(`${consts.disablevertical}${consts.left}§bRepeated Broadcasts`, '.azalea/AdminPlayerIcon', (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'repbroad')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.repeatedBroadcasts.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'leaderboards')) {
        form.button(`${consts.right}§9Leaderboards`, '.azalea/13', (player) => {
            if (!prismarineDb.permissions.hasPermission(player, 'leaderboards')) return player.error(`${translate(config.lang.noperms.default)}`)
            uiManager.open(player, config.uinames.leaderboards.root)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'afkkicksettings')) {
        form.button(`${consts.disablevertical}${consts.left}§cAFK Kick`, '.vanilla/clock_item', (player) => {
            uiManager.open(config.uinames.config.afkKick)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'homesettings')) {
        form.button(`${consts.right}§5Homes Settings`, '.vanilla/ender_pearl', (player) => {
            uiManager.open(config.uinames.config.homes)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'antiSpamSettings')) {
        form.button(`§dAnti Spam`, '.feather/chat', (player) => {
            uiManager.open(player, config.uinames.config.antiSpam)
        })
    }
    if (prismarineDb.permissions.hasPermission(player, 'RTPSettings')) {
        form.button(`§uRTP Settings`, '.feather/rng', (player) => {
            uiManager.open(player, config.uinames.config.rtp)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.config.clans, 'f', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'clan_settings')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    let currencyScoreboard = clans.settingsKV.get('currencyScoreboard')
    let clanBase = clans.settingsKV.get('clanBaseEnabled')
    form2.title('Clans Settings')
    form2.textField(`Currency Scoreboard`, 'money', { defaultValue: currencyScoreboard, tooltip: 'This is for the clan bank. This is the scoreboard used for money usually' })
    form2.toggle(`Clan Base`, { defaultValue: clanBase ?? false })
    form2.show(player).then((res) => {
        let [scoreboard, cb] = res.formValues;
        if (!scoreboard) return player.error('Please enter a scoreboard');
        if (!world.scoreboard.getObjective(scoreboard)) world.scoreboard.addObjective(scoreboard);
        if (!prismarineDb.economy.getCurrencies().find(_ => _.scoreboard === scoreboard)) prismarineDb.economy.addCurrency(scoreboard, '$', scoreboard);
        clans.settingsKV.set('currencyScoreboard', scoreboard)
        clans.settingsKV.set('clanBaseEnabled', cb)
    })
})
uiManager.addUI(config.uinames.config.crf, 'chat rank format', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'crf')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    form2.title(`Code Editor`)
    form2.textField(`${translate(config.lang.config.modules.text.crf)}`, `${translate(config.lang.config.modules.text.desc.crf)}`, { defaultValue: modules.get('crf') })
    form2.show(player).then((res) => {
        let [crf] = res.formValues;
        if (crf === '') return modules.set('crf', config.info.defaultChatRankFormat), uiManager.open(player, config.uinames.config.misc);
        modules.set('crf', crf)
        player.runCommand('open @s config_chat')
    })
})

uiManager.addUI(config.uinames.config.clog, 'CLog Protection', (player) => {
    let form2 = new ModalFormData()
    form2.title(consts.modal + 'Combat Log Config')
    form2.toggle('Enabled', {defaultValue:modules.get('CLog')})
    form2.toggle('Keep Inventory', {defaultValue:modules.get('CLogKeepInventory')})
    form2.textField('Cooldown', 'Example: 20', {defaultValue:`${modules.get('clogCooldown')}` ?? '30'})
    form2.toggle('Commands Disabled', {defaultValue:modules.get('CLogCommandsDisabled')})
    form2.toggle('Teleport Disabled', {defaultValue:modules.get('CLogTeleportDisabled')})
    form2.show(player).then((res) => {
        let [enabled,keepinventory,clogCooldown,commandsDisabled,disabletp] = res.formValues
        if(isNaN(clogCooldown)) return player.error('Cooldown is not a number')
        modules.set('CLog', enabled)
        modules.set('CLogKeepInventory', keepinventory)
        modules.set('clogCooldown', clogCooldown)
        modules.set('CLogCommandsDisabled', commandsDisabled)
        modules.set('CLogTeleportDisabled', disabletp)
        player.runCommand('open @s config_world')
        player.success('Set combat log settings successfully')
    })
})

uiManager.addUI(config.uinames.config.proximity, 'pro', (player) => {
    let form = new ModalFormData();
    form.title(consts.modal + 'Proximity Chat Settings')
    form.label('Requires Chat Ranks to be on in modules.')
    form.toggle('Enabled', {defaultValue:modules.get('proximityChat') ?? false})
    form.textField('Range', 'How far away can players talk to eachother from', {defaultValue:`${modules.get('proximityChatRange')}` ?? '20'})
    form.show(player).then((res) => {
        let [f,en,ra] = res.formValues
        if(isNaN(+ra) || 0 > ra) return player.error('Range is not a valid number')
        modules.set('proximityChat', en)
        modules.set('proximityChatRange', +ra)
        player.runCommand('open @s config_chat')
        player.success('Set proximity chat settings successfully')
    })
})

uiManager.addUI(config.uinames.config.afkKick, 'f', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'afkkicksettings')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    const current = keyvalues.get('afkKickSeconds') ?? 600;
    const enabled = keyvalues.get('afkKickEnabled') ?? false;
    form2.title(consts.modal + 'AFK Kick Settings')
    form2.toggle('Enabled', { defaultValue: !!enabled })
    form2.textField('Seconds before kick', 'Example: 600', { defaultValue: `${current}` })
    form2.show(player).then((res) => {
        if (!res || res.canceled) return;
        let [isEnabled, secs] = res.formValues;
        if (isNaN(+secs) || +secs <= 0) return player.error('Enter a valid number of seconds');
        keyvalues.set('afkKickEnabled', !!isEnabled);
        keyvalues.set('afkKickSeconds', +secs);
        player.success('AFK kick time updated');
    })
})

uiManager.addUI(config.uinames.config.homes, 'homes', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'homesettings')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    let maxHomes = homes.kv.get('maxHomes')
    let teleportTime = homes.kv.get('teleportTime')
    form2.title(consts.modal + 'Homes Settings')
    form2.textField(`Max homes`, 'Example: 20', { defaultValue: `${maxHomes}` })
    form2.textField(`Teleport time (seconds)`, 'Example: 5', { defaultValue: `${teleportTime}` })
    form2.show(player).then((res) => {
        let [mh, tt] = res.formValues;
        if (isNaN(+mh)) return player.error('Please enter a vaild number for max homes');
        if (isNaN(+tt)) return player.error('Please enter a vaild number for teleport time');
        homes.kv.set('maxHomes', +mh)
        homes.kv.set('teleportTime', +tt)
    })
})

uiManager.addUI(config.uinames.config.antiSpam, 'antispamm', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'antiSpamSettings')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    form2.title(consts.modal + 'Anti Spam Settings')
    form2.toggle('Enabled', { defaultValue: modules.get('antiSpam') ?? false })
    form2.textField('Cooldown', '3', { defaultValue: modules.get('antiSpamSeconds') ?? '3' })
    form2.textField('Anti Spam Message', '{s} is the cooldown seconds', { defaultValue: modules.get('antiSpamMessage') ?? 'Spamming is not allowed on the server. Cooldown: {s}s' })
    form2.show(player).then((res) => {
        let [enabled, cooldown, message] = res.formValues
        if (isNaN(+cooldown)) return player.error('Cooldown must be a number')
        modules.set('antiSpam', enabled)
        modules.set('antiSpamSeconds', cooldown)
        modules.set('antiSpamMessage', message)
        player.success('Successfully set values!')
        player.runCommand('open @s config_chat')
    })
})

uiManager.addUI(config.uinames.config.betterKB, 'betterKB', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'betterKBConfig')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    form2.title(consts.modal + 'BetterKB Config')
    form2.toggle('Enabled', {defaultValue: keyvalues.get('BetterKB')})
    form2.textField('XVel', 'xvel', {defaultValue: keyvalues.get('BetterKBXVel')})
    form2.textField('YVel', 'yvel', {defaultValue: keyvalues.get('BetterKBYVel')})
    form2.textField('ZVel', 'zvel', {defaultValue: keyvalues.get('BetterKBZVel')})
    form2.show(player).then((res) => {
        let [en,xvel,yvel,zvel] = res.formValues;
        if(isNaN(+xvel) || isNaN(+yvel) || isNaN(+zvel)) return player.error('Invalid inputs');
        keyvalues.set('BetterKB', en)
        keyvalues.set('BetterKBXVel', xvel)
        keyvalues.set('BetterKBYVel', yvel)
        keyvalues.set('BetterKBZVel', zvel)
        player.runCommand('open @s config_extra')
    })
})

uiManager.addUI(config.uinames.config.rtp, 'rtp', (player) => {
    if (!prismarineDb.permissions.hasPermission(player, 'RTPSettings')) return player.error(`${translate(config.lang.noperms.default)}`)
    let form2 = new ModalFormData();
    form2.title(consts.modal + 'RTP Settings')
    form2.toggle('Overworld', { defaultValue: rtp.kv.get('overworld') ?? false })
    form2.toggle('Nether', { defaultValue: rtp.kv.get('nether') ?? false })
    form2.toggle('The End', { defaultValue: rtp.kv.get('end') ?? false })
    form2.textField('Cooldown', '300', { defaultValue: rtp.kv.get('cooldown').toString() ?? '300' })
    form2.textField('Radius', '3000', { defaultValue: rtp.kv.get('range').toString() ?? '3000' })
    form2.show(player).then((res) => {
        let [overworld, nether, end, cooldown, radius] = res.formValues
        if (isNaN(+cooldown)) return player.error('Cooldown must be a number')
        if (isNaN(+radius)) return player.error('Radius must be a number')
        rtp.kv.set('overworld', overworld)
        rtp.kv.set('nether', nether)
        rtp.kv.set('end', end)
        rtp.kv.set('cooldown', +cooldown)
        rtp.kv.set('range', +radius)
        player.success('Successfully set values!')
    })
})