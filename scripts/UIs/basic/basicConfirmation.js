import actionParser from "../../Modules/actionParser";
import config from "../../config";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import icons from "../../Modules/icons";

uiManager.addUI(config.uinames.basic.confirmation, "Basic Confirmation UI", (player, actionLabel, actionYes, actionNo)=>{
    let form = new ActionForm();
    form.title("§f§0§0§fConfirmation");
    form.body(actionLabel);
    form.button("§aYes", icons.resolve(`azalea/4-a`), player=>{
        if(typeof actionYes === "function") {
            actionYes(player);
        } else if(typeof actionYes === "string") {
            actionParser.runAction(player, actionYes)
        }
    })
    form.button("§cNo", icons.resolve(`azalea/Delete`), player=>{
        if(typeof actionNo === "function") {
            actionNo(player);
        } else if(typeof actionNo === "string") {
            actionParser.runAction(player, actionNo)
        }
    })
    form.show(player, false, (player, response)=>{})
})