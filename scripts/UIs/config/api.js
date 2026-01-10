class configAPI {
    constructor() {
        this.buttons = [];
        this.lifestealInstalled = false;
        this.lifestealVersion = 'v0.1'
    }
    add(obj) {
        this.buttons.push(obj)
    }
    get() {
        return this.buttons
    }
    lifestealInstalled(version) {
        console.log('Lifesteal is installed')
        this.lifestealInstalled = true;
        this.lifestealVersion = version
        this.buttons.push({text:'Lifesteal',subtext:'Open the Feather Lifesteal configuration',actions:['scriptevent featherlifesteal:config']})
    }
}

export default new configAPI;