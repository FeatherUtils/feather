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
            credits: 'config_credits',
            rtp: 'config_rtp',
            homes: 'config_homes',
            antiSpam: 'config_antiSpam',
            clans: 'config_clans',
            crf: 'config_crf',
            afkKick: 'config_afkKick',
            betterKB: 'config_betterkb',
            clog: 'config_clog',
            proximity: 'config_proximity'
        },
        playerShop: {
            root: 'playershop',
            search: 'playershop_search',
            view: 'playershop_view',
            create: 'playershop_create',
            edit: 'playershop_edit',
            addItem: 'playershop_additem',
            editItem: 'playershop_edititem',
            viewItem: 'playershop_viewitem'
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
            },
            warns: {
                create: 'warns_create',
                view: 'warns_view',
                root: 'warns'
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
            warps: 'basic_warps | Basic/Warps',
            popupMenu: 'basic_popup | Basic/Popup'
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
            },
            builtInUIs: 'uibuilder_builtinuis'
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
        pay: 'pay',
        voting: {
            admin: 'voting_admin',
            edit: 'voting_edit',
            root: 'voting_root',
            start: 'voting_start',
            view: 'voting_view'
        },
        bounty: {
            leaderboard: 'bounty_leaderboard',
            root: 'bounty',
            add: 'bounty_add'
        },
        repeatedBroadcasts: {
            root: 'repeated_broadcasts',
            create: 'repeated_broadcasts_create',
            edit: 'repeated_broadcasts_edit'
        },
        leaderboards: {
            root: 'leaderboards_root',
            create: 'leaderboards_create',
            edit: 'leaderboards_edit',
            spawn: 'leaderboards_spawn'
        },
        codes: {
            root: 'codes | Codes',
            admin: 'codes_admin | Codes/Admin',
            create: 'codes_create | Codes/Create',
            manage: 'codes_manage | Codes/Manage',
            details: 'codes_details | Codes/Details',
            addAction: 'codes_addaction | Codes/AddAction',
            redeem: 'codes_redeem | Codes/Redeem'
        },
        shop: {
            root: 'shop_root', // d
            addCategory: 'shop_addCategory', // d
            editCategory: 'shop_editCategory', // d
            addItem: 'shop_addItem',
            editItem: 'shop_editItem',
            viewCategory: 'shop_viewCategory', // d
            viewItem: 'shop_viewItem'
        },
        playerManagement: {
            root: 'plrmgmnt',
            search: 'plrmgmnt_search',
            view: 'plrmgmnt_view'
        },
        warpManagement: 'warpmgmnt',
        permissions: {
            root: 'permissions',
            edit: 'permissions_editrole',
            editPermissions: 'permissions_editrole_permissions',
            create: 'permissions_createrole'
        },
    },
    info: {
        name: 'Feather Essentials',
        abName: 'Feather',
        release: '§eGold',
        version: [9],
        versionString() {
            return `${this.release} §e${this.version.join('.')}`;
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
        { perm: 'config', display: "Config UI" },
        { perm: 'modules', display: "Modules" },
        { perm: 'extra_settings', display: 'Extra Settings' },
        { perm: 'ranks', display: 'Edit Ranks' },
        { perm: 'ui_builder', display: 'UI Builder' },
        { perm: 'misc_settings', display: 'Misc Settings' },
        { perm: 'bans', display: 'Bans' },
        { perm: 'mute', display: 'Mute' },
        { perm: 'warn', display: 'Warn' },
        { perm: 'plrmgmnt', display: 'Player Management' },
        { perm: 'codes', display: 'Codes (admin)' },
        { perm: 'bypassAntiSpam', display: 'Bypass Anti Spam' },
        { perm: 'sidebar_editor', display: 'Sidebar Editor' },
        { perm: 'events', display: 'Events' },
        { perm: 'voting_admin', display: 'Voting Admin' },
        { perm: 'crf', display: 'Edit Chat Rank format' },
        { perm: 'platform_settings', display: 'Platform Settings' },
        { perm: 'economy', display: 'Economy' },
        { perm: 'warps', display: 'Warp Management' },
        { perm: 'clan_settings', display: 'Clan Settings' },
        { perm: 'repbroad', display: 'Repeated Broadcasts' },
        { perm: 'leaderboards', display: 'Leaderboards' },
        { perm: 'afkkicksettings', display: 'AFK Kick Settings' },
        { perm: 'homesettings', display: "Home Settings" },
        { perm: 'antiSpamSettings', display: 'Anti Spam Settings' },
        { perm: 'quests', display: 'Quests' },
        { perm: 'lifestealConfig', display: 'Lifesteal config' },
        { perm: 'dynamicLighting', display: 'Dynamic Lighting config' },
        { perm: 'RTPSettings', display: 'RTP Settings' },
        { perm: 'bypassRTPCooldown', display: 'Bypass RTP Cooldown' },
        { perm: 'betterKBConfig', display: "Configure BetterKB" },
        { perm: 'clearchat', display: "Clear Chat" },
        { perm: 'clog', display: 'Combat Log Config' },
        { perm: 'proximity', display: 'Proximity Chat Config' },
        { perm: 'playerShopAdmin', display: 'Player Shop Admin' },
        { perm: 'bind', display: 'Bind items to commands' }
    ],
    credits: [
        { name: 'Isabella (isabelladakitty)', description: 'Main contributor/Lead dev/Founder' },
        { name: 'Fern (arandomfern)', description: 'Secondary contributor/Developer' },
        { name: 'TrashyDaFox (trashydafox)', description: 'All JSON UI, Database, UI Manager + more' }
    ]
};
