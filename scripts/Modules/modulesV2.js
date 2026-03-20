import { world, system } from '@minecraft/server';
import { prismarineDb } from '../Libraries/prismarinedb';
import { SegmentedStoragePrismarine } from '../Libraries/Storage/segmented';

class ModulesV2 {
    constructor() {
        this.Registered = {};
        this.Types = {
            Boolean: 'bool',
            String: 'str',
            Integer: 'int',
            Object: 'obj',
        };
        this.Keyval = null;

        system.run(async () => {
            this.Database = prismarineDb.customStorage(
                'ModulesV2',
                SegmentedStoragePrismarine,
            );
            this.Keyval = await this.Database.keyval('Modules');

            for (const key in this.Registered) {
                const memProp = this.Registered[key];
                const dbProp = this.Keyval.get(key);

                if (dbProp !== undefined && dbProp !== null) {
                    this.Registered[key].value = dbProp.value;
                } else {
                    this.Keyval.set(key, { type: memProp.type, value: memProp.value });
                }
            }
        });
    }

    register(key, type, defaultValue) {
        this.Registered[key] = {
            type,
            value: defaultValue,
        };

        if (this.Keyval) {
            let dbProp = this.Keyval.get(key);
            if (dbProp !== undefined && dbProp !== null) {
                this.Registered[key].value = dbProp.value;
            } else {
                this.Keyval.set(key, { type, value: defaultValue });
            }
        }
    }

    get(key) {
        let prop = this.Registered[key];
        if (!prop) throw new Error(`Tried to get unregistered key: ${key}`);
        return prop.value;
    }

    set(key, value) {
        let prop = this.Registered[key];

        if (!prop) throw new Error('Tried to set unregistered key');

        if (typeof value === 'boolean' && prop.type !== 'bool')
            throw new Error('Module type is not boolean!');
        if (typeof value === 'string' && prop.type !== 'str')
            throw new Error('Module type is not string!');
        if (typeof value === 'number' && prop.type !== 'int')
            throw new Error('Module type is not integer!');
        if (typeof value === 'object' && prop.type !== 'obj')
            throw new Error('Module type is not object!');

        this.Registered[key].value = value;

        if (this.Keyval) {
            this.Keyval.set(key, { type: prop.type, value });
        }
    }
}

export default new ModulesV2();