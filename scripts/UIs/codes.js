import { ActionForm, ModalForm } from "../Libraries/form_func";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import codes from "../Modules/codes";
import { consts } from "../cherryUIConsts";
import { prismarineDb } from "../Libraries/prismarinedb";

function formatCodeSummary(doc) {
    const data = doc.data;
    return `§b${data.code}`;
}

uiManager.addUI(config.uinames.codes.root, 'Codes root', (player) => {
    let form = new ActionForm();
    form.title(`${consts.tag}Gift Codes`);

    form.button(`§aRedeem Code\n§7Use a code you received`, '.azalea/6', (plr) => {
        uiManager.open(plr, config.uinames.codes.redeem);
    });

    if (prismarineDb.permissions.hasPermission(player, 'codes')) {
        form.button(`§6Admin Panel\n§7Create and manage codes`, '.azalea/AdminPlayerIcon', (plr) => {
            uiManager.open(plr, config.uinames.codes.admin);
        });
    }

    form.show(player);
});

uiManager.addUI(config.uinames.codes.redeem, 'Codes redeem', (player) => {
    let form = new ModalForm();
    form.title(`${consts.modal}Redeem Code`);
    form.textField(`Code`, 'Enter your code');
    form.show(player).then(async (res) => {
        if (!res || res.canceled) return;
        const [codeText] = res.formValues;
        if (!codeText) return player.error('Please enter a code');

        await codes.waitReady();
        const doc = codes.getCodeDocumentByCode(codeText);
        if (!doc) return player.error('Code not found or expired');

        const result = await codes.redeem(doc.id, player);
        if (!result.success) {
            if (result.reason === 'ALREADY_REDEEMED') return player.error('This code has already been redeemed');
            return player.error('Unable to redeem code');
        }
    });
});

uiManager.addUI(config.uinames.codes.admin, 'Codes admin menu', async (player) => {
    await codes.waitReady();
    let form = new ActionForm();
    form.title(`${consts.tag}Codes Admin`);
    form.button(`Create Code\n§7Add a new gift code`, '.azalea/1', (plr) => {
        uiManager.open(plr, config.uinames.codes.create);
    });
    const docs = codes.listCodes();
    if (!docs.length) {
        form.body('No codes created yet.');
    }
    for (const doc of docs) {
        form.button(formatCodeSummary(doc), '.azalea/11', (plr) => {
            uiManager.open(plr, config.uinames.codes.details, doc.id);
        });
    }
    form.show(player);
});

uiManager.addUI(config.uinames.codes.create, 'Codes create', (player) => {
    let form = new ModalForm();
    form.title(`${consts.modal}Create Code`);
    form.textField(`Code`, 'Unique code text');
    form.textField(`Redeem message`, 'What players see when redeeming (optional)');
    form.toggle(`Single use?`, false);
    form.textField(`First action`, 'Command or action to run (optional)');

    form.show(player).then(async (res) => {
        if (!res || res.canceled) return;
        const [codeText, display, singleUse, action] = res.formValues;
        if (!codeText) return player.error('Code text is required');

        await codes.waitReady();
        const created = await codes.createCode(codeText, display ?? '', singleUse, action ?? null);
        if (!created) return player.error('Code already exists or could not be created');
        player.success('Code created');
    });
});

uiManager.addUI(config.uinames.codes.manage, 'Codes manage list', async (player) => {
    uiManager.open(config.uinames.codes.admin)
});

uiManager.addUI(config.uinames.codes.details, 'Codes details', async (player, id) => {
    await codes.waitReady();
    const doc = codes.getCodeDocumentById(id);
    if (!doc) return player.error('Code not found');
    const data = doc.data;
    let form = new ActionForm();
    form.title(`${consts.tag}Code Details`);

    form.button(`§aAdd Action`, '.azalea/1', (plr) => {
        uiManager.open(plr, config.uinames.codes.addAction, id);
    });

    if (Array.isArray(data.actions) && data.actions.length) {
        for (const action of data.actions) {
            form.button(`${action.action}\n§7[REMOVE]`, '.azalea/4', async (plr) => {
                await codes.removeAction(id, action.id);
                uiManager.open(plr, config.uinames.codes.details, id);
            });
        }
    } else {
        form.button(`No actions set`, '.azalea/4', () => {});
    }

    form.button(`§4Delete Code`, '.azalea/SidebarTrash', async (plr) => {
        await codes.deleteCode(id);
        plr.success('Code deleted');
        uiManager.open(plr, config.uinames.codes.admin);
    });

    form.button('§cBack', '.azalea/2', (plr) => {
        uiManager.open(plr, config.uinames.codes.admin);
    });

    form.show(player);
});

uiManager.addUI(config.uinames.codes.addAction, 'Codes add action', (player, id) => {
    let form = new ModalForm();
    form.title(`Code Editor`);
    form.textField(`Action`, 'Command or action to run');
    form.show(player).then(async (res) => {
        if (!res || res.canceled) return;
        const [action] = res.formValues;
        if (!action) return player.error('Action is required');
        await codes.addAction(id, action);
        player.success('Action added');
        uiManager.open(player, config.uinames.codes.details, id);
    });
});
