import { system, world } from "@minecraft/server";
import { playerAPI, prismarineDb } from "../Libraries/prismarinedb";
import formatter from "../Formatting/formatter";
import { array_move } from "./array_move";

class SidebarEditor {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('SidebarEditor')
            this.run();
        })
    }
    run() {
        system.runInterval(async () => {
            for (const plr of world.getPlayers()) {
                let sd = playerAPI.getFirstTagStartingWithPrefix(plr, `sidebar:`, true)
                if (!sd) {
                    let sd2 = this.getDefault();
                    if (!sd2) continue;
                    let rawtext = await this.parseSidebar(sd2.id, plr)
                    plr.onScreenDisplay.setTitle(rawtext)
                    continue;
                }
                let rawtext = await this.parseSidebar(sd.id, plr)
                plr.onScreenDisplay.setTitle(rawtext)
                continue;
            }
        }, 3)
    }
    addSidebar(name) {
        let s1 = this.db.findFirst({ isDefault: true })
        let isDefault = false;
        if (!s1) isDefault = true;
        let s2 = this.db.findFirst({ name })
        if (s2) throw new Error('SidebarEditorError: Name already found in database');
        let id = this.db.insertDocument({
            name,
            isDefault,
            lines: []
        })
        return id;
    }
    getDefault() {
        return this.db.findFirst({ isDefault: true })
    }
    del(id) {
        this.db.deleteDocumentByID(id)
    }
    editName(id, name) {
        let sd = this.db.getByID(id)
        if (!sd) return false;
        sd.data.name = name
        this.db.overwriteDataByID(id, sd.data)
        return true;
    }
    get(id) {
        return this.db.getByID(id)
    }
    addLine(sdid, text) {
        let sd = this.get(sdid)
        if (!sd) return false;
        let id = Date.now()
        sd.data.lines.push({
            text,
            id
        })
        this.db.overwriteDataByID(sdid, sd.data);
        return id;
    }
    getLine(sdid, id) {
        let sd = this.get(sdid)
        if (!sd) return false;
        return sd.data.lines.find(_ => _.id === id)
    }
    getLineIndex(sdid, id) {
        let sd = this.get(sdid)
        if (!sd) return false;
        return sd.data.lines.findIndex(_ => _.id === id)
    }
    moveLineInSidebar(id, id2, direction) {
        const doc = this.get(id);
        if (!doc) return console.log('not found lil bro');
        let index = this.getLineIndex(id, id2)
        if (index == -1) return console.log('idk');
        let newIndex = direction == "up" ? index - 1 < 0 ? 0 : index - 1 : index + 1 >= doc.data.lines.length ? doc.data.lines.length - 1 : index + 1
        array_move(doc.data.lines, index, newIndex);
        this.db.overwriteDataByID(id, doc.data);
        return newIndex;
    }
    delLine(sdid, id) {
        let sd = this.get(sdid);
        if (!sd) return false;
        let lineindex = this.getLineIndex(sdid, id)
        if (lineindex < 0) return false;
        sd.data.lines.splice(lineindex, 1)
        this.db.overwriteDataByID(sdid, sd.data)
        return true;
    }
    editLine(sdid, id, text) {
        let sd = this.get(sdid)
        if (!sd) return false;
        let ln = sd.data.lines.find(_ => _.id === id)
        if (!ln) return false;
        ln.text = text
        this.db.overwriteDataByID(sdid, sd.data)
        return true;
    }
    async parseLine(sdid, id, plr) {
        let ln = this.getLine(sdid, id)
        if (!ln) return false;
        return await formatter.format(ln.text, plr);
    }
    async parseSidebar(id, plr) {
        let sd = this.get(id)
        if (!sd) return false;
        let lines = [];
        for (const ln of sd.data.lines) {
            let ln2 = await this.parseLine(sd.id, ln.id, plr)
            lines.push(ln2)
        }
        return lines.join(`\n§r`)
    }
}

export default new SidebarEditor;