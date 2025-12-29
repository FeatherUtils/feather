import { prismarineDb } from '../Libraries/prismarinedb'
import { system } from '@minecraft/server'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'
import actionParser from './actionParser'

class Codes {
    constructor() {
        this.ready = new Promise(resolve => {
            system.run(() => {
                this.Database = prismarineDb.customStorage('Codes', SegmentedStoragePrismarine)
                if (this.Database.waitLoad) {
                    this.Database.waitLoad().then(resolve)
                } else {
                    resolve(true)
                }
            })
        })
    }

    async waitReady() {
        if (this.Database?.loaded) return true;
        return this.ready;
    }

    generateActionData(action) {
        if (!action) return null;
        return { id: Date.now(), action };
    }

    getCodeDocumentById(id) {
        if (!this.Database) return null;
        return this.Database.getByID(id);
    }

    getCodeDocumentByCode(code) {
        if (!this.Database) return null;
        return this.Database.findFirst({ code });
    }

    async createCode(code, redeemDisplay = '', redeemedOnce = false, firstAction = null) {
        await this.waitReady();
        if (!code) return null;
        if (this.getCodeDocumentByCode(code)) return null;
        let actions = [];
        let actionData = this.generateActionData(firstAction);
        if (actionData) actions.push(actionData);
        return this.Database.insertDocument({
            code,
            redeemDisplay,
            redeemedOnce: !!redeemedOnce,
            redeemed: false,
            redeemedBy: [],
            actions
        });
    }

    async deleteCode(id) {
        await this.waitReady();
        const doc = this.getCodeDocumentById(id);
        if (!doc) return false;
        this.Database.deleteDocumentByID(id)
        return true;
    }

    async addAction(id, action) {
        await this.waitReady();
        const doc = this.getCodeDocumentById(id);
        if (!doc) return null;
        const actionData = this.generateActionData(action);
        if (!actionData) return null;
        if (!Array.isArray(doc.data.actions)) doc.data.actions = [];
        doc.data.actions.push(actionData);
        this.Database.overwriteDataByID(id, doc.data);
        return actionData;
    }

    async removeAction(id, actionID) {
        await this.waitReady();
        const doc = this.getCodeDocumentById(id);
        if (!doc || !Array.isArray(doc.data.actions)) return false;
        const actionIndex = doc.data.actions.findIndex(_ => _.id === actionID)
        if (actionIndex < 0) return false;
        doc.data.actions.splice(actionIndex, 1)
        this.Database.overwriteDataByID(id, doc.data);
        return true;
    }

    async redeem(id, player) {
        await this.waitReady();
        const doc = this.getCodeDocumentById(id);
        if (!doc) return { success: false, reason: 'NOT_FOUND' };
        doc.data.redeemedBy = Array.isArray(doc.data.redeemedBy) ? doc.data.redeemedBy : [];

        const redeemedTag = `redeemed:${doc.data.code}`;

        if (doc.data.redeemedOnce && player.hasTag(redeemedTag)) {
            return { success: false, reason: 'ALREADY_REDEEMED' };
        }

        if (Array.isArray(doc.data.actions)) {
            for (const action of doc.data.actions) {
                if (!action?.action) continue;
                actionParser.runAction(player, action.action)
            }
        }

        if (doc.data.redeemedOnce) {
            doc.data.redeemed = true;
            if (!player.hasTag(redeemedTag)) player.addTag(redeemedTag);
        }

        if (Array.isArray(doc.data.redeemedBy) && !doc.data.redeemedBy.includes(player.id)) {
            doc.data.redeemedBy.push(player.id);
        }

        this.Database.overwriteDataByID(id, doc.data);

        if (doc.data.redeemDisplay) {
            if (typeof player.success === 'function') player.success(doc.data.redeemDisplay)
            else player.sendMessage(doc.data.redeemDisplay)
        }

        return { success: true, reason: 'REDEEMED' };
    }

    listCodes() {
        if (!this.Database) return [];
        return this.Database.findDocuments();
    }
}

export default new Codes();
