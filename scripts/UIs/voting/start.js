import { ModalFormData } from "@minecraft/server-ui";
import voting from "../../Modules/voting";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";

uiManager.addUI(config.uinames.voting.start, 'start vote', (player) => {
    let form = new ModalFormData();
    form.title('§c§h§e§r§r§y§r§fStart Referendum')
    form.textField(`Title`, `Main title people will see before clicking`, null)
    form.textField(`Body`, `Main thing people will see on click`, null)
    form.show(player).then((res) => {
        let[title,body] = res.formValues;
        if(!title || !body) return player.error('Missing values')
        voting.start(title,body)
    })
})