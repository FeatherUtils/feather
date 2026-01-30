import { prismarineDb } from "../Libraries/prismarinedb";
import { system } from "@minecraft/server";

class Binding {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('+FTR:Binding')
            for (const doc of this.db.findDocuments()) {
                if (!doc.data.type) doc.data.type === 'typeid'
                this.db.overwriteDataByID(doc.id,doc.data)
            }
        })
    }
    add(typeID, cmd) {
        if (this.db.findFirst({ typeID, type: 'typeid' })) return;
        this.db.insertDocument({
            typeID,
            cmd,
            type: 'typeid'
        })
    }
    addItemName(typeID, itemName, cmd) {
        if (this.db.findFirst({ type: 'itemname', typeID, itemName })) return;
        this.db.insertDocument({
            type: 'itemname',
            typeID,
            itemName,
            cmd
        })
    }
    remove(typeID) {
        let bind = this.db.findFirst({ typeID,type:'typeid' })
        if (!bind) return;
        this.db.deleteDocumentByID(bind.id)
    }
    removeItemName(itemName,typeID) {
        let bind = this.db.findFirst({type:'itemname',typeID,itemName})
        if(!bind) return;
        this.db.deleteDocumentByID(bind.id)
    }
}

export default new Binding;