import { prismarineDb } from "../Libraries/prismarinedb";
import { system,world } from "@minecraft/server"

class PlayerShop {
    constructor() {
        system.run(() => {
            this.Database = prismarineDb.table('PlayerShop')
        })
    }
    createShop(name,description) {

    }
}