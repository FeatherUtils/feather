import { prismarineDb } from '../Libraries/prismarinedb'
import { system, world } from '@minecraft/server'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'
import { array_move } from './array_move'
import icons from './icons'
import uiBuilder from './uiBuilder'

class ChestBuilder {
    constructor() {
        this.db = prismarineDb.customStorage('ChestBuilder', SegmentedStoragePrismarine)
    }
    create(title, uniqueId, rows) {
        if (this.db.findFirst({ uniqueId })) throw new Error('ChestBuilderError: Unique ID already found, please choose another one');
        if (uiBuilder.db.findFirst({ scriptevent: uniqueId })) throw new Error('Found action form with unique id. Please choose a different id')
        this.db.insertDocument({
            title,
            uniqueId,
            rows,
            type: 'ChestUI',
            buttons: []
        })
    }
    delete(id) {
        return this.db.deleteDocumentByID(id)
    }
    get(id) {
        return this.db.getByID(id)
    }
    getAll() {
        return this.db.findDocuments({ type: 'ChestUI' })
    }
    edit(id, title, uniqueId, rows) {
        let ui = this.get(id)
        if (!ui) throw new Error('ChestBuilderError: Invalid ID')
        for (const button of ui.data.buttons) {
            if (button.coordinates[0] > rows) throw new Error('There is a button that is lower than rows set, please delete/move the button')
        }
        if (this.db.findFirst({ uniqueId }) && uniqueId !== ui.data.uniqueId) throw new Error('ChestBuilderError: Unique ID already found, please choose another one');
        if (uiBuilder.db.findFirst({ scriptevent: uniqueId })) throw new Error('Found action form with unique id. Please choose a different id')
        ui.data.rows = rows
        ui.data.title = title
        ui.data.uniqueId = uniqueId
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    addButton(uiID, text, line1, firstAction, coordinates, requiredTag) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        const id = Date.now()
        let actions = [];
        if (firstAction) actions.push({ action: firstAction, id: Date.now() - 1 })
        ui.data.buttons.push({ text, lore: [line1], actions, id, coordinates, requiredTag })
        this.db.overwriteDataByID(id, ui.data)
        return id;
    }
    editButton(uiID, bID, text, requiredTag) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        button.text = text
        button.requiredTag = requiredTag
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    moveButton(uiID, bID, coordinates) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        button.coordinates = coordinates
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    buttonIcon(uiID, bID, icon) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        let ic = icons.resolve(icon)
        if (!ic) throw new Error('Invalid icon id')
        button.icon = icon
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    addLore(lore) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        button.lore.push(lore)
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    editLore(lore, newLore) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        let l = button.lore.find(_ => _ === lore)
        if (!l) throw new Error('Invalid lore')
        l = newLore
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    delLore(lore) {
        let ui = this.get(uiID)
        if (!ui) throw new Error('Invalid ID')
        let button = ui.data.buttons.find(_ => _.id === bID)
        if (!button) throw new Error('Invalid button id')
        let l = button.lore.findIndex(_ => _ === lore)
        if (l < 0) throw new Error('Invalid lore')
        button.lore.splice(l, 1)
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    moveLoreinButton(uiID, bid, lore, direction) {
        const doc = this.db.getByID(uiID);
        if (!doc) return;
        const btn = doc.data.buttons.find(_ => _.id === bid)
        if (!btn) return;
        const index = btn.lore.findIndex(_ => _ === lore)
        if (index === -1) return;
        let newIndex = direction == "up" ? index - 1 < 0 ? 0 : index - 1 : index + 1 >= btn.lore.length ? btn.lore.length - 1 : index + 1
        array_move(btn.lore, index, newIndex);
        this.db.overwriteDataByID(uiID, doc.data);
        return newIndex;
    }
    addAction(uiID, bid, action) {
        let ui = this.db.getByID(uiID)
        if (!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_ => _.id === bid)
        if (!btn) throw new Error('UIBuilderError: Could not find button');
        btn.actions.push({ action, id: Date.now() })
        this.db.overwriteDataByID(uiID, ui.data)
        return true;
    }
    editAction(uiID, bid, actionID, newAction) {
        let ui = this.db.getByID(uiID)
        if (!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_ => _.id === bid)
        if (!btn) throw new Error('UIBuilderError: Could not find button');
        let action = btn.actions.findIndex(_ => _.id === actionID)
        if (action === -1) throw new Error(`UIBuilderError: Could not find action`);
        btn.actions[action].action = newAction
        this.db.overwriteDataByID(uiID, ui.data)
    }
    removeAction(uiID, bid, actionID) {
        let ui = this.db.getByID(uiID)
        if (!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_ => _.id === bid)
        if (!btn) throw new Error('UIBuilderError: Could not find button');
        let action = btn.actions.findIndex(_ => _.id === actionID)
        if (action === -1) throw new Error(`UIBuilderError: Could not find action`);
        btn.actions.splice(action, 1)
        this.db.overwriteDataByID(uiID, ui.data)
    }
    moveActioninButton(uiID, bid, actionID, direction) {
        const doc = this.db.getByID(uiID);
        if (!doc) return;
        const btn = doc.data.buttons.find(_ => _.id === bid)
        if (!btn) return;
        const index = btn.actions.findIndex(_ => _.id === actionID)
        if (index === -1) return;
        let newIndex = direction == "up" ? index - 1 < 0 ? 0 : index - 1 : index + 1 >= btn.actions.length ? btn.actions.length - 1 : index + 1
        array_move(btn.actions, index, newIndex);
        this.db.overwriteDataByID(uiID, doc.data);
        return newIndex;
    }
}

export default new ChestBuilder;