import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";

class SidebarEditor {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('SidebarEditor')
        })
    }
    addSidebar(name) {
        let s1 = this.db.findFirst({isDefault:true})
        let isDefault = false;
        if(!s1) isDefault = true;
        let s2 = this.db.findFirst({name})
        if(s2) throw new Error('SidebarEditorError: Name already found in database');
        
    }
}