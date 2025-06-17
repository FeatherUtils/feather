import homes from "../../Modules/homes";
import { ActionForm } from "../../Libraries/form_func";
import { ModalFormData } from "@minecraft/server-ui";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";
import { consts } from "../../cherryUIConsts";
import playerStorage from "../../Libraries/playerStorage";

uiManager.addUI(config.uinames.homes.create, 'create homes', (player) => {
    let form = new ModalFormData();
    form.title(`Create home`)
    form.textField(`Name`, `Example: Base`)
    form.show(player).then((res) => {
        let[name] = res.formValues;
        homes.create(player,name)
        uiManager.open(player,config.uinames.homes.root,false)
    })
})