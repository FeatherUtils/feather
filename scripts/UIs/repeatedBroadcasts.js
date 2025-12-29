import { ActionForm, ModalForm } from "../Libraries/form_func";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import repeatedBroadcasts from "../Modules/repeatedBroadcasts";
import { consts } from "../cherryUIConsts";

function formatBroadcast(doc) {
    const data = doc.data;
    const status = data.enabled ? '§a[ON]' : '§c[OFF]';
    return `${status} ${data.message}\n§7Every ${data.interval} ticks`;
}

uiManager.addUI(config.uinames.repeatedBroadcasts.root, 'Repeated Broadcasts', async (player) => {
    await repeatedBroadcasts.waitReady();
    const broadcasts = repeatedBroadcasts.listBroadcasts();

    let form = new ActionForm();
    form.title(`${consts.tag}Repeated Broadcasts`);

    form.button(`§aCreate Broadcast`, '.azalea/1', (plr) => {
        uiManager.open(plr, config.uinames.repeatedBroadcasts.create);
    });

    for (const doc of broadcasts) {
        form.button(formatBroadcast(doc), '.azalea/18', (plr) => {
            uiManager.open(plr, config.uinames.repeatedBroadcasts.edit, doc.id);
        });
    }

    form.show(player);
});

uiManager.addUI(config.uinames.repeatedBroadcasts.create, 'Create Broadcast', (player) => {
    let form = new ModalForm();
    form.title(`${consts.modal}Create Broadcast`);
    form.textField(`Message`, 'What to broadcast');
    form.textField(`Interval (ticks)`, 'Example: 1200');
    form.toggle(`Enabled`, true);
    form.show(player).then(async (res) => {
        if (!res || res.canceled) return;
        const [message, interval, enabled] = res.formValues;
        if (!message) return player.error('Message is required');
        if (isNaN(+interval) || +interval <= 0) return player.error('Interval must be a number greater than 0');
        const created = await repeatedBroadcasts.createBroadcast(message, +interval, enabled);
        if (!created) return player.error('Failed to create broadcast');
        player.success('Broadcast created');
        uiManager.open(player, config.uinames.repeatedBroadcasts.root);
    });
});

uiManager.addUI(config.uinames.repeatedBroadcasts.edit, 'Edit Broadcast', async (player, id) => {
    await repeatedBroadcasts.waitReady();
    const doc = repeatedBroadcasts.Database.getByID(id);
    if (!doc) return player.error('Broadcast not found');
    const data = doc.data;

    let form = new ActionForm();
    form.title(`${consts.tag}Broadcast`);

    form.button(`§6Edit`, '.azalea/11', (plr) => {
        let modal = new ModalForm();
        modal.title(`${consts.modal}Edit Broadcast`);
        modal.textField(`Message`, 'What to broadcast', data.message);
        modal.textField(`Interval (ticks)`, 'Example: 1200', `${data.interval}`);
        modal.toggle(`Enabled`, data.enabled );
        modal.show(plr).then(async (res) => {
            if (!res || res.canceled) return;
            const [message, interval, enabled] = res.formValues;
            if (!message) return plr.error('Message is required');
            if (isNaN(+interval) || +interval <= 0) return plr.error('Interval must be a number greater than 0');
            await repeatedBroadcasts.updateBroadcast(id, { message, intervalTicks: +interval });
            await repeatedBroadcasts.toggleBroadcast(id, enabled);
            plr.success('Broadcast updated');
            uiManager.open(plr, config.uinames.repeatedBroadcasts.edit, id);
        });
    });

    form.button(`${data.enabled ? '§cDisable' : '§aEnable'}`, '.azalea/3', async (plr) => {
        await repeatedBroadcasts.toggleBroadcast(id, !data.enabled);
        plr.success(`Broadcast ${data.enabled ? 'enabled' : 'disabled'}`);
        uiManager.open(plr, config.uinames.repeatedBroadcasts.edit, id);
    });

    form.button(`§4Delete`, '.azalea/SidebarTrash', async (plr) => {
        await repeatedBroadcasts.deleteBroadcast(id);
        plr.success('Broadcast deleted');
        uiManager.open(plr, config.uinames.repeatedBroadcasts.root);
    });

    form.button('§cBack', '.azalea/2', (plr) => {
        uiManager.open(plr, config.uinames.repeatedBroadcasts.root);
    });

    form.show(player);
});
