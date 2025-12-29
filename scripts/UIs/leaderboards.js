import { ActionForm, ModalForm } from "../Libraries/form_func";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import leaderboards from "../Modules/leaderboards";
import { consts } from "../cherryUIConsts";

function formatSummary(doc) {
    const d = doc.data;
    return `§b${d.name}\n§7Obj: ${d.objective} | Max: ${d.maxPlayers} | ${d.descending ? 'High->Low' : 'Low->High'}`;
}

uiManager.addUI(config.uinames.leaderboards.root, 'Leaderboards root', async (player) => {
    await leaderboards.waitReady();
    const lbs = leaderboards.list();
    let form = new ActionForm();
    form.title(`${consts.tag}Leaderboards`);

    form.button(`Create Leaderboard`, '.azalea/11', (plr) => {
        uiManager.open(plr, config.uinames.leaderboards.create);
    });

    if (!lbs.length) form.body('No leaderboards created.');

    for (const lb of lbs) {
        form.button(formatSummary(lb), '.azalea/18', (plr) => {
            uiManager.open(plr, config.uinames.leaderboards.edit, lb.id);
        });
    }

    form.show(player);
});

uiManager.addUI(config.uinames.leaderboards.create, 'Leaderboards create', (player) => {
    let form = new ModalForm();
    form.title(`${consts.modal}Create Leaderboard`);
    form.textField(`Name`, 'Name for this leaderboard');
    form.textField(`Scoreboard objective`, 'Objective id, e.g. money');
    form.textField(`Max players`, 'Top N players', '10');
    form.toggle(`Sort high to low`, true);
    form.textField(`Header text`, 'Use {objective}', '§bTop {objective}');
    form.textField(`Entry format`, 'Use {rank} {name} {score}', '§f#{rank} §a{name} §7- §e{score}');
    form.textField(`Footer text`, 'Optional footer', '§7Updated automatically');

    form.show(player).then(async (res) => {
        if (!res || res.canceled) return;
        const [name, objective, maxPlayers, descending, header, entry, footer] = res.formValues;
        if (!name) return player.error('Name is required');
        if (!objective) return player.error('Objective is required');
        if (isNaN(+maxPlayers) || +maxPlayers < 1) return player.error('Max players must be a number >= 1');
        const created = await leaderboards.createLeaderboard({ name, objective, maxPlayers: +maxPlayers, descending, header, entry, footer });
        if (!created) return player.error('Could not create leaderboard (maybe name already exists)');
        player.success('Leaderboard created');
        uiManager.open(player, config.uinames.leaderboards.root);
    });
});

uiManager.addUI(config.uinames.leaderboards.edit, 'Leaderboards edit', async (player, id) => {
    await leaderboards.waitReady();
    const doc = leaderboards.getById(id);
    if (!doc) return player.error('Leaderboard not found');
    const d = doc.data;

    let form = new ActionForm();
    form.title(`${consts.tag}${d.name}`);

    form.button(`Edit Settings`, '.azalea/11', (plr) => {
        let modal = new ModalForm();
        modal.title(`${consts.modal}Edit ${d.name}`);
        modal.textField(`Name`, 'Name for this leaderboard', d.name);
        modal.textField(`Scoreboard objective`, 'Objective id, e.g. money', d.objective);
        modal.textField(`Max players`, 'Top N players', `${d.maxPlayers}`);
        modal.toggle(`Sort high to low`, !!d.descending);
        modal.textField(`Header text`, 'Use {objective}', d.header ?? '');
        modal.textField(`Entry format`, 'Use {rank} {name} {score}', d.entry ?? '');
        modal.textField(`Footer text`, 'Optional footer', d.footer ?? '');
        modal.show(plr).then(async (res) => {
            if (!res || res.canceled) return;
            const [name, objective, maxPlayers, descending, header, entry, footer] = res.formValues;
            if (!name) return plr.error('Name is required');
            if (!objective) return plr.error('Objective is required');
            if (isNaN(+maxPlayers) || +maxPlayers < 1) return plr.error('Max players must be a number >= 1');
            await leaderboards.updateLeaderboard(id, { name, objective, maxPlayers: +maxPlayers, descending, header, entry, footer });
            plr.success('Leaderboard updated');
            uiManager.open(plr, config.uinames.leaderboards.edit, id);
        });
    });

    form.button(`Spawn Here`, '.azalea/3', (plr) => {
        const entity = leaderboards.spawnLeaderboard(id, plr.location, plr.dimension.id);
        if (!entity) return plr.error('Failed to spawn leaderboard');
        plr.success('Leaderboard spawned');
    });

    form.button(`Delete`, '.azalea/17', async (plr) => {
        await leaderboards.deleteLeaderboard(id);
        plr.success('Leaderboard deleted');
        uiManager.open(plr, config.uinames.leaderboards.root);
    });

    form.button('Back', '.azalea/2', (plr) => {
        uiManager.open(plr, config.uinames.leaderboards.root);
    });

    form.show(player);
});
