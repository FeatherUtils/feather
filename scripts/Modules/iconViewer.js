import { ChestFormData } from '../Libraries/ChestUI/chestUI'
import icons from './icons'
import config from '../config'
import uiManager from '../Libraries/uiManager'
import common from '../Libraries/ChestUI/common'
import _ from './underscore'
import { ModalFormData } from '@minecraft/server-ui'

let rows = 6

uiManager.addUI(config.uinames.basic.iconViewer, 'icon viewer', (player, p, callback, manualIconID = false, manualIconIDDefault = null, manualIconIDError = false, searchQuery = null) => {
    let iconSpace = (9 * rows) - 1 * 9
    if (manualIconID) {
        let form = new ModalFormData();
        form.title('Manual Icon ID')
        form.textField('IconID', 'Example: feather/FeatherBuilder', { defaultValue: manualIconIDDefault })
        form.title(
            manualIconIDError ? '§cIcon not found!' : "§bInput Icon ID"
        );
        form.show(player).then((response) => {
            if (response.canceled)
                return uiManager.open(
                    player,
                    config.uinames.basic.iconViewer,
                    page,
                    callback,
                    false,
                    null,
                    false,
                    searchQuery
                );
            let iconID = response.formValues[0];
            if (!iconID || !icons.resolve(iconID)) {
                uiManager.open(
                    player,
                    config.uinames.basic.iconViewer,
                    p,
                    callback,
                    manualIconID,
                    manualIconIDDefault = iconID,
                    manualIconIDError = true,
                    searchQuery
                );
            } else {
                let iconSelection = new ChestFormData('27')
                iconSelection.title('Confirm')
                if (callback) {
                    iconSelection.button(
                        common.rowColToSlotId(2, 2),
                        `§aUse`,
                        ['Use this icon'],
                        'textures/azalea_icons/other/accept',
                        1,
                        false,
                        () => {
                            callback(player, iconID)
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 5),
                        `§b${iconID}`,
                        ['Selected icon'],
                        icons.resolve(iconID),
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 8),
                        `§cBack`,
                        ['Go back to IconViewer'],
                        'textures/azalea_icons/2',
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.show(player)
                } else {
                    iconSelection.button(
                        common.rowColToSlotId(1, 5),
                        `§b${iconID}`,
                        ['Selected icon'],
                        icons.resolve(iconID),
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 5),
                        `§cBack`,
                        ['Go back to IconViewer'],
                        'textures/azalea_icons/2',
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.show(player)
                }
            }
        })
        return;
    }
    let form = new ChestFormData((9 * rows).toString());
    let page = p ?? 0
    let keys = Array.from(icons.icons.keys());
    if (searchQuery) {
        keys = keys.filter(_ => _.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    let icons_ = _.chunk(keys, iconSpace);
    let icons2 = icons_[page] ?? [];
    form.title(`Icon Viewer (Page ${page ?? 1})`)
    for (let i = 0; i < (9 * rows); i++) {
        form.button(i, `§cX`, [], 'textures/blocks/tinted_glass', null, null, () => {
            uiManager.open(player, config.uinames.basic.iconViewer, page, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
        })
    }
    for (let i = 0; i < iconSpace; i++) {
        let iconData = icons.getIconData(icons2[i]);
        let l = [];
        if (iconData && iconData.name) {
            l.push(`§8${icons2[i]}`);
        }
        form.button(
            i,
            iconData && iconData.name ? iconData.name : icons2[i],
            l,
            icons.resolve(icons2[i]),
            null,
            null,
            () => {
                let iconSelection = new ChestFormData('27')
                iconSelection.title('Confirm')
                if (callback) {
                    iconSelection.button(
                        common.rowColToSlotId(2, 5),
                        `§b${icons2[i]}`,
                        ['Selected icon'],
                        icons.resolve(icons2[i]),
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 2),
                        `§aUse`,
                        ['Use this icon'],
                        'textures/azalea_icons/other/accept',
                        1,
                        false,
                        () => {
                            callback(player, icons2[i])
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 8),
                        `§cBack`,
                        ['Go back to IconViewer'],
                        'textures/azalea_icons/2',
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.show(player)
                } else {
                    iconSelection.button(
                        common.rowColToSlotId(1, 5),
                        `§b${icons2[i]}`,
                        ['Selected icon'],
                        icons.resolve(icons2[i]),
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.button(
                        common.rowColToSlotId(2, 5),
                        `§cBack`,
                        ['Go back to IconViewer'],
                        'textures/azalea_icons/2',
                        1,
                        false,
                        () => {
                            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
                        }
                    )
                    iconSelection.show(player)
                }

            }
        )
    }
    form.button(
        common.rowColToSlotId(6, 2),
        '§cBack',
        ['Go to previous page'],
        'textures/blocks/glass_red',
        1,
        false,
        () => {
            if (p < 1) {
                uiManager.open(player, config.uinames.basic.iconViewer, p, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
            } else {
                uiManager.open(player, config.uinames.basic.iconViewer, p - 1, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)
            }
        }
    )
    form.button(
        common.rowColToSlotId(6, 8),
        '§aNext',
        ['Go to next page'],
        'textures/blocks/glass_lime',
        1,
        false,
        () => {
            let nextPage = page + 1 >= icons_.length ? 0 : page + 1;
            uiManager.open(player, config.uinames.basic.iconViewer, nextPage, callback, false, manualIconIDDefault, manualIconIDError, searchQuery)

        }
    )
    form.button(
        common.rowColToSlotId(6, 5),
        '§6Manual',
        ['Manually input icon ID'],
        icons.resolve('azalea/11'),
        1,
        false,
        () => {
            uiManager.open(player, config.uinames.basic.iconViewer, p, callback, true, manualIconIDDefault, manualIconIDError)
        }
    )
    form.button(
        common.rowColToSlotId(6, 4),
        '§bSearch',
        ['Search for icons'],
        icons.resolve('azalea/Look for UI'),
        1,
        false,
        () => {
            let form2 = new ModalFormData();
            form2.title('Search')
            form2.textField('Search query', 'example: builder')
            form2.show(player).then((res) => {
                let [q] = res.formValues;
                if (!q) return uiManager.open(player, config.uinames.basic.iconViewer, p, callback);
                uiManager.open(player, config.uinames.basic.iconViewer, p, callback, manualIconID, manualIconIDDefault, manualIconIDError, q)
            })
        }
    )
    form.button(
        common.rowColToSlotId(6, 6),
        '§cCancel',
        ['Cancel'],
        icons.resolve('rpgiab/delete'),
        1,
        false,
        () => {
            if(callback) callback(player,null)
        }
    )
    form.show(player)
})