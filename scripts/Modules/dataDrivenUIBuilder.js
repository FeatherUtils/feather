import { system,world } from '@minecraft/server'
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented'
import { prismarineDb } from '../Libraries/prismarinedb'
import chestBuilder from './chestBuilder'
import uiBuilder from './uiBuilder'

/*
Element example:
{
 type: 'textfield'
 actions: [{command:'/say <val>'}],
 title: 'My TextField',
 description: 'This is an example text field'
}
*/

class DataDrivenUIBuilder {
    constructor() {
        system.run(() => {
            this.db = prismarineDb.customStorage('DDUIBuilder', SegmentedStoragePrismarine)
            this.validTypes = ['divider','spacer','label','button','textfield','slider','dropdown','toggle']
        })
    }
    create(title,body,uniqueId) {
        if(chestBuilder.db.findFirst({uniqueId})) return false;
        if(uiBuilder.db.findFirst({scriptevent:uniqueId})) return false;
        this.db.insertDocument({
            title,
            body,
            uniqueId,
            elements: []
        })
    }
    delete(id) {
        return this.db.deleteDocumentByID(id)
    }
    get(id) {
        return this.db.getByID(id)
    }
    edit(id,title,body,uniqueId) {
        let ui = this.get(id)
        ui.data.title = title
        ui.data.body = body
        ui.data.uniqueId = uniqueId
        return this.db.overwriteDataByID(id,ui.data)
    }
    addDivider(uiID) {
        let ui = this.get(uiID)
        ui.data.elements.push({type:'divider'})
    }
}

export default new DataDrivenUIBuilder;