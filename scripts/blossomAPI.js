import * as mc from '@minecraft/server'

class blossomAPI {
    constructor() {
        this.dimension = mc.world.getDimension("overworld");
    }

    stringify(json) {
        return JSON.stringify(json);
    }

    async findFirst(table, item) {
        return new Promise((resolve, reject) => {
            this.dimension.runCommand(`scriptevent blossom:findFirst ${table} ${item}`);

            const eventListener = mc.system.afterEvents.scriptEventReceive.subscribe((e) => {
                if (e.id === `blossomfoundFromTable:${table}`) {
                    resolve(JSON.parse(e.message.replaceAll("✓", "")));
                    mc.system.afterEvents.scriptEventReceive.unsubscribe(eventListener);
                }
            });
        });
    }

    async findDocuments(table) {
        return new Promise((resolve, reject) => {
            this.dimension.runCommand(`scriptevent blossom:findDocuments ${table}`);

            const eventListener = mc.system.afterEvents.scriptEventReceive.subscribe((e) => {
                if (e.id === `blossomFoundDocumentsFrom:${table}`) {
                    console.log(e.message)
                    resolve(JSON.parse(e.message.replaceAll("✓", "")));
                    mc.system.afterEvents.scriptEventReceive.unsubscribe(eventListener);
                }
            });
        });
    }
    insertDocument(table, json) {
    const escapedJson = JSON.stringify(json);
        this.dimension.runCommand(`scriptevent blossom:insertDoc ${table} ${escapedJson}`);
    }
    
    overwriteData(table, json) {
        const escapedJson = JSON.stringify(json);
        this.dimension.runCommand(`scriptevent blossom:overwriteData ${table} ${escapedJson}`);
    }
    
    deleteDocument(table, docID) {
        this.dimension.runCommand(`scriptevent blossom:deleteDocument ${table} ${docID}`);
    }
}


export const blossom = new blossomAPI();