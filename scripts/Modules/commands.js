import { prismarineDb } from "../Libraries/prismarinedb";
import modules from "./modules";
import { system, world } from "@minecraft/server";

function getPrefix() {
    return modules.get('commandPrefix')
}

class Commands {
    constructor() {
        this.Database = prismarineDb.nonPersistentTable('Commands')
        system.run(async () => {
            await system.waitTicks(2)
            if (!getPrefix()) this.updatePrefix('!')
        })
    }
    updatePrefix(newp) {
        if (typeof newp != 'string') throw new Error('new prefix needs to be a string')
        if (newp.startsWith('/')) throw new Error('Cant use / prefix due to it being chomped by default Minecraft commands and never sent to chat. / commands can only be added at server startup.')
        return modules.set('commandPrefix', newp)
    }
    addSubcommand(parent, uniqueId, description, func, closeChat) {
        if (this.Database.findFirst({ uniqueId, type: 'SUBCOMMAND', parent })) throw new Error('ID is not unique')
        if (typeof func !== 'function') throw new Error('Function entry is not of type "function"')
        this.Database.insertDocument({
            parent,
            uniqueId,
            description,
            func,
            closeChat,
            type: 'SUBCOMMAND'
        })
    }
    addCommand(uniqueId, description, category, func, closeChat = false, permission = null, aliases = null) {
        if (this.Database.findFirst({ uniqueId })) throw new Error('ID is not unique!')
        if (typeof func !== "function") throw new Error('That is NOT a function')
        this.Database.insertDocument({
            uniqueId,
            description,
            category,
            func,
            closeChat,
            permission,
            aliases,
            type: 'COMMAND'
        })
        return true;
    }
    removeCommand(uniqueId) {
        let id = this.Database.findFirst({
            uniqueId
        })
        if (!id) throw new Error('Could not find command. Maybe you spelled it wrong')
        this.Database.deleteDocumentByID(id)
    }
    runCommand(msg) {
        system.run(() => {
            if (!msg.message.startsWith(getPrefix())) return;
            let parsed = this.parseArgs(msg.message)
            if (!parsed) throw new Error('Broken parseArgs.. guh.')
            let commandName = parsed[0].replace(getPrefix(), '')
            let args = parsed.slice(1)
            let command = this.Database.findFirst({ uniqueId: commandName })
            if (!command) {
                for (const cmd of this.Database.findDocuments()) {
                    if (cmd.data.aliases) {
                        let alias = cmd.data.aliases.find(_ => _ == commandName)
                        if (!alias) continue;
                        command = cmd
                    } else continue;
                }
                if (!command) return msg.sender.error('No command found with the name: ' + commandName + '. Try using ' + getPrefix() + 'help for a list of commands')
            }
            if(msg.sender.hasTag('combat') && modules.get('CLogCommandsDisabled')) return msg.sender.error('Commands cannot be ran while in combat')
            if(command.data.type === 'SUBCOMMAND') return;
            if (command.data.permission) {
                if (!prismarineDb.permissions.hasPermission(msg.sender, command.data.permission)) return msg.sender.error('You do not have the required permissions to run this command.')
            }
            let sc = this.Database.findFirst({ uniqueId: args[0], type: 'SUBCOMMAND', parent: commandName })

            if (sc) {
                console.log('found sc')
                if (sc.data.closeChat) {
                    msg.sender.info('Close chat and move to run command!')
                    const player = msg.sender
                    let ticks = 0;
                    let initialLocation = { x: player.location.x, y: player.location.y, z: player.location.z };

                    let interval = system.runInterval(() => {
                        ticks++;

                        if (ticks >= (20 * 10)) {
                            system.clearRun(interval);
                            player.error("Timed out. You didn't move!");
                        }

                        if (player.location.x !== initialLocation.x ||
                            player.location.y !== initialLocation.y ||
                            player.location.z !== initialLocation.z) {

                            system.clearRun(interval);
                            sc.data.func({ msg, args: args.slice(1) })
                        }
                    }, 1);
                } else {
                    sc.data.func({ msg, args: args.slice(1) })
                }
                return;
            }
            if (command.data.closeChat) {
                msg.sender.info('Close chat and move to run command!')
                const player = msg.sender
                let ticks = 0;
                let initialLocation = { x: player.location.x, y: player.location.y, z: player.location.z };

                let interval = system.runInterval(() => {
                    ticks++;

                    if (ticks >= (20 * 10)) {
                        system.clearRun(interval);
                        player.error("Timed out. You didn't move!");
                    }

                    if (player.location.x !== initialLocation.x ||
                        player.location.y !== initialLocation.y ||
                        player.location.z !== initialLocation.z) {

                        system.clearRun(interval);
                        command.data.func({ msg, args })
                    }
                }, 1);
            } else {
                command.data.func({ msg, args })
            }
        })
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

var commands = new Commands();

export { commands, getPrefix }