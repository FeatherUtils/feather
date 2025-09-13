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
            misc: 'config_misc | Config/Misc',
            credits: 'config_credits'
        },
        homes: {
            view: 'homes_view | Homes/View',
            root: 'homes | Homes',
            create: 'homes_create | Homes/Create'
        },
        moderation: {
            root: 'moderation | Moderation',
            bans: {
                view: 'bans_view | Bans/View',
                root: 'bans | Bans',
                create: 'bans_create | Bans/Create'
            },
            mutes: {
                view: 'mutes_view | Mutes/View',
                root: 'mutes | Mutes',
                create: 'mutes_create | Mutes/Create'
            }
        },
        clans: {
            create: 'clans_create',
            public: 'clans_public',
            root: 'clans_root',
            viewMember: 'clans_viewmember',
            viewMembers: 'clans_viewmembers',
            bank: 'clans_bank',
            settings: 'clans_settings',
            adminSettings: 'admin_settings'
        },
        events: {
            root: 'ev | EV',
            add: 'ev_add | EV/Add',
            edit: 'ev_edit | EV/Edit',
            editactions: 'ev_editactions | EV/EditActions'
        }, 
        sidebarEditor: {
            create: 'se_create | SE/Create',
            root: 'se | SE',
            view: 'se_view | SE/View',
            viewlines: 'se_viewlines | SE/ViewLines',
            editline: 'se_editline | SE/EditLine'
        },
        ranks: {
            root: 'ranks | Ranks',
            add: "ranks_add | Ranks/Add",
            edit: "ranks_edit | Ranks/Edit",
            editform: "ranks_editForm | Ranks/EditForm"
        },
        basic: {
            confirmation: 'basic_confirm | Basic/Confirmation',
            iconViewer: 'basic_iconviewer | Basic/IconViewer',
            warps: 'basic_warps | Basic/Warps'
        },
        uiBuilder: {
            root: 'uibuilder_root | UIBuilder/Root',
            create: 'uibuilder_create | UIBuilder/Create',
            edit: 'uibuilder_edit | UIBuilder/Edit',
            buttons: {
                editall: 'uibuilder_buttons_editall | UIBuilder/Buttons/EditAll',
                create: 'uibuilder_buttons_create | UIBuilder/Buttons/Create',
                edit: 'uibuilder_buttons_edit | UIBuilder/Buttons/Edit',
                editActions: 'uibuilder_buttons_editActions | UIBuilder/Buttons/EditActions'
            },
            folders: {
                view: "uibuilder_folders_view | UIBuilder/Folders/View"
            }
        },
        inventorySee: 'invsee | InventorySee',
        platformSettings: {
            root: 'pfst_root | PlatformSettings/Root',
            whitelist: 'pfst_whitelist | PlatformSettings/Whitelist'
        },
        economyEditor: {
            root: 'economy_root',
            editCurrency: 'economy_editcurrency',
            create: 'economy_create'
        },
        pay: 'pay'
    },
    info: {
        name: 'Feather Essentials',
        abName: 'Feather',
        release: 'DEV',
        version: [0, 3],
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
    credits: [
        {name:'Isabella (isabelladakitty)', description:'Main contributor/Lead dev/Founder'},
        {name:'Fern (arandomfern)', description:'Secondary contributor/Developer'},
        {name:'TrashyDaFox (trashydafox)', description:'All JSON UI, Database, UI Manager + more'}
    ]
};
