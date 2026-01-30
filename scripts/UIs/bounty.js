import { ActionForm } from "../Libraries/form_func";
import bounty from "../Modules/bounty";
import { consts } from "../cherryUIConsts";
import config from "../config";
import uiManager from "../Libraries/uiManager";
import { ModalFormData } from "@minecraft/server-ui";
import { world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import playerStorage from "../Libraries/playerStorage";

uiManager.addUI(config.uinames.bounty.add, 'bounty add', (player) => {
    let form = new ModalFormData();

    let allPlayers = world.getPlayers().filter(_=>_.name!=player.name);
    if(allPlayers.length < 1) return player.error('No one else is online')
    let plrnames = allPlayers.map(_ => _.name);

    let currencies = prismarineDb.economy.getCurrencies();
    let cnames = currencies.map(_ => _.displayName);

    form.title(`${consts.modal}Create Bounty`);
    form.dropdown('Player', plrnames);
    form.textField('Amount', 'Amount of the bounty');
    form.dropdown('Currency', cnames);

    form.show(player).then((res) => {
        if (!res || res.canceled) return;

        let [p, a, c] = res.formValues;
        let am = +a;

        if (isNaN(am)) return player.error('Amount must be a number');

        if (am < 1) return player.error('Amount must be over zero!')

        let target = allPlayers[p];
        if (!target) return player.error('Invalid player selected');

        let currency = currencies[c];
        if (!currency) return player.error('Invalid currency selected');

        bounty.createBounty(player, am, target.id, currency.scoreboard);
    });
});


uiManager.addUI(config.uinames.bounty.root, 'b root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}Bounty`)
    form.button(`§aCreate Bounty\n§7Place a bounty on another player`, `.azalea/1`, (player) => {
        uiManager.open(player,config.uinames.bounty.add)
    })
    form.button(`§eLeaderboards\n§7View bounty leaderboards`, `.azalea/13`, (player) => {
        uiManager.open(player,config.uinames.bounty.leaderboard)
    })
    for(const bnty of bounty.db.findDocuments({type:'BOUNTY',plrID:player.id})) {
        let target = playerStorage.getPlayerByID(bnty.data.targetID)
        let crnc = prismarineDb.economy.getCurrency(bnty.data.currency)
        form.button(`§c${target.name}\n§7${bnty.data.amount} | ${crnc.displayName} | WITHDRAW`, `.azalea/8`, (player) => {
            bounty.withdrawBounty(bnty.id)
            uiManager.open(player,config.uinames.bounty.root)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.bounty.leaderboard, 'lb b', (player) => {
    let form = new ActionForm();
    let formattedtext = [];
    for(const ob of bounty.getTopBounties()) {
        formattedtext.push(`${ob.name} | ${ob.currencies.join(' | ')}`)
    }
    form.title(`${consts.tag}Bounty Leaderboard`)
    form.body(`${formattedtext.join('\n')}`)
    form.button('Back', '.azalea/2', (player) => {
        uiManager.open(player,config.uinames.bounty.root)
    })
    form.show(player)
})