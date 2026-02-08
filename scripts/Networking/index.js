import { system, world } from "@minecraft/server";
import communication from "./communication";

class HttpHeader {
    constructor(key, value) {
        this.key = key
        this.value = value
    }
}

class HttpMethod {
    static Get = "Get"
    static Post = "Post"
    static Put = "Put"
    static Delete = "Delete"
}

class HttpRequest {
    constructor(url) {
        this.url = url;
        this.headers = []
        this.method = new HttpMethod().Get
        this.timeout = 60
    }

    /**
    *
    * @param {string} key Key
    * @param {string} value Value
    * 
    */
    addHeader(key, value) {
        this.headers.push({ key, value })
    }
    setBody(body) {
        this.body = body
    }
    setBodyJson(body) {
        this.body = JSON.stringify(body)
    }
    addHeaderClass(c) {
        this.headers.push(c)
    }
    setMethod(method) {
        this.method = method
    }
    setTimeout(timeout) {
        this.timeout = timeout
    }
}

class Networking {
    constructor() {
        system.run(() => {
            this.bds = false
            this.bot = false
            communication.register('networking:bdslayerinstalled', ({ args,a }) => {
                this.bds = true
                console.log('[FeatherNetworking] BDS Networking layer is installed')
                system.sendScriptEvent('networking:feathernetworkinginstalled')
                communication.unregister('networking:bdslayerinstalled')
            })
            communication.register('networking:botinserver', ({ args, bot }) => {
                if (this.bot) return;
                this.bot = true
                bot.addTag('networking:isBot')
            })
            world.beforeEvents.playerLeave.subscribe(e => {
                if (e.player.hasTag('networking:isBot')) {
                    bot.removeTag('networking:isBot') // probably will not work but bot is not made yet so i cant test it
                    this.bot = false
                }
            })
        })
    }
    /**
    *
    * @param {HttpRequest} request Http request, must be an instance of HttpRequest class
    *
    */
    async request(request) {
        return new Promise((resolve, reject) => {
            const requestID = Date.now()
            let finished = false

            const timeoutHandle = system.runTimeout(() => {
                if (finished) return
                finished = true

                communication.unregister('networking:responseBDS:' + requestID)
                reject(new Error("HTTP request timed out"))
            }, request.timeout * 20)
            let doneSomething = false
            if (this.bds) {
                communication.register('networking:responseBDS:' + requestID, ({ args,a }) => {
                    if (finished) return
                    finished = true

                    system.clearRun(timeoutHandle)
                    communication.unregister('networking:responseBDS:' + requestID)

                    try {
                        resolve(JSON.parse(args.join(' ')))
                    } catch (err) {
                        reject(err)
                    }
                })

                system.sendScriptEvent(
                    'networking:requestBDS',
                    `${requestID} ${JSON.stringify(request)}`
                )
                doneSomething = true
            }
            if(!doneSomething) reject(new Error('No networking-compatible layer detected')), system.clearJob(timeoutHandle)
        })
    }

}

var http = new Networking()
var Method = new HttpMethod()

export { http, HttpHeader, Method, HttpRequest }