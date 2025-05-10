import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";

class Bounty {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.table('+FTR:BOUNTY')
        })
    }
}