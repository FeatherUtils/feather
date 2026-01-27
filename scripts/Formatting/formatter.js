import { world, system } from "@minecraft/server";
import emojis from './emojis'
import ranks from "../Modules/ranks";
import { getTPS } from "./format/tps";
import { getPlayers } from "./format/online";
import events from "../Modules/events";
import modules from "../Modules/modules";
import keyvalues from "../Modules/keyvalues";

function abbreviateNumber(number, decPlaces) {
    const suffixes = ["k", "m", "b", "t"];
    const decScale = Math.pow(10, decPlaces);

    for (let i = suffixes.length - 1; i >= 0; i--) {
        const size = Math.pow(10, (i + 1) * 3);
        if (size <= number) {
            number = Math.round((number * decScale) / size) / decScale;
            if (number === 1000 && i < suffixes.length - 1) {
                number = 1;
                i++;
            }
            number += suffixes[i];
            break;
        }
    }
    return number;
}

class BlossomFormatting {
    #vars;
    constructor() {
        this.#vars = {};
    }
    push(name, fn) {
        if (typeof fn !== "function") return;
        this.#vars[name] = fn;
    }
    getVars() {
        let varis = []
        for (const variable in this.#vars) {
            varis.push(variable)
        }
        return varis.join(', ')
    }
    getName(player) {
        let n = player.getDynamicProperty('nickname')
        if (n) {
            return n;
        }
        return player.name
    }
    getRealName(player) {
        return player.name
    }
    async format(text, player, msg = undefined, watchyoJET = false) {
        function extractBracketValue(line) {
            if (typeof line === 'string') {
                const match = line.match(/{{(.*?)}}/);
                return match ? match[1] : null;
            }
            return null;
        }

        let value = extractBracketValue(text);
        let newLine = text;

        let rs = ranks.getRanks(player);
        let rns = [];
        let nc, cc, bc;
        if (!watchyoJET) {
            for (const r of rs) {
                rns.push(await this.format(r.name, player, undefined, true));
            }
            if (rns.length === 0) {
                rns.push(`§bMember`);
            }
            for (const r of rs) {
                nc = r.nc;
                cc = r.cc;
                bc = r.bc;
            }
        }
        this.#vars.nc = () => nc;
        this.#vars.cc = () => cc;
        this.#vars.bc = () => bc;

        this.#vars.arrow = () => '»'


        this.#vars.realname = this.getRealName;
        this.#vars.player = this.getName;
        this.#vars.name = this.getName;
        this.#vars.username = this.getName;
        this.#vars.tps = getTPS;
        this.#vars.online = getPlayers;
        if (newLine.includes(':')) {
            let emojisUsed = newLine.match(/:([a-z0-9_-]+):/g) || [];
            for (const emoji of emojisUsed) {
                let emojiKey = emoji.substring(1, emoji.length - 1);
                if (emojis[emojiKey]) {
                    newLine = newLine.replaceAll(emoji, emojis[emojiKey]);
                }
            }
        }
        let msg2 = msg;
        if (typeof msg2 === "string" && msg2.includes(':')) {
            let emojisUsedMsg = msg2.match(/:([a-z0-9_-]+):/g) || [];
            for (const emoji of emojisUsedMsg) {
                let emojiKey = emoji.substring(1, emoji.length - 1);
                if (emojis[emojiKey]) {
                    msg2 = msg2.replaceAll(emoji, emojis[emojiKey]);
                }
            }
        }

        if (newLine.includes("<event_rng:")) {
            const matches = [...newLine.matchAll(/<event_rng:([^>]+)>/g)];

            for (const match of matches) {
                const fullMatch = match[0];
                const key = match[1];
                const value = await events.randomNumberKeyval.get(key) ?? fullMatch;
                newLine = newLine.replace(fullMatch, value);
            }
        }

        if (newLine.includes("<keyvalue:")) {
            const matches = [...newLine.matchAll(/<keyvalue:([^>]+)>/g)];

            for (const match of matches) {
                const fullMatch = match[0];
                const key = match[1];
                const value = await keyvalues.get(key) ?? fullMatch;
                newLine = newLine.replace(fullMatch, value);
            }
        }


        this.#vars.msg = () => msg2;

        if (text.includes("{{joined_ranks}}")) {
            newLine = newLine.replaceAll("{{joined_ranks}}", rns.join(`§r${bc}] [§r`));
        }
        if (text.includes("{{vars}}")) {
            newLine = newLine.replaceAll("{{vars}}", this.getVars());
        }
        const allObjectives = world.scoreboard.getObjectives();
        for (const obj of allObjectives) {
            let score = obj.hasParticipant(player) ? abbreviateNumber(obj.getScore(player.scoreboardIdentity), 2) : 0;
            newLine = newLine.replaceAll(`{{ab_${obj.id}}}`, score);
        }
        for (const obj of allObjectives) {
            let score = obj.hasParticipant(player) ? obj.getScore(player.scoreboardIdentity) : 0;
            newLine = newLine.replaceAll(`{{${obj.id}}}`, score);
        }

        newLine = newLine.replaceAll(/{{(?!vars)(.*?)}}/g, 0);
        for (const variable in this.#vars) {
            if (text.includes(`<${variable}>`)) {
                newLine = newLine.replaceAll(`<${variable}>`, await this.#vars[variable](player));
            }
        }

        return newLine;
    }




}

export default new BlossomFormatting();