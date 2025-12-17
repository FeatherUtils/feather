import { system } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";

class Onboarding {
    constructor() {
        system.run(async () => {
            this.values = new Map()
            this.executed = await prismarineDb.keyval('executedOnboardingOptions')
        })
    }
    async add(name, func) {
        if (typeof func !== 'function') return false;
        this.values.set(name, { execute: func })
        if (!await this.executed.has(name)) await this.executed.set(name, false)
        return true;
    }
    async execute(name, player) {
        let option = await this.values.get(name)
        if (!option) throw new Error('Could not find the option you are trying to execute');
        if (typeof option.execute !== 'function') throw new Error('The value in option.execute is not a function :/')
        await option.execute(player)
        await this.executed.set(name, true)
        return true;
    }
    async getAll(completed = false) {
        const results = [];
        for (const [name, option] of this.values.entries()) {
            const done = await this.executed.get(name);
            if (!completed || (completed && done)) {
                results.push({ name, completed: done });
            }
        }
        return results;
    }
}

export default new Onboarding;