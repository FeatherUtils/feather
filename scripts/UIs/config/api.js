class configAPI {
    constructor() {
        this.buttons = [];
    }
    add(obj) {
        this.buttons.push(obj)
    }
    get() {
        return this.buttons
    }
}

export default new configAPI;