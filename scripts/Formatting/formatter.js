import { world } from "@minecraft/server";
import emojis from './emojis'
import ranks from "../Modules/ranks";
import { getTPS } from "./format/tps";
import { getPlayers } from "./format/online";

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
        return player.name
    }
    format(text, player, msg = undefined) {
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
    
        for (const r of rs) {
            rns.push(r.name);
        }
        if (rns.length === 0) {
            rns.push(`§bMember`);
        }
        for (const r of rs) {
            nc = r.nc;
            cc = r.cc;
            bc = r.bc;
            break;
        }
        this.#vars.nc = () => nc;
        this.#vars.cc = () => cc;
        this.#vars.bc = () => bc;

        this.#vars.arrow = () => '»'
    
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
    
        this.#vars.msg = () => msg2;
    
        if (text.includes("{{joined_ranks}}")) {
            newLine = newLine.replaceAll("{{joined_ranks}}", rns.join(`§r${bc}] [§r`));
        }
        if (text.includes("{{vars}}")) {
            newLine = newLine.replaceAll("{{vars}}", this.getVars());
        }
        const allObjectives = world.scoreboard.getObjectives();
        for (const obj of allObjectives) {
            let score = obj.hasParticipant(player) ? obj.getScore(player.scoreboardIdentity) : 0;
            newLine = newLine.replaceAll(`{{${obj.id}}}`, score);
        }
    
        newLine = newLine.replaceAll(/{{(?!vars)(.*?)}}/g, 0);
        for (const variable in this.#vars) {
            if (text.includes(`<${variable}>`)) {
                newLine = newLine.replaceAll(`<${variable}>`, this.#vars[variable](player));
            }
        }
    
        return newLine;
    }
    



}

export default new BlossomFormatting();