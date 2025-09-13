import { system } from '@minecraft/server';

class Communication {
    constructor() {
        this.registeredCommunications = new Map();

        system.afterEvents.scriptEventReceive.subscribe((event) => {
            const { id, message, sourceEntity } = event;
            const cb = this.registeredCommunications.get(id);
            if (!cb) return;

            try {
                cb({
                    args: this.parseArgs(message || ""),
                    player: sourceEntity?.typeId === "minecraft:player" ? sourceEntity : null,
                    rawMessage: message
                });
            } catch (err) {
                console.error(`Error in communication callback for "${id}":`, err);
            }
        });
    }

    register(id, callback) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }
        this.registeredCommunications.set(id, callback);
    }

    unregister(id) {
        this.registeredCommunications.delete(id);
    }

    parseArgs(str) {
        const args = [];
        let i = 0;

        while (i < str.length) {
            if (str[i] === '"') {
                // quoted string
                let end = ++i;
                let value = "";
                while (end < str.length) {
                    if (str[end] === '"' && str[end - 1] !== "\\") break;
                    value += str[end++];
                }
                args.push(value);
                i = end + 1;
            }
            else if (str[i] === '{' || str[i] === '[') {
                // JSON object or array
                let startChar = str[i];
                let endChar = startChar === '{' ? '}' : ']';
                let depth = 0;
                let value = "";

                while (i < str.length) {
                    if (str[i] === startChar) depth++;
                    if (str[i] === endChar) depth--;
                    value += str[i];
                    i++;
                    if (depth === 0) break;
                }
                args.push(value);
            }
            else if (/\s/.test(str[i])) {
                i++; // skip spaces
            }
            else {
                // normal word
                let value = "";
                while (i < str.length && !/\s/.test(str[i])) {
                    value += str[i++];
                }
                args.push(value);
            }
        }

        return args;
    }
}

export default new Communication();
