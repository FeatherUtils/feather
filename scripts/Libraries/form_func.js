import { Player, world } from "@minecraft/server";
import {
    ActionFormData,
    ActionFormResponse,
    FormCancelationReason,
    MessageFormData,
    MessageFormResponse,
    ModalFormData,
    ModalFormResponse,
} from "@minecraft/server-ui";
import debug_buttons from "./debug_buttons";
import { colors } from "./prismarinedb";
import { NUT_UI_ALT, NUT_UI_DISBALE_BTN, NUT_UI_HEADER_BUTTON, NUT_UI_TAG, NUT_UI_THEMED, NUT_UI_PAPERDOLL } from "../cherryUIConsts";
import { themes } from '../cherryThemes'
import icons from "../Modules/icons";
function adjustTextLength(text = "", totalLength = 100) {
    return text.slice(0, totalLength).padEnd(totalLength, "\t");
}
export const content = {
    warn(...messages) {
        // // console.warn(messages.map(message => JSON.stringify(message, (key, value) => (value instanceof Function) ? '<f>' : value)).join(' '));
    },
    chatFormat(...messages) {
        world.sendMessage(
            messages
                .map((message) =>
                    JSON.stringify(
                        message,
                        (key, value) =>
                            value instanceof Function
                                ? value.toString().replaceAll("\r\n", "\n")
                                : value,
                        4
                    )
                )
                .join(" ") // im so cool - fruitkitty
        );
    },
}; // what were u gonna do in customizer
// fix it
// ok
// dont touch this file btw its very important
function isNumberDefined(input) {
    return (
        input !== false &&
        input !== null &&
        input !== undefined &&
        input !== NaN &&
        input !== Infinity
    );
}
export class MessageForm {
    constructor() {
        this.form = new MessageFormData();
        this.callbacks = [null, null];
    }
    /**
     * @method title
     * @param {String} titleText
     * @returns {MessageForm}
     */
    title(titleText) {
        if (typeof titleText !== "string")
            throw new Error(
                `titleText: ${titleText}, at params[0] is not a String!`
            );
        this.form.title(titleText);
        return this;
    }
    /**
     * @method body
     * @param {String} bodyText
     * @returns {MessageForm}
     */
    body(bodyText) {
        if (typeof bodyText !== "string")
            throw new Error(
                `bodyText: ${titleText}, at params[0] is not a String!`
            );
        this.form.body(bodyText);
        return this;
    }
    /**
     * @method button1
     * @param {String} text
     * @param {(player: Player, i: Number) => {}} callback
     * @returns {MessageForm}
     */
    button1(text, callback) {
        if (typeof text !== "string")
            throw new Error(`text: ${label}, at params[0] is not a String!`);
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[1] is defined and is not a Function!`
            );
        this.callbacks[1] = callback;
        this.form.button1(text);
        return this;
    }
    /**
     * @method button2
     * @param {String} text
     * @param {(player: Player, i: Number) => {}} callback
     * @returns {MessageForm}
     */
    button2(text, callback) {
        if (typeof text !== "string")
            throw new Error(`text: ${label}, at params[0] is not a String!`);
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[1] is defined and is not a Function!`
            );
        this.callbacks[0] = callback;
        this.form.button2(text);
        return this;
    }
    /**
     * @method show
     * @param {Player} player
     * @param {Boolean} awaitNotBusy
     * @param {(player: Player, response: MessageFormResponse) => {}} callback?
     * @returns {Promise<MessageFormResponse>}
     */
    async show(player, awaitNotBusy = false, callback) {
        try {
            if (!(player instanceof Player)) player = player?.player;
            if (!(player instanceof Player))
                throw new Error(`player at params[0] is not a Player!`);
            if (awaitNotBusy && typeof awaitNotBusy !== "boolean")
                throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
            if (callback && !(callback instanceof Function))
                throw new Error(`callback at params[2] is not a Function!`);
            let response;
            while (true) {
                response = await this.form.show(player);
                const { cancelationReason } = response;
                if (!awaitNotBusy || cancelationReason !== "userBusy") break;
            }
            const { selection } = response;
            const callbackIndex = this.callbacks[selection];
            if (callbackIndex instanceof Function)
                callbackIndex(player, selection);
            if (callback instanceof Function) callback(player, response);
            return response;
        } catch (error) {
            console.log(error, error.stack);
        }
    }
}
export class ActionForm {
    constructor() {
        this.form = new ActionFormData();
        this.callbacks = [];
        this.titleText = "";
        this.cherry = false;
        this.chtheme = 0;
    }
    header(text) {
        try {
            this.form.header(text);
        } catch { }
    }
    label(text) {
        // return;
        try {
            this.form.label(text);
        } catch { }
    }
    divider() {
        // return;
        try {
            this.form.divider();
        } catch (e) {
            // world.sendMessage(`${e}`)
        }
    }
    padCherry(title, header, border, hButton, deButton, diButton, hoButton, paperdoll) {
        // world.sendMessage(`Title: ${title}`)
        // world.sendMessage(`Header: ${header}`)
        // world.sendMessage(`Border: ${border}`)
        // world.sendMessage(`Header Button: ${hButton}`)
        // world.sendMessage(`Default Button: ${deButton}`)
        // world.sendMessage(`Disabled Button: ${diButton}`)
        // world.sendMessage(`Hovered Button: ${hoButton}`)
        // world.sendMessage(`Paperdoll Button: ${paperdoll}`)
        for (const t of themes) {
            if (title.includes(t[0])) title = title.replaceAll(t[0], '')
        }
        title = title.replaceAll(NUT_UI_THEMED, '')
        let res = NUT_UI_TAG + adjustTextLength(title, 100) + adjustTextLength(header, 50) + adjustTextLength(border, 50) + adjustTextLength(hButton, 50) + adjustTextLength(deButton, 50) + adjustTextLength(diButton, 50) + adjustTextLength(hoButton, 50) + adjustTextLength(paperdoll, 50)
        // world.sendMessage(res.replaceAll('§', '&'))
        // world.sendMessage(`${res.length}`)
        return res;
    }
    /**
     * @method title
     * @param {String} titleText
     * @returns {ActionForm}
     */
    title(titleText) {
        if (typeof titleText !== "string")
            throw new Error(
                `titleText: ${titleText}, at params[0] is not a String!`
            );
        this.titleText = `§r${titleText}`;
        if (titleText.includes(NUT_UI_TAG)) {
            this.cherry = true;
            let header = 'textures/example/header';
            let paperdoll = 'textures/example/paperdoll'
            let border = 'textures/example/border'
            let hButton = 'textures/example/button';
            let deButton = 'textures/example/button';
            let diButton = 'textures/example/button_disabled';
            let hoButton = 'textures/example/button_hover';

            if (titleText.includes(NUT_UI_THEMED)) {
                for (const theme of themes) {
                    if (titleText.includes(theme[0])) {
                        header = theme[2]
                        // TAG, NAME, TEXTURE, AUTHOR, BORDER, HEADER BUTTON, DEFAULT BUTTON, DISABLED BUTTON, HOVER BUTTON, PAPERDOLL, OUTLINE
                        if (theme.length > 4 && theme[4]) border = theme[4]
                        if (theme.length > 5 && theme[5]) hButton = theme[5]
                        if (theme.length > 6 && theme[6]) deButton = theme[6]
                        if (theme.length > 7 && theme[7]) diButton = theme[7]
                        if (theme.length > 8 && theme[8]) hoButton = theme[8]
                        if (theme.length > 9 && theme[9]) paperdoll = theme[9]
                        this.chtheme = Math.max(themes.findIndex(_ => _[0] == theme[0]), 0);
                    }
                }
            }
            this.deButton = deButton;
            this.form.title(this.padCherry(titleText.replaceAll(NUT_UI_TAG, ''), header, border, hButton, deButton, diButton, hoButton, paperdoll));
        } else {
            this.form.title(titleText);
        }
        return this;
    }
    /**
     * @method body
     * @param {String} bodyText
     * @returns {ActionForm}
     */
    body(bodyText) {
        if (typeof bodyText !== "string")
            throw new Error(
                `bodyText: ${titleText}, at params[0] is not a String!`
            );
        this.form.body(bodyText);
        return this;
    }
    setCustomFormID(id) {
        this.customFormID = id;
    }
    btnCherry(text, bg) {
        // world.sendMessage(`${text.length}`)
        bg = this.deButton;
        if (!this.cherry) return text;
        if (text.includes(NUT_UI_HEADER_BUTTON)) return text;
        let outline = 'textures/example/button_outline'
        if (themes[this.chtheme ? this.chtheme : 0] && themes[this.chtheme ? this.chtheme : 0].length > 10 && themes[this.chtheme ? this.chtheme : 0][10]) outline = themes[this.chtheme ? this.chtheme : 0][10];
        // world.sendMessage(outline)
        if (text.includes("§o§1")) bg = outline
        // console.warn(JSON.stringify(themes[this.chtheme ? this.chtheme : 0]))
        if (text.includes(NUT_UI_ALT)) {
            for (const theme of themes) {
                if (text.includes(theme[0])) {
                    bg = theme[2];
                    // world.sendMessage(bg)
                }

            }
        }
        if (text.includes("§c§h§e§1")) bg = 'textures/example/buttoncherry'
        if (text.includes("§l§e§f§1")) bg = 'textures/example/buttonleaf'
        if (!bg) bg = `textures/example/button`;
        let res = adjustTextLength(text, 300) + adjustTextLength(bg, 150)
        // world.sendMessage(res)
        // world.sendMessage(`${res.length}`)
        return res;
    }
    /**
     * @method body
     * @param {String} text
     * @param {String} iconPath
     * @param {(player: Player, i: Number) => {}} callback
     * @returns {ActionForm}
     */
    button(text, iconPath, callback) {
        // return;
        if (typeof text !== "string")
            throw new Error(`text: ${label}, at params[0] is not a String!`);
        if (iconPath && typeof iconPath !== "string")
            throw new Error(
                `iconPath: ${defaultValue}, at params[1] is defined and is not a String!`
            );
        if (iconPath && typeof iconPath === 'string' && iconPath.startsWith('.')) iconPath = icons.resolve(iconPath.substring(1))
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[2] is defined and is not a Function!`
            );
        this.callbacks.push(callback);
        let lightText = text;
        lightText = !lightText.includes(NUT_UI_ALT) && !lightText.includes(NUT_UI_DISBALE_BTN) ? `§0${lightText.replace(/§[0-9a-juqnvmt]/gi, (a) => {
            let code = colors.getVariants(a)
            if (code) {
                return code.darker;
            }
            return a;
        })}`.replaceAll('§r', '§r§0') : lightText;
        this.form.button(this.btnCherry(text, 'textures/example/button'), iconPath);
        return this;
    }
    /**
     * @method show
     * @param {Player} player
     * @param {Boolean} awaitNotBusy
     * @param {(player: Player, response: ActionFormResponse) => {}} callback?
     * @returns {Promise<ActionFormResponse>}
     */
    async show(player, awaitNotBusy = false, callback) {
        awaitNotBusy = true;
        if (
            player.hasTag("leaf:debug-modeOwOUwUKawaii :3 Nya~~~") &&
            !this.injectedButtons
        ) {
            this.injectedButtons = true;
            for (const button of debug_buttons) {
                if (
                    button.requiredTitleTag &&
                    !this.titleText.includes(button.requiredTitleTag)
                )
                    continue;
                this.button(button.text, button.icon, (player) => {
                    button.callback(player, this);
                });
            }
        }
        if (player.hasTag("light-mode"))
            this.title(
                `§l§i§g§h§t§r§8${this.titleText.replace(/§r/g, "§r§8")}`
            );
        try {
            if (!(player instanceof Player)) player = player?.player;
            if (!(player instanceof Player))
                throw new Error(`player at params[0] is not a Player!`);
            if (awaitNotBusy && typeof awaitNotBusy !== "boolean")
                throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
            if (callback && !(callback instanceof Function))
                throw new Error(`callback at params[2] is not a Function!`);
            let response;
            while (true) {
                response = await this.form.show(player);
                const { cancelationReason } = response;
                if (!awaitNotBusy || cancelationReason !== "userBusy") break;
            }
            const { selection } = response;
            const callbackIndex = this.callbacks[selection];
            if (callbackIndex instanceof Function)
                callbackIndex(player, selection);
            if (callback instanceof Function) callback(player, response);
            return response;
        } catch (error) {
            console.log(error, error.stack);
        }
    }
}

export class ModalForm {
    constructor() {
        this.form = new ModalFormData();
        this.callbacks = [];
        this.titleText = "";
    }
    /**
     * @method title
     * @param {String} titleText
     * @returns {ModalForm}
     */
    header(text) {
        try {
            this.form.header(text);
        } catch { }
    }
    label(text) {
        try {
            this.form.label(text);
        } catch { }
    }
    divider() {
        try {
            this.form.divider();
        } catch { }
    }
    // use({display, handler}) {
    //     display(this);
    //     this.handler = 
    // }
    submitButton(text) {
        this.form.submitButton(text);
    }
    title(titleText) {
        if (typeof titleText !== "string")
            throw new Error(
                `titleText: ${titleText}, at params[0] is not a String!`
            );
        this.titleText = titleText;
        this.form.title(titleText);
        return this;
    }
    /**
     * @method toggle
     * @param {String} label
     * @param {Boolean} defaultValue?
     * @param {(player: Player, state: Boolean, i: number) => {}} callback?
     */
    toggle(label, defaultValue, callback, tooltip) {
        if (typeof label !== "string")
            throw new Error(`label: ${label}, at params[0] is not a String!`);
        if (defaultValue && typeof defaultValue !== "boolean")
            throw new Error(
                `defaultValue: ${defaultValue}, at params[1] is defined and is not a String!`
            );
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[2] is defined and is not a Function!`
            );
        this.callbacks.push(callback);
        this.form.toggle(label, { defaultValue, tooltip });
        return this;
    }
    /**
     * @typedef {Array<optionObject>} dropdownOptions
     */

    /**
     * @typedef {object} optionObject
     * @property {string} option
     * @property {(player: Player) => { }} callback
     */

    /**
     * @method dropdown
     * @param {String} label
     * @param {dropdownOptions} options
     * @param {Number} defaultValueIndex?
     * @param {(player: Player, selection: Number, i: number) => {}} callback?
     */
    dropdown(label, options, defaultValueIndex = 0, callback, tooltip = null) {
        if (typeof label !== "string")
            throw new Error(`label: ${label}, at params[0] is not a String!`);
        if (!(options instanceof Array))
            throw new Error(`params[1] is not an Array!`);
        options.forEach((object, i) => {
            if (!(object instanceof Object) && !(typeof object == "string"))
                throw new Error(`index: ${i}, in params[1] is not an Object!`);
        });
        const optionStrings = options.map((opt, i) => {
            if (opt instanceof Object) {
                let { option } = opt;
                if (typeof option !== "string")
                    throw new Error(
                        `property option: ${option}, at index: ${i}, in params[1] is not a String!`
                    );
                return option;
            } else if (typeof opt == "string") {
                return opt;
            }
        });
        const optionCallbacks = options.map((opt) => {
            if (!(opt instanceof Object)) return;
            let { callback } = opt;
            if (callback && !(callback instanceof Function))
                throw new Error(
                    `property callback at index: ${i}, in params[1] is not a Function!`
                );
            else if (callback) return callback;
        });
        if (
            !isNumberDefined(defaultValueIndex) &&
            !Number.isInteger(defaultValueIndex)
        )
            throw new Error(
                `defaultValueIndex: ${defaultValueIndex}, at params[2] is defined and is not an Integer!`
            );
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[3] is defined and is not a Function!`
            );
        this.callbacks.push([optionCallbacks, callback]);
        this.form.dropdown(label, optionStrings, {
            tooltip,
            defaultValueIndex,
        });
        return this;
    }
    /**
     * @method slider
     * @param {String} label
     * @param {Number} minimumValue
     * @param {Number} maximumValue
     * @param {Number} valueStep
     * @param {Number} defaultValue?
     * @param {(player: Player, selection: Number, i: number) => {}} callback?
     */
    slider(
        label,
        minimumValue,
        maximumValue,
        valueStep,
        defaultValue = null,
        callback,
        tooltip = null
    ) {
        if (typeof label !== "string")
            throw new Error(`label: ${label}, at params[0] is not a String!`);
        if (typeof minimumValue !== "number")
            throw new Error(
                `minimumValue: ${minimumValue}, at params[1] is not a Number!`
            );
        if (typeof maximumValue !== "number")
            throw new Error(
                `maximumValue: ${maximumValue}, at params[2] is not a Number!`
            );
        if (typeof valueStep !== "number")
            throw new Error(
                `valueStep: ${valueStep}, at params[3] is not a Number!`
            );
        if (!isNumberDefined(defaultValue) && typeof defaultValue !== "number")
            throw new Error(
                `defaultValue: ${defaultValue}, at params[4] is defined and is not a Number!`
            );
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[5] is defined and is not a Function!`
            );
        this.callbacks.push(callback);
        this.form.slider(label, minimumValue, maximumValue, {
            valueStep,
            defaultValue,
        });
        return this;
    }
    /**
     * @method textField
     * @param {String} label
     * @param {String} placeholderText
     * @param {String} defaultValue
     * @param {(player: Player, outputText: String, i: number) => {}} callback?
     * @returns {ModalForm}
     */
    textField(
        label,
        placeholderText,
        defaultValue = null,
        callback,
        tooltip = undefined
    ) {
        if (typeof label !== "string")
            throw new Error(`label: ${label}, at params[0] is not a String!`);
        if (typeof placeholderText !== "string")
            throw new Error(
                `placeholderText: ${placeholderText}, at params[1] is not a String!`
            );
        if (defaultValue && typeof defaultValue !== "string")
            throw new Error(
                `defaultValue: ${defaultValue}, at params[2] is defined and is not a String!`
            );
        if (callback && !(callback instanceof Function))
            throw new Error(
                `callback at params[3] is defined and is not a Function!`
            );
        this.callbacks.push(callback);
        this.form.textField(label, placeholderText, {
            defaultValue,
            tooltip,
        });
        return this;
    }

    /**
     * @method show
     * @param {Player} player
     * @param {Boolean} awaitNotBusy?
     * @param {(player: Player, response: ModalFormResponse) => {}} callback?
     * @returns {Promise<ModalFormResponse>}
     */
    async show(player, awaitNotBusy = false, callback) {
        if (player.hasTag("light-mode"))
            this.title(
                `§l§i§g§h§t§r§8${this.titleText.replace(/§r/g, "§r§8")}`
            );
        try {
            if (!(player instanceof Player)) player = player?.player;
            if (!(player instanceof Player))
                throw new Error(`player at params[0] is not a Player!`);
            if (awaitNotBusy && typeof awaitNotBusy !== "boolean")
                throw new Error(`awaitNotBusy at params[1] is not a Boolean!`);
            if (callback && !(callback instanceof Function))
                throw new Error(`callback at params[2] is not a Function!`);
            let response;
            while (true) {
                response = await this.form.show(player);
                const { cancelationReason } = response;
                if (
                    !awaitNotBusy ||
                    cancelationReason !== FormCancelationReason.UserBusy
                )
                    break;
            }
            const { formValues, cancelationReason } = response;
            if (
                cancelationReason !== FormCancelationReason.UserClosed &&
                cancelationReason !== FormCancelationReason.UserBusy
            )
                response.formValues.forEach((value, i) => {
                    if (this.callbacks[i] instanceof Array) {
                        const callback = this.callbacks[i][0];
                        const callbackAll = this.callbacks[i][1];
                        if (callback instanceof Function) callback(player, i);
                        if (callbackAll instanceof Function)
                            callbackAll(player, value, i);
                    } else {
                        const callback = this.callbacks[i];
                        if (callback instanceof Function)
                            callback(player, value, i);
                    }
                });
            if (callback instanceof Function) callback(player, response);
            return response;
        } catch (error) {
            // console.warn(error, error.stack);
        }
    }
}