import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'
import { array_move } from './array_move'

class uiBuilder {
    constructor() {
        system.run(async () => {
            this.db = prismarineDb.customStorage('uiBuilder', SegmentedStoragePrismarine)
            this.kv = await this.db.keyval('values')
        })
    }
    create(name, body, scriptevent, layout) {
        if(this.db.findFirst({scriptevent})) throw new Error('UIBuilderError: Scriptevent already found, please choose another one');
        let ui = this.db.insertDocument({
            name,
            body,
            scriptevent,
            layout,
            theme: 0,
            type: 'UI',
            buttons: []
        })
        return ui;
    }
    delete(id) {
        this.db.trashDocumentByID(id);
        // this.db.deleteDocumentByID(id)
        return
    }
    recover(id) {
        this.db.untrashDocumentByID(id);
        return
    }
    get(id) {
        return this.db.getByID(id)
    }
    edit(id,name,body,scriptevent,layout) {
        let doc = this.db.getByID(id)
        if(!doc) throw new Error('Invalid ID or UI without any properties');
        doc.data.name = name
        doc.data.body = body
        doc.data.scriptevent = scriptevent
        doc.data.layout = layout
        this.db.overwriteDataByID(id, doc.data)
        return doc.id;
    }
    editTheme(id,theme) {
        let doc = this.db.getByID(id)
        if(!doc) throw new Error('Invalid ID or UI without any properties');
        doc.data.theme = theme
        this.db.overwriteDataByID(id,doc.data)
        return doc.id;
    }
    addFolder(name) {
        return this.db.createFolder(name);
    }
    deleteFolder(name) {
        return this.db.deleteFolder(name);
    }
    addToFolder(id,name) {
        return this.db.addDocumentToFolder(name,id)
    }
    addAction(uiID,bid,action) {
        let ui = this.db.getByID(uiID)
        if(!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_=>_.id === bid)
        if(!btn) throw new Error('UIBuilderError: Could not find button');
        btn.actions.push({action,id:Date.now()})
        this.db.overwriteDataByID(uiID, ui.data)
        return true;
    }
    editAction(uiID,bid,actionID,newAction) {
        let ui = this.db.getByID(uiID)
        if(!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_=>_.id === bid)
        if(!btn) throw new Error('UIBuilderError: Could not find button');
        let action = btn.actions.findIndex(_=>_.id === actionID)
        if(action === -1) throw new Error(`UIBuilderError: Could not find action`);
        btn.actions[action].action = newAction
        this.db.overwriteDataByID(uiID, ui.data)
    }
    removeAction(uiID,bid,actionID) {
        let ui = this.db.getByID(uiID)
        if(!ui) throw new Error('UIBuilderError: Could not find UI');
        let btn = ui.data.buttons.find(_=>_.id === bid)
        if(!btn) throw new Error('UIBuilderError: Could not find button');
        let action = btn.actions.findIndex(_=>_.id === actionID)
        if(action === -1) throw new Error(`UIBuilderError: Could not find action`);
        btn.actions.splice(action, 1)
        this.db.overwriteDataByID(uiID, ui.data)
    }
    moveActioninButton(uiID,bid,actionID, direction){
        const doc = this.db.getByID(uiID);
        if(!doc) return;
        const btn = doc.data.buttons.find(_=>_.id===bid)
        if(!btn) return;
        const index = btn.actions.findIndex(_=>_.id===actionID)
        if(index === -1) return;
        let newIndex = direction == "up" ? index - 1 < 0 ? 0 : index - 1 : index + 1 >= btn.actions.length ? btn.actions.length - 1 : index + 1
        array_move(btn.actions, index, newIndex);
        this.db.overwriteDataByID(uiID, doc.data);
        return newIndex;
    }
    moveButtonInUI(id, id2,direction){
        const doc = this.getByID(id);
        if(!doc) return;
        let index = doc.data.buttons.findIndex(_=>_.id===id2)
        if(index = -1) return;
        let newIndex = direction == "up" ? index - 1 < 0 ? 0 : index - 1 : index + 1 >= doc.data.buttons.length ? doc.data.buttons.length - 1 : index + 1
        array_move(doc.data.buttons, index, newIndex);
        this.db.overwriteDataByID(id, doc.data);
        return newIndex;
    }
    async removeFromFolder(id,name) {
        await this.db.loadFolders()
        let folder = this.db.folders.find(_=>_.name==name)
        let folderIndex = this.db.folders.findIndex(_=>_.name==name)
        let doc = folder.documentIDs.findIndex(_=>_==id)
        if(doc < 0) return 'doc';
        if(!folder) return 'folder';
        folder.documentIDs.splice(doc, 1)
        this.db.folders[folderIndex] = folder
        this.db.saveFolders()
        return true;
    }
    getButton(uiid,bid) {
        let ui = this.get(uiid)
        if(!ui) return;
        let btn = ui.data.buttons.find(_=>_.id===bid)
        if(!btn) return;
        return btn
    }
    buttonIcon(id,id2,icon) {
        let ui = this.get(id)
        if(!ui) throw new Error(`Invalid UI Id`);
        let btn = ui.data.buttons.find(_=>_.id===id2)
        if(!btn) throw new Error(`Invalid button id`);
        btn.icon = icon
        this.db.overwriteDataByID(id,ui.data)
        return true;
    }
    uiIcon(id, icon) {
        let doc = this.get(id)
        if(!doc) throw new Error('Invalid ID');
        doc.data.icon = icon
        this.db.overwriteDataByID(id, doc.data)
        return true;
    }
    addButton(id2,text,subtext,requiredTag,icon,action) {
        let doc = this.db.getByID(id2)
        if(!doc) throw new Error('Invalid ID or UI without any properties');
        let id = Date.now()
        doc.data.buttons.push({
            text,
            subtext,
            requiredTag,
            icon,
            actions: [{action,id:Date.now() + 1}],
            id,
            type: 'button'
        })
        this.db.overwriteDataByID(id2, doc.data)
        return id;
    }
    deleteButton(id,id2) {
        let ui = this.get(id)
        if(!ui) throw new Error('Invalid UI');
        let index = ui.data.buttons.findIndex(_=>_.id===id2)
        if(index < 0) throw new Error('Invalid button');
        ui.data.buttons.splice(index, 1)
        this.db.overwriteDataByID(id, ui.data)
        return true;
    }
    editButton(id,id2,text,subtext,requiredTag,icon) {
        let doc = this.db.getByID(id)
        if(!doc) throw new Error('Invalid ID or UI without any properties');
        let index = doc.data.buttons.findIndex(_=>_.id === id2)
        if(index < 0) throw new Error('Invalid Button ID');
        doc.data.buttons[index].text = text
        doc.data.buttons[index].subtext = subtext
        doc.data.buttons[index].requiredTag = requiredTag
        doc.data.buttons[index].icon = icon
        this.db.overwriteDataByID(id, doc.data)
        return;
    }
}

export default new uiBuilder();