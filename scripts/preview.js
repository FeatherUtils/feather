import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui'

let form;

system.run(() => {
    form = new ActionFormData()
})

async function isPreview() {
    await system.waitTicks(1)
    return form.header ? true : false;
}
function returnFalse() {
    return false;
}

export default isPreview()