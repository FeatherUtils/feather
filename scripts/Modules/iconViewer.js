import { ModalForm, ActionForm } from "../Libraries/form_func";
import { prismarineDb } from "../Libraries/prismarinedb";
import uiManager from "../Libraries/uiManager";
import config from "../config";
import icons from "./icons";
import * as _ from "./underscore";
import { consts } from "../cherryUIConsts";

uiManager.addUI(
    config.uinames.basic.iconViewer,
    "Icon Viewer",
    async (
        player,
        page = 0,
        callbackFn,
        favoritedOnly = false,
        iconIDSearch = false,
        iconIDSearchError = false,
        defaultIconID = null
    ) => {
        try {
            let enttable = prismarineDb.entityTable("icons", player);
            let pdbTable = await enttable.keyval("main");
            let recentlyUsed = pdbTable.has("RecentlyUsed")
                ? pdbTable.get("RecentlyUsed")
                : [];

            if (iconIDSearch) {
                let modalForm = new ModalForm();
                modalForm.textField(
                    "Icon ID",
                    "Example: leaf/image-001",
                    defaultIconID
                );
                modalForm.title(
                    `${consts.tag}${iconIDSearchError ? "§cIcon not found" : "Input Icon ID"
                    }`
                );
                modalForm.show(player, false, function (player, response) {
                    if (response.canceled)
                        return uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            page,
                            callbackFn,
                            favoritedOnly
                        );
                    let iconID = response.formValues[0];
                    if (!iconID || !icons.resolve(iconID)) {
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            page,
                            callbackFn,
                            favoritedOnly,
                            iconIDSearch,
                            true,
                            iconID ? iconID : null
                        );
                    } else {
                        recentlyUsed.unshift(iconID);
                        recentlyUsed = recentlyUsed.slice(0, 45);
                        pdbTable.set("RecentlyUsed", recentlyUsed);
                        callbackFn(player, iconID);
                    }
                });
                return;
            }

            let keys = Array.from(icons.icons.keys());
            if (favoritedOnly === true) {
                keys = keys.filter((_) => player.hasTag(`favorited-icon:${_}`));
            }

            if (favoritedOnly === "RECENTLY_USED") {
                keys = recentlyUsed.filter((_) =>
                    Array.from(icons.icons.keys()).includes(_)
                );
            }

            let iconsPerPage = 25;
            let icons_ = _.chunk(keys, iconsPerPage);
            let totalPages = icons_.length ? icons_.length : 1;

            if (typeof page !== "number") {
                if (page === "PAGE_SELECT") {
                    let modalForm = new ModalForm();
                    modalForm.title(`${consts.tag}Page Select`);
                    modalForm.textField(
                        `Page Number (Max: ${totalPages}, Min: 1)`,
                        `Example: 5`,
                        undefined
                    );
                    modalForm.show(player, false, (player, response) => {
                        if (response.canceled) {
                            uiManager.open(
                                player,
                                config.uinames.basic.iconViewer,
                                0,
                                callbackFn,
                                favoritedOnly
                            );
                        }
                        if (
                            response.formValues &&
                            response.formValues.length &&
                            /^\d+$/.test(response.formValues[0]) &&
                            parseInt(response.formValues[0]) > 0 &&
                            parseInt(response.formValues[0]) <= totalPages
                        ) {
                            uiManager.open(
                                player,
                                config.uinames.basic.iconViewer,
                                parseInt(response.formValues[0]) - 1,
                                callbackFn,
                                favoritedOnly
                            );
                        } else {
                            uiManager.open(
                                player,
                                config.uinames.basic.iconViewer,
                                page,
                                callbackFn,
                                favoritedOnly
                            );
                        }
                    });
                    return;
                }
            }

            let currentIcons = icons_.length ? icons_[page] : [];
            let form = new ActionForm();
            form.title(
                `${consts.tag}${favoritedOnly === true
                    ? "Favorited Icons"
                    : favoritedOnly === "RECENTLY_USED"
                        ? "Recently Used"
                        : "Icon Viewer"
                } (Page ${page + 1}/${totalPages})`
            );
            for (let i = 0; i < currentIcons.length; i++) {
                let iconID = currentIcons[i];
                let iconData = icons.getIconData(iconID);
                let buttonText =
                    iconData && iconData.name ? iconData.name : iconID;
                let iconPath = icons.resolve(iconID);

                if (i % 2 === 0) {
                    buttonText = `${consts.right}${buttonText}`;
                } else {
                    if (i === currentIcons.length && currentIcons.length % 2 != 0) {
                        buttonText = `${consts.left}${buttonText}`;
                    } else {
                        buttonText = `${consts.disablevertical}${consts.left}${buttonText}`;
                    }
                }
                /*
                `${
                                    i == ids_sliced.length && ids_sliced.length % 2 != 0
                                        ? ``
                                        : i % 2 != 0
                                        ? `${NUT_UI_RIGHT_HALF}${NUT_UI_DISABLE_VERTICAL_SIZE_KEY}`
                                        : `${NUT_UI_LEFT_HALF}`
                                }§r${ids_online.includes(id) ? "§a" : "§v"}${
                                    player.name
                                }\n§r§7${
                                    ids_online.includes(id) ? "Online Player" : "Offline Player"
                                }`
                */
                form.button(buttonText, iconPath, () => {
                    let actionsForm = new ActionForm();
                    actionsForm.title(`${consts.tag}${iconID} actions`);

                    actionsForm.button("§cGo Back", "textures/blocks/barrier", () => {
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            page,
                            callbackFn,
                            favoritedOnly
                        );
                    });

                    if (player.hasTag(`favorited-icon:${iconID}`)) {
                        actionsForm.button(
                            "§eUnfavorite",
                            "textures/ui/sidebar_icons/star",
                            () => {
                                player.removeTag(`favorited-icon:${iconID}`);
                                uiManager.open(
                                    player,
                                    config.uinames.basic.iconViewer,
                                    page,
                                    callbackFn,
                                    favoritedOnly
                                );
                            }
                        );
                    } else {
                        actionsForm.button(
                            "§eAdd to favorites",
                            "textures/ui/sidebar_icons/star",
                            () => {
                                player.addTag(`favorited-icon:${iconID}`);
                                uiManager.open(
                                    player,
                                    config.uinames.basic.iconViewer,
                                    page,
                                    callbackFn,
                                    favoritedOnly
                                );
                            }
                        );
                    }

                    if (callbackFn) {
                        actionsForm.button(
                            "§dUse",
                            "textures/ui/check.png",
                            () => {
                                recentlyUsed.unshift(iconID);
                                recentlyUsed = recentlyUsed.slice(0, 45);
                                pdbTable.set("RecentlyUsed", recentlyUsed);
                                callbackFn(player, iconID);
                            }
                        );
                    }
                    actionsForm.show(player);
                });
            }

            let baseNavButtonsCount = 3;
            let totalNavButtons = baseNavButtonsCount;
            if (player.getTags().filter((_) => _.startsWith(`favorited-icon:`)).length > 0) {
                totalNavButtons++;
            }
            if (favoritedOnly === "RECENTLY_USED" || favoritedOnly === true) {
                totalNavButtons++;
            }
            if (callbackFn) {
                totalNavButtons += 4;
            }

            let backButtonText = "§cBack (Page " + (page === 0 ? totalPages : page) + ")";

            let backButtonIndex = currentIcons.length;
            if (backButtonIndex % 2 === 0) {
                backButtonText = `${consts.right}${backButtonText}`;
            } else {
                backButtonText = `${consts.disablevertical}${consts.left}${backButtonText}`;
            }
            form.button(backButtonText, "textures/ui/arrow_left", () => {
                let prevPage = page - 1 < 0 ? totalPages - 1 : page - 1;
                uiManager.open(
                    player,
                    config.uinames.basic.iconViewer,
                    prevPage,
                    callbackFn,
                    favoritedOnly
                );
            });
            let nextButtonText = "§aNext (Page " + (page + 2 > totalPages ? 1 : page + 2) + ")";
            let nextButtonIndex = currentIcons.length + 1;
            if (nextButtonIndex % 2 === 0) {
                nextButtonText = `${consts.right}${nextButtonText}`;
            } else {
                nextButtonText = `${consts.disablevertical}${consts.left}${nextButtonText}`;
            }
            form.button(nextButtonText, "textures/ui/arrow_right", () => {
                let nextPage = page + 1 >= totalPages ? 0 : page + 1;
                uiManager.open(
                    player,
                    config.uinames.basic.iconViewer,
                    nextPage,
                    callbackFn,
                    favoritedOnly
                );
            });

            let goToPageButtonText = "§dGo to page";
            let goToPageButtonIndex = currentIcons.length + 2;
            if (goToPageButtonIndex % 2 === 0) {
                goToPageButtonText = `${consts.right}${goToPageButtonText}`;
            } else {
                goToPageButtonText = `${consts.disablevertical}${consts.left}${goToPageButtonText}`;
            }
            form.button(
                goToPageButtonText,
                "textures/items/compass_item",
                () => {
                    uiManager.open(
                        player,
                        config.uinames.basic.iconViewer,
                        "PAGE_SELECT",
                        callbackFn,
                        favoritedOnly
                    );
                }
            );

            let tags = player
                .getTags()
                .filter((_) => _.startsWith(`favorited-icon:`));

            let favoritesButtonText = "§6Favorites (" + tags.length + ")";
            let favoritesButtonIndex = currentIcons.length + 3;
            if (favoritesButtonIndex % 2 === 0) {
                favoritesButtonText = `${consts.right}${favoritesButtonText}`;
            } else {
                favoritesButtonText = `${consts.disablevertical}${consts.left}${favoritesButtonText}`;
            }
            form.button(
                favoritesButtonText,
                "textures/ui/sidebar_icons/star",
                () => {
                    uiManager.open(
                        player,
                        config.uinames.basic.iconViewer,
                        0,
                        callbackFn,
                        !favoritedOnly
                    );
                }
            );

            let clearButtonText =
                favoritedOnly === "RECENTLY_USED"
                    ? "§eClear Recently Used"
                    : "§cClear Favorites";
            let clearButtonIndex = currentIcons.length + 4;
            const isLastNavButton =
                !callbackFn && clearButtonIndex === currentIcons.length + totalNavButtons - 1;

            if (clearButtonIndex % 2 === 0) {
                clearButtonText = `${consts.right}${clearButtonText}`;
            } else {
                if (isLastNavButton) {
                    clearButtonText = `${consts.left}${clearButtonText}`;
                } else {
                    clearButtonText = `${consts.disablevertical}${consts.left}${clearButtonText}`;
                }
            }
            form.button(
                clearButtonText,
                "textures/blocks/barrier",
                () => {
                    if (favoritedOnly === "RECENTLY_USED") {
                        pdbTable.set("RecentlyUsed", []);
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            page,
                            callbackFn,
                            favoritedOnly,
                            iconIDSearch,
                            iconIDSearchError,
                            defaultIconID
                        );
                    } else {
                        for (const tag of player.getTags()) {
                            if (tag.startsWith(`favorited-icon:`))
                                player.removeTag(tag);
                        }
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            page,
                            callbackFn,
                            favoritedOnly,
                            iconIDSearch,
                            iconIDSearchError,
                            defaultIconID
                        );
                    }
                }
            );

            if (callbackFn) {
                let cancelButtonText = "§cCancel";
                let cancelButtonIndex = currentIcons.length + 5;
                if (cancelButtonIndex % 2 === 0) {
                    cancelButtonText = `${consts.right}${cancelButtonText}`;
                } else {
                    cancelButtonText = `${consts.disablevertical}${consts.left}${cancelButtonText}`;
                }
                form.button(cancelButtonText, "textures/ui/cancel", () => {
                    callbackFn(player, null);
                });
                let useIconIDButtonText = "§dUse Icon ID";
                let useIconIDButtonIndex = currentIcons.length + 6;
                if (useIconIDButtonIndex % 2 === 0) {
                    useIconIDButtonText = `${consts.right}${useIconIDButtonText}`;
                } else {
                    useIconIDButtonText = `${consts.disablevertical}${consts.left}${useIconIDButtonText}`;
                }
                form.button(
                    useIconIDButtonText,
                    "textures/items/spyglass",
                    () => {
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            0,
                            callbackFn,
                            favoritedOnly,
                            true
                        );
                    }
                );
                let recentlyUsedButtonText = "§eRecently Used";
                let recentlyUsedButtonIndex = currentIcons.length + 7;
                if (recentlyUsedButtonIndex % 2 === 0) {
                    recentlyUsedButtonText = `${consts.right}${recentlyUsedButtonText}`;
                } else {
                    recentlyUsedButtonText = `${consts.disablevertical}${consts.left}${recentlyUsedButtonText}`;
                }
                form.button(
                    recentlyUsedButtonText,
                    "textures/items/clock_item",
                    () => {
                        uiManager.open(
                            player,
                            config.uinames.basic.iconViewer,
                            0,
                            callbackFn,
                            favoritedOnly === "RECENTLY_USED" ||
                                favoritedOnly === true
                                ? false
                                : "RECENTLY_USED"
                        );
                    }
                );
                let removeIconButtonText = "§cRemove Icon";
                let removeIconButtonIndex = currentIcons.length + 8;
                if (removeIconButtonIndex % 2 === 0) {
                    removeIconButtonText = `${consts.right}${removeIconButtonText}`;
                } else {
                    removeIconButtonText = `${consts.left}${removeIconButtonText}`;
                }
                form.button(
                    removeIconButtonText,
                    "textures/ui/icon_trash",
                    () => {
                        callbackFn(player, "");
                    }
                );
            }

            form.show(player);
        } catch (e) {
            console.warn(e, e.stack);
        }
    }
);