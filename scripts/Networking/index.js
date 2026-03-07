import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import SHA256 from "../Libraries/sha256";
import { JSEncrypt } from "../Libraries/jsencrypt-lib/JSEncrypt";
import config from "../config";
import { Router } from './ipc/router'
let pubKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAz8Ki8imK6Ia3rx9418gXQBFEyRWEtVZVyLfQ0va/oMArmfeP/yoL
+mIxk/Mwb7H2vo+aht6Z/xfY0ABHmNXYfvZi+4PTO+DiEgO/L3QEfQ5kNNuITJPV
TiWKwtpD5LWjIRe55mGsRoPkX4Fy3pfUbm5TJ/Wp1kMd6CDAWFUfZqSEGV/5QN6A
4c90tiPTfQdejLmjYo78hVmpZ7AraKfAH7f/jRVNVCzNucRaGw+gdcpr4sfJ07oT
3TjYhy1hj7tD1KmqvjZrHwgPMWmdPz3laUku/T4afIMBdiFrbAw7LyAZG3H6EwfX
kziwMYJj8oqbVUcs/dt2Au4haOMLVhYS3wIDAQAB
-----END RSA PUBLIC KEY-----`;
let ipc = new Router("LeafNet")

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

class HTTP {
    constructor() {
        // this.player = {isValid: function() {return true}};
        this.player = null;
        this.requests = new Map();
        this.requests2 = new Map();
        this.bds = false;
        system.run(() => {
            system.sendScriptEvent('leaf:req2', 'loaded')
            system.afterEvents.scriptEventReceive.subscribe(e => {
                if (e.id == "leaf:req1") {
                    this.enabled = true
                    this.bds = true
                }
                if (e.id == 'leaf:req3') {
                    this.enabled = false;
                    this.bds = false;
                }
            })
        })
    }
    setPlayer(player) {
        // if (!this.player || !this.player.id || player.id !== this.player.id) {
        //     if(config.DiscordLoggingWebhook) {
        //         this.player = player;
        //         this.makeRequest({
        //             method: 'post',
        //             url: config.DiscordLoggingWebhook,
        //             data: {
        //                 avatar_url: config.Discord.AvatarURL,
        //                 username: config.Discord.Username,
        //                 embeds: [
        //                     {
        //                         color: 0x4DB6AC,
        //                         description: `**External Networking** has been enabled!\n\`\`\`\nConnector Bot >> ${this.player.name}\n\`\`\``
        //                     }
        //                 ]
        //             }
        //         })

        //     }
        // }
        this.player = player;
    }
    makeRequest(request, response) {
        let id = Date.now().toString();
        this.requests.set(id, response);
        this.requests2.set(id, "");
        if (!this.bds && this.player) {
            this.player.sendMessage(
                JSON.stringify({
                    command: "make_request",
                    request,
                    id,
                })
            );
        } else if(this.bds) {
            system.run(() => {
                ipc.invokeAuto({
                    event: "leafnet:req",
                    payload: JSON.stringify(request),
                    force: true
                }).then(val2 => {
                    let val = JSON.parse(val2)
                    console.warn(val)
                    let body = val[1];
                    try {
                        body = JSON.stringify(JSON.parse(val[1]))
                    } catch { };
                    if (!body) body = val[1]
                    response(val[0], body)
                })

            })
        }
        // this.player.sendMessage(
        //     JSON.stringify({
        //         command: "make_request",
        //         request: args,
        //         id,
        //     })
        // );

    }
}
let http = new HTTP();
function getSpkiDer(spkiPem) {
    const pemHeader = "-----BEGIN RSA PUBLIC KEY-----";
    const pemFooter = "-----END RSA PUBLIC KEY-----";
    var pemContents = spkiPem.substring(
        pemHeader.length,
        spkiPem.length - pemFooter.length
    );
    var binaryDerString = window.atob(pemContents);
    return str2ab(binaryDerString);
}
system.waitTicks(5).then(() => {
    system.afterEvents.scriptEventReceive.subscribe(e => {
        if (e.id == "leaf:req1") {
            http.setPlayer(true)
        }
    })
    system.sendScriptEvent('leaf:req2', 'loaded')

})
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function hexToStr(str) {
    return str
        .split(".")
        .map((_) => {
            return String.fromCharCode(parseInt(_, 16));
        })
        .join("");
}
world.beforeEvents.chatSend.subscribe(async (e) => {
    if (e.message == ".LEAF") {
        console.log('a')
        e.sender.sendMessage(".LEAF_INSTALLED");
    }
    if (e.message.startsWith(".NETWORKING_LIB-COMPATIBLE-PLAYER:")) {
        e.cancel = true;
        // much security
        let signature = e.message.substring(
            ".NETWORKING_LIB-COMPATIBLE-PLAYER:".length
        );
        let jsenc = new JSEncrypt();
        jsenc.setPublicKey(pubKey);
        let val = `${e.sender.name}/${Math.floor(Date.now() / 10000)}`;
        // console.log(val)
        let verified = jsenc.verify(val, signature, SHA256);
        if (!verified) {
            e.cancel = true;
            console.log('inv sign')
            e.sender.sendMessage(`ERROR: Invalid signature`);
        } else {
            e.cancel = true;
            http.enabled = true;
            // e.cancel = true;
            http.setPlayer(e.sender);
        }
    }
    if (http.player && e.sender.id == http.player.id) {
        // // console.warn(e.message)
        //503
        if (e.message.startsWith(`.APPEND:`)) {
            e.cancel = true;
            let id = e.message.substring(".APPEND:".length).split(",")[0];
            let data = e.message
                .substring(".APPEND:".length)
                .split(",")
                .slice(1)
                .join(",");
            if (!http.requests2.has(id)) return;
            http.requests2.set(id, http.requests2.get(id) + data);
        }
        if (e.message.startsWith(`.END:`)) {
            e.cancel = true;
            let id = e.message.substring(`.END:`.length);
            let msg = http.requests2.get(id);
            // world.sendMessage(msg)
            if (msg) {
                if (msg.startsWith(`.RES:`)) {
                    // e.cancel = true;
                    let status = parseInt(
                        msg.substring(".RES:".length).split(",", 3)[0]
                    );
                    let id = msg.substring(".RES:".length).split(",", 3)[1];
                    let data = msg
                        .substring(".RES:".length)
                        .split(",")
                        .slice(2)
                        .join(",");
                    if (http.requests.has(id)) {
                        system.run(() => {
                            world.sendMessage(hexToStr(data))
                            http.requests.get(id)(status, hexToStr(data));
                        });
                    }
                }
            }
        }
    }
    if (e.message == "_test") {
        let rqst = new HttpRequest("https://nekos.life/api/v2/cat");
        rqst.addHeader("User-Agent", "Feather/" + config.info.versionString());
        rqst.setMethod("Get");
        http.makeRequest(
            rqst,
            (status, data) => {
                // world.sendMessage(`sent message`)
                world.sendMessage(
                    `Received a response from https://nekos.life/api/v2/cat with status ${status} and data:\n${data}`
                );
            }
        );
        e.cancel = true
    }
});
export { http, HttpRequest, HttpMethod, HttpHeader };