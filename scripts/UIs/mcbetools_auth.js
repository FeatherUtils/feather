import { system, world } from "@minecraft/server";
import { ModalForm } from "../Libraries/form_func";
import { http, HttpRequest, HttpMethod, HttpHeader } from "../Networking/index";
import uiManager from "../Libraries/uiManager";
import config from "../config";
system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id == "mcbetools:logout") {
        e.sourceEntity.setDynamicProperty("MCBEToolsToken", "");
    }
});
uiManager.addUI(
    config.uinames.MCBEToolsAuth,
    "Asd",
    (player, tokenCallback, step = 0, email, password) => {
        system.run(() => {
            if (step == 0) {
                if (player.getDynamicProperty("MCBEToolsToken"))
                    return tokenCallback(
                        player.getDynamicProperty("MCBEToolsToken")
                    );
                let form = new ModalForm();
                form.title("Log into MCBETools");
                form.textField(
                    "Create an account at https://mcbetools.com\n\nEmail",
                    "Email"
                );
                form.textField("Password", "Password");
                form.show(player, false, (player, response) => {
                    if (response.canceled) return;
                    let req = new HttpRequest(`${config.config.mcbetools}/auth/login`)
                    req.setBody(JSON.stringify({
                        email: response.formValues[0],
                        password: response.formValues[1]
                    }))
                    req.setMethod('Post')
                    req.addHeader('User-Agent', 'application/json')
                    console.log(JSON.stringify(req))
                    http.makeRequest(
                        req,
                        (status, res) => {
                            // world.sendMessage(status)
                            console.log(res)
                            let data = JSON.parse(res);
                            if (!data.error) {
                                player.setDynamicProperty(
                                    "MCBEToolsToken",
                                    data.token
                                );
                                tokenCallback(data.token);
                                return;
                            }
                            if (data.errorCode == 5) {
                                uiManager.open(
                                    player,
                                    config.uinames.MCBEToolsAuth,
                                    tokenCallback,
                                    1,
                                    response.formValues[0],
                                    response.formValues[1]
                                );
                            } else if (data.error) {
                                player.error(data.message);
                                uiManager.open(
                                    player,
                                    config.uinames.MCBEToolsAuth,
                                    tokenCallback,
                                    step,
                                    email,
                                    password
                                );
                            }
                            // world.sendMessage(res)
                        }
                    );
                });
            }
            if (step == 1) {
                let form = new ModalForm();
                form.title("§r2FA");
                form.textField("2FA Code", "123456");
                form.show(player, false, (player, response) => {
                    if (response.canceled) return;
                    const req = new HttpRequest(`${config.config.mcbetools}/auth/login`)
                    req.setBodyJson({
                        email: email,
                        password: password,
                        totptoken: response.formValues[0],
                    })
                    req.addHeaderClass(new HttpHeader('User-Agent', 'application/json'))
                    req.setMethod("Post")
                    http.makeRequest(
                        req,
                        (status, res) => {
                            // world.sendMessage(status)
                            let data = JSON.parse(res);
                            if (!data.error) {
                                player.setDynamicProperty(
                                    "MCBEToolsToken",
                                    data.token
                                );
                                tokenCallback(data.token);
                                return;
                            }
                            if (data.errorCode == 5) {
                                uiManager.open(
                                    player,
                                    config.uinames.MCBEToolsAuth,
                                    tokenCallback,
                                    1,
                                    response.formValues[0],
                                    response.formValues[1]
                                );
                            } else if (data.error) {
                                player.error(data.message);
                                uiManager.open(
                                    player,
                                    config.uinames.MCBEToolsAuth,
                                    tokenCallback,
                                    step,
                                    email,
                                    password
                                );
                            }
                            // world.sendMessage(res)
                        }
                    );
                });
            }
        });
    }
);