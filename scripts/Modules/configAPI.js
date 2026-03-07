import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";

class ConfigAPI {
    constructor() {
        this.Types = {
            Number: 0,
            String: 1,
            List: 2,
            Boolean: 3,
        };
        this.propertiesRegistered = {};
        this.db = prismarineDb.customStorage("LEAF_MODULES", SegmentedStoragePrismarine);
        this.uiManager = null;
        import("../Libraries/uiManager").then(mod=>{
            this.uiManager = mod.default
        })
        this.ready = Promise.all([
            this.db.waitLoad()
        ])
        this.onChanges = [];
        this.initializeScriptevents();
    }
    registerProperty(name, type, defaultValue = null, extracfg = {}) {
        this.propertiesRegistered[name] = {
            type,
            defaultValue,
            ...extracfg
        };
    }
    initializeScriptevents() {
        system.afterEvents.scriptEventReceive.subscribe(e=>{
            if(e.id == "leafconf:open_editor" && e.sourceEntity && e.sourceEntity.typeId === "minecraft:player") {
                this.openEditor(e.sourceEntity, e.message)
            }
            if(e.id == "leafconf:reset") {
                this.resetProperty(e.message)
            }
        })
    }
    openEditor(player, property) {
        let editor = this.propertiesRegistered[property].editor
        if(editor && typeof editor === "string" && editor.startsWith('leafgui/')) {
            this.uiManager.open(player, editor.substring('leafgui/'.length), property)
        }
    }
    #getPropertyStorageID() {
        let doc = this.db.findFirst({ type: "__CFG" });
        if (doc) return doc.id;
        let data = {};
        for (const property in this.propertiesRegistered) {
            if (this.propertiesRegistered[property].defaultValue != null)
                data[property] =
                    this.propertiesRegistered[property].defaultValue;
        }
        let id = this.db.insertDocument({
            type: "__CFG",
            data,
        });
        this.db.save();
        return id;
    }
    onChangeProperty(fn) {
        this.onChanges.push(fn)
    }
    setProperty(property, value) {
        if (!this.propertiesRegistered[property]) return;
        let id = this.#getPropertyStorageID();
        let doc = this.db.getByID(id);
        let data = doc.data && doc.data.data ? doc.data.data : {};
        if (
            this.propertiesRegistered[property].type == this.Types.Number &&
            typeof value !== "number"
        )
            throw new Error("Property is not number");
        if (
            this.propertiesRegistered[property].type == this.Types.String &&
            typeof value !== "string"
        )
            throw new Error("Property is not string");
        if (
            this.propertiesRegistered[property].type == this.Types.Boolean &&
            typeof value !== "boolean"
        )
            throw new Error("Property is not bolean");
        if (
            this.propertiesRegistered[property].type == this.Types.List &&
            typeof value !== "object" &&
            !Array.isArray(value)
        )
            throw new Error("Property is not list");

        data[property] = value;
        doc.data.data = data;
        this.db.overwriteDataByID(doc.id, doc.data);
        for(const onChange of this.onChanges) {
            onChange(property, value)
        }
        this.db.save();
    }
    resetProperty(property) {
        if (!this.propertiesRegistered[property]) return;
        let id = this.#getPropertyStorageID();
        let doc = this.db.getByID(id);
        let data = doc.data && doc.data.data ? doc.data.data : {};
        if (this.propertiesRegistered[property].defaultValue != null) {
            data[property] = this.propertiesRegistered[property].defaultValue;
        } else {
            delete data[property];
        }
        doc.data.data = data;
        this.db.overwriteDataByID(doc.id, doc.data);
        this.db.save();
    }
    getProperty(property) {
        if (!this.propertiesRegistered[property]) return null;
        let id = this.#getPropertyStorageID();
        let doc = this.db.getByID(id);
        let data = doc.data && doc.data.data ? doc.data.data : {};
        return data.hasOwnProperty(property)
            ? data[property]
            : this.propertiesRegistered[property].defaultValue != null
            ? this.propertiesRegistered[property].defaultValue
            : this.propertiesRegistered[property].type == this.Types.Boolean
            ? false
            : this.propertiesRegistered[property].type == this.Types.List
            ? []
            : this.propertiesRegistered[property].type == this.Types.Number
            ? 0
            : this.propertiesRegistered[property].type == this.Types.String
            ? ""
            : "";
    }
}

export default new ConfigAPI();