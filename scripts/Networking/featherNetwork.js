import config from "../config";
import { prismarineDb } from "../Libraries/prismarinedb";
import { SegmentedStoragePrismarine } from "../Libraries/Storage/segmented";
import { http, HttpHeader, HttpMethod, HttpRequest } from "./index";
import { system, world } from '@minecraft/server'

class FeatherNetwork {
    constructor() {
        this.connected = false
        system.run(async () => {
            this.db = prismarineDb.customStorage('FeatherNetworkMenus', SegmentedStoragePrismarine)
            await system.waitTicks(10)
            let req = new HttpRequest(`${config.config.mcbetools}/feather`);
            req.addHeader('User-Agent', 'application/json')
            req.setMethod('Get')
            http.makeRequest(req, (status, body) => {
                try {
                    if (status == 200) { this.connected = true } else { this.connected = false }
                } catch {
                    console.log('a')
                    this.connected = false
                }
            })
        })
        system.runInterval(() => {
            if (!http.enabled) return;
            let req = new HttpRequest(`${config.config.mcbetools}/feather`);
            req.addHeader('User-Agent', 'application/json')
            req.setMethod('Get')
            http.makeRequest(req, (status, body) => {
                try {
                    if (status == 200) { this.connected = true } else { this.connected = false }
                } catch {
                    console.log('a')
                    this.connected = false
                }
            })
        }, 300)
    }
    isConnected() {
        return this.connected
    }
    async upload(displayName, ui, auth) {
        return new Promise((resolve, reject) => {
            let data = ui.data
            let updated = ui.updatedAt
            let version = config.info.version
            if (!auth) return;
            let req = new HttpRequest(`${config.config.mcbetools}/feather/publish`)
            req.setMethod("Post")
            req.addHeader('User-Agent', 'application/json')
            req.setBodyJson({
                token: auth,
                type: 'Standalone',
                updated,
                version,
                d: JSON.stringify(data),
                displayName
            })
            http.makeRequest(req, (status, body) => {
                this.db.insertDocument({
                    accessToken: body.accessToken,
                    uiID: ui.id
                })
                resolve(true)
            })
        })
    }
    async getUIs() {
        return new Promise((resolve, reject) => {
            const req = new HttpRequest(`${config.config.mcbetools}/feather/get-uis`)
            req.setMethod('Get')
            req.addHeader('User-Agent', 'application/json')
            http.makeRequest(req, (status, body) => {
                if (status == 200) {
                    let a = body
                    resolve(a)
                } else {
                    reject(new Error(`Request failed with status ${status}`))
                }
            })
        })
    }
    async unpublish(uiID, auth) {
        return new Promise((resolve, reject) => {
            let pub = this.db.findFirst({ uiID })
            if (!pub) return;
            let body = {
                accessToken: pub.data.accessToken,
                uiID,
                token: auth
            }
            let req = new HttpRequest(`${config.config.mcbetools}/feather/unpublish`)
            req.setBodyJson(body)
            req.addHeader('User-Agent', 'application/json')
            req.setMethod("Post")
            http.makeRequest(req, (status, body) => {
                if (status == 200) {
                    this.db.deleteDocumentByID({uiID})
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }
    isPublished(uiID) {
        return new Promise((resolve, reject) => {
            let pub = this.db.findFirst({ uiID })
            if (!pub) resolve(false)
            let req = new HttpRequest(`${config.config.mcbetools}/feather/check-ui`)
            let body = {
                accessToken: pub.data.accessToken,
            }
            req.setBodyJson(body)
            req.addHeader('User-Agent', 'application/json')
            req.setMethod('Get')
            http.makeRequest(req, (status, body) => {
                if (status == 200) {
                    resolve(true)
                } else {
                    this.db.deleteDocumentByID(pub.id)
                    resolve(false)
                }
            })
        })
    }
}

export default new FeatherNetwork;