import { prismarineDb } from "../Libraries/prismarinedb";
import { system } from "@minecraft/server";

class Binding {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('+FTR:Binding')
        })
    }
    add(typeID, cmd) {
        if (this.db.findFirst({ typeID })) return;
        this.db.insertDocument({
            typeID,
            cmd
        })
    }
    remove(typeID) {
        let bind = this.db.findFirst({ typeID })
        if (!bind) return;
        this.db.deleteDocumentByID(bind.id)
    }
}

export default new Binding;