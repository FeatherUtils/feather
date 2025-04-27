import { world } from "@minecraft/server";

export default {
    lang: {
        config: {
            root: {
                title: 'config_root_title',
                main_settings: 'config_root_mainSettings',
                modules: 'config_root_modules',
                header: 'config_root_header',
                desc1: 'config_root_desc1',
                desc2: 'config_root_desc2'
            },
            mainSettings: {
                title: 'config_mainsettings_title',
                ranks: 'config_mainsettings_ranks',
            },
            modules: {
                header: 'config_modules_header',
                desc: 'config_modules_desc',
                toggles: {
                    ranks: "config_modules_toggles_ranks",
                },
                text: {
                    crf: 'config_modules_text_crformat',
                    desc: {
                        crf: 'config_modules_text_descriptions_crf'
                    }
                },
                lang: 'config_modules_lang'
            }
        },
        noperms: {
            default: 'noperms_default',
            config: {
                root: 'noperms_config_root'
            }
        }
    },
    uinames: {
        config: {
            root: 'config | Config',
            modules: 'config_modules | Config/Modules',
            main: 'config_main | Config/Main',
            extra: 'config_extra | Config/Extra',
            misc: 'config_misc | Config/Misc'
        },
        ranks: {
            root: 'ranks | Ranks',
            add: "ranks_add | Ranks/Add",
            edit: "ranks_edit | Ranks/Edit",
        },
        basic: {
            confirmation: 'basic_confirm | Basic/Confirmation',
            iconViewer: 'basic_iconviewer | Basic/IconViewer'
        },
        uiBuilder: {
            root: 'uibuilder_root | UIBuilder/Root', // Done :3
            create: 'uibuilder_create | UIBuilder/Create', // Done
            edit: 'uibuilder_edit | UIBuilder/Edit', // Done
            buttons: {
                editall: 'uibuilder_buttons_editall | UIBuilder/Buttons/EditAll', // Done
                create: 'uibuilder_buttons_create | UIBuilder/Buttons/Create', // done
                edit: 'uibuilder_buttons_edit | UIBuilder/Buttons/Edit', // almost done
                editActions: 'uibuilder_buttons_editActions | UIBuilder/Buttons/EditActions' // starting..
            },
            folders: {
                view: "uibuilder_folders_view | UIBuilder/Folders/View"
            }
        }
    },
    info: {
        name: 'Feather Essentials',
        abName: 'Feather',
        release: 'DEV',
        version: [0, 1],
        versionString() {
            return `${this.release} ${this.version.join('.')}`;
        },
        defaultChatRankFormat: `§r<bc>[§r{{joined_ranks}}§r<bc>]§r §r<nc><name> §r<bc><arrow> §r<cc><msg>`,
    },
    config: {
        ui: "feather:config",
        openui: "feathergui:",
        devMode: async () => {
            return system.run(() => world.getDynamicProperty('devMode') ?? false)
        }
    },
    permissions: [
        {perm:'config',display:"Config UI"},
        {perm:'modules',display:"Modules"},
        {perm:'extra_settings',display:'Extra Settings'},
        {perm:'ranks',display:'Edit Ranks'},
        {perm:'ui_builder',display:'UI Builder'},
        {perm:'misc_settings',display:'Misc Settings'}
    ],
};
