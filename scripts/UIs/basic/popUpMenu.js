import actionParser from "../../Modules/actionParser";
import config from "../../config";
import { ActionForm } from "../../Libraries/form_func";
import uiManager from "../../Libraries/uiManager";
import icons from "../../Modules/icons";

uiManager.addUI(config.uinames.basic.popupMenu, "Popup Menu UI", (player, text, action)=>{
    let form = new ActionForm();
    form.title("§f§0§0§fConfirmation");
    form.body(text);
    form.button("§bOK", icons.resolve(`azalea/ClickyClick`), player=>{
        if(typeof action === "function") {
            action(player);
        } else if(typeof action === "string") {
            actionParser.runAction(player, action)
        } else if(typeof action === "object") {
            if(!action.isArray()) return;
            for (const a of action) {
                actionParser.runAction(player, a)
            }
        }
    })
    form.show(player, false, (player, response)=>{})
})