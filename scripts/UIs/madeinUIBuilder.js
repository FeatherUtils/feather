export default [
    {
        "name": "Teleport Requests",
        "body": "",
        "scriptevent": "tpr",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "isBuiltIn": true,
        "buttons": [
            {
                "text": "§6Request",
                "subtext": "Request to teleport to a player",
                "requiredTag": "",
                "icon": "azalea/request",
                "actions": [
                    {
                        "action": "feather:open @s tpr-req",
                        "id": 1750137960282
                    }
                ],
                "id": 1750137960281,
                "type": "button"
            },
            {
                "text": "§r<name2>",
                "subtext": "[ Incoming - Accept ]",
                "requiredTag": "reqfrom:<name2>",
                "icon": "azalea/RequestIncoming",
                "actions": [
                    {
                        "action": "tp \"<name2>\" @s",
                        "id": 1750138252324
                    },
                    {
                        "action": "tag @s remove \"reqfrom:<name2>\"",
                        "id": 1750138875016
                    }
                ],
                "id": 1750138252323,
                "type": "button",
                "meta": "playerlist"
            }
        ]
    },
    {
        "name": "Request",
        "body": "",
        "scriptevent": "tpr-req",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "isBuiltIn": true,
        "buttons": [
            {
                "text": "§r<name2>",
                "subtext": "[ Request ]",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "tag \"<name2>\" add \"reqfrom:<realname>\"",
                        "id": 1750138385975
                    },
                    {
                        "action": "tell \"<name2>\" <realname> sent you a TP request!",
                        "id": 1750138725576
                    }
                ],
                "id": 1750138385974,
                "type": "button",
                "meta": "playerlist"
            }
        ]
    },
    {
        "name": "Config UI - Extra",
        "body": "",
        "scriptevent": "config_extra",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§cBack",
                "subtext": "Go back to Features",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768601154083
                    }
                ],
                "id": 1768601154082,
                "type": "button",
                "cherry": [
                    "header"
                ]
            },
            {
                "text": "§bCodes",
                "subtext": "Create and manage Gift Codes",
                "requiredTag": "",
                "icon": "azalea/11",
                "actions": [
                    {
                        "action": "opengui @s codes",
                        "id": 1768601216230
                    }
                ],
                "id": 1768601216229,
                "type": "button",
                "permission": "codes"
            },
            {
                "text": "§9Better Knockback",
                "subtext": "Configure Better Knockback",
                "requiredTag": "",
                "icon": "azalea/8",
                "actions": [
                    {
                        "action": "opengui @s config_betterkb",
                        "id": 1768674588868
                    }
                ],
                "id": 1768674588867,
                "type": "button",
                "permission": "betterKBConfig"
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Config UI - World",
        "body": "",
        "scriptevent": "config_world",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§cBack",
                "subtext": "Back to Features",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768599658325
                    }
                ],
                "id": 1768599658324,
                "type": "button",
                "cherry": [
                    "header"
                ]
            },
            {
                "text": "§eEvents",
                "subtext": "Run actions when something happens",
                "requiredTag": "",
                "icon": "blossom/event2",
                "actions": [
                    {
                        "action": "opengui @s ev",
                        "id": 1768599854135
                    }
                ],
                "id": 1768599854134,
                "type": "button",
                "permission": "events"
            },
            {
                "text": "§aPlatform Settings",
                "subtext": "Ban platforms from your server",
                "requiredTag": "",
                "icon": "azalea/devices(little changes)",
                "actions": [
                    {
                        "action": "opengui @s pfst_root",
                        "id": 1768600042482
                    }
                ],
                "id": 1768600042481,
                "type": "button",
                "permission": "platform_settings"
            },
            {
                "text": "§bClan Settings",
                "subtext": "Edit settings for the clans system",
                "requiredTag": "",
                "icon": "vanilla/diamond_sword",
                "actions": [
                    {
                        "action": "opengui @s config_clans",
                        "id": 1768600603530
                    }
                ],
                "id": 1768600603529,
                "type": "button",
                "permission": "clan_settings"
            },
            {
                "text": "§3Economy Editor",
                "subtext": "Edit the economy in Feather",
                "requiredTag": "",
                "icon": "vanilla/emerald",
                "actions": [
                    {
                        "action": "opengui @s economy_root",
                        "id": 1768600879527
                    }
                ],
                "id": 1768600879526,
                "type": "button",
                "permission": "economy"
            },
            {
                "text": "§5Leaderboards",
                "subtext": "Create and edit leaderboards",
                "requiredTag": "",
                "icon": "azalea/13",
                "actions": [
                    {
                        "action": "opengui @s leaderboards_root",
                        "id": 1768600979179
                    }
                ],
                "id": 1768600979178,
                "type": "button",
                "permission": "leaderboards"
            },
            {
                "text": "§cCombat Log",
                "subtext": "Configure combat log settings",
                "requiredTag": "",
                "icon": "azalea/ReportedPlayer",
                "actions": [
                    {
                        "action": "opengui @s config_clog",
                        "id": 1769445104817
                    }
                ],
                "id": 1769445104816,
                "type": "button",
                "permission": "clog"
            }
        ],
        "isBuiltIn": true,
        "allowedInCombat": true
    },
    {
        "name": "Config UI - Moderation",
        "body": "",
        "scriptevent": "config_moderation",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§6Player Management",
                "subtext": "Recommended way to ban, mute and warn",
                "requiredTag": "",
                "icon": "azalea/8",
                "actions": [
                    {
                        "action": "opengui @s plrmgmnt",
                        "id": 1768595834019
                    }
                ],
                "id": 1768595834018,
                "type": "button",
                "permission": "plrmgmnt"
            },
            {
                "text": "§cBans",
                "subtext": "Manage bans",
                "requiredTag": "",
                "icon": "azalea/5",
                "actions": [
                    {
                        "action": "opengui @s bans",
                        "id": 1768595628018
                    }
                ],
                "id": 1768595628017,
                "type": "button",
                "permission": "bans"
            },
            {
                "text": "§4Mutes",
                "subtext": "Manage & mute players",
                "requiredTag": "",
                "icon": "azalea/5-oldmaybe",
                "actions": [
                    {
                        "action": "opengui @s mutes",
                        "id": 1768595658572
                    }
                ],
                "id": 1768595658571,
                "type": "button",
                "permission": "mute"
            },
            {
                "text": "§bWarnings",
                "subtext": "Manage & warn players",
                "requiredTag": "",
                "icon": "azalea/ReportedPlayer",
                "actions": [
                    {
                        "action": "opengui @s warns",
                        "id": 1768595679016
                    }
                ],
                "id": 1768595679015,
                "type": "button",
                "permission": "warn"
            },
            {
                "text": "§cBack",
                "subtext": "Go back to Features",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768595881166
                    }
                ],
                "id": 1768595881165,
                "type": "button",
                "cherry": [
                    "header"
                ]
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Config UI - Chat",
        "body": "",
        "scriptevent": "config_chat",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§dRanks",
                "subtext": "Edit & create ranks",
                "requiredTag": "",
                "icon": "blossom/rank",
                "actions": [
                    {
                        "action": "opengui @s ranks",
                        "id": 1768590613965
                    }
                ],
                "id": 1768590613964,
                "type": "button",
                "permission": "ranks"
            },
            {
                "text": "§cChat Rank Format",
                "subtext": "Edit the Rank Format",
                "requiredTag": "",
                "icon": "blossom/ranks",
                "actions": [
                    {
                        "action": "opengui @s config_crf",
                        "id": 1768590181665
                    }
                ],
                "id": 1768590181664,
                "type": "button",
                "permission": "crf"
            },
            {
                "text": "§bAnti Spam",
                "subtext": "Prevent players from spamming",
                "requiredTag": "",
                "icon": "feather/chat",
                "actions": [
                    {
                        "action": "opengui @s config_antiSpam",
                        "id": 1768590270165
                    }
                ],
                "id": 1768590270164,
                "type": "button",
                "permission": "antiSpamSettings"
            },
            {
                "text": "§gRepeated Broadcasts",
                "subtext": "Repeatedly send messages to the server",
                "requiredTag": "",
                "icon": "azalea/5-oldmaybe",
                "actions": [
                    {
                        "action": "opengui @s repeated_broadcasts",
                        "id": 1768590373415
                    }
                ],
                "id": 1768590373414,
                "type": "button",
                "permission": "repbroad"
            },
            {
                "text": "§aProximity Chat",
                "subtext": "Edit proximity chat settings",
                "requiredTag": "",
                "icon": "azalea/8",
                "actions": [
                    {
                        "action": "opengui @s config_proximity",
                        "id": 1769809883792
                    }
                ],
                "id": 1769809883791,
                "type": "button"
            },
            {
                "text": "§cBack",
                "subtext": "Go back to Features",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768590663361
                    }
                ],
                "id": 1768590663360,
                "type": "button",
                "cherry": [
                    "header"
                ]
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Warps",
        "body": "",
        "scriptevent": "warps",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "isBuiltIn": true,
        "buttons": [
            {
                "text": "§e<warpname>",
                "subtext": "[ Teleport ]",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "feather:warp \"<warpname>\"",
                        "id": 1750127490910
                    }
                ],
                "id": 1750127490909,
                "type": "button",
                "meta": "warp"
            }
        ],
        "allowedInCombat": true
    },
    {
        "name": "Config UI - Extensions",
        "body": "This will only show buttons if you have an Extension Add-On installed.",
        "scriptevent": "config_extensions",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§cBack",
                "subtext": "Go back to Config UI",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_main",
                        "id": 1768588382742
                    }
                ],
                "id": 1768588382741,
                "type": "button",
                "cherry": [
                    "header"
                ]
            },
            {
                "text": "Communication",
                "subtext": "",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "a",
                        "id": 1768586615607
                    }
                ],
                "id": 1768586615606,
                "type": "button",
                "cherry": [],
                "meta": "CONFIG_API"
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Config UI - Teleportation",
        "body": "",
        "scriptevent": "config_teleportation",
        "layout": 4,
        "theme": 0,
        "type": "UI",
        "buttons": [
            {
                "text": "§cBack",
                "subtext": "Go back to Features",
                "requiredTag": "",
                "icon": "azalea/2",
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768600535477
                    }
                ],
                "id": 1768600535476,
                "type": "button",
                "cherry": [
                    "header"
                ]
            },
            {
                "text": "§6Home Settings",
                "subtext": "Edit settings for the Homes Feature",
                "requiredTag": "",
                "icon": "azalea/6",
                "actions": [
                    {
                        "action": "opengui @s config_homes",
                        "id": 1768600320981
                    }
                ],
                "id": 1768600320980,
                "type": "button",
                "permission": "homesettings"
            },
            {
                "text": "§bRTP Settings",
                "subtext": "Edit settings for RTP",
                "requiredTag": "",
                "icon": "feather/rng",
                "actions": [
                    {
                        "action": "opengui @s config_rtp",
                        "id": 1768600514079
                    }
                ],
                "id": 1768600514078,
                "type": "button",
                "permission": "RTPSettings"
            },
            {
                "text": "§9Warp Management",
                "subtext": "Manage warps in your server",
                "requiredTag": "",
                "icon": "azalea/WarpEditor-old",
                "actions": [
                    {
                        "action": "opengui @s warpmgmnt",
                        "id": 1768665145311
                    }
                ],
                "id": 1768665145310,
                "type": "button",
                "permission": "warps"
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Config UI - Features",
        "body": "",
        "scriptevent": "config_misc",
        "layout": 4,
        "theme": "§u§p§d§4",
        "type": "UI",
        "buttons": [
            {
                "text": "Main Settings",
                "subtext": "",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "open @s config_main",
                        "id": 1768582498408
                    }
                ],
                "id": 1768582498407,
                "type": "button",
                "cherry": [
                    "disableVertical",
                    "left"
                ]
            },
            {
                "text": "Features",
                "subtext": "",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "open @s config_misc",
                        "id": 1768582511760
                    }
                ],
                "id": 1768582511759,
                "type": "button",
                "cherry": [
                    "alt",
                    "right"
                ]
            },
            {
                "text": "§aChat",
                "subtext": "Configure Chat Features",
                "requiredTag": "",
                "icon": "feather/chat",
                "actions": [
                    {
                        "action": "open @s config_chat",
                        "id": 1768595114260
                    }
                ],
                "id": 1768595114259,
                "type": "button"
            },
            {
                "text": "§cModeration",
                "subtext": "Moderate players on the server",
                "requiredTag": "",
                "icon": "azalea/5",
                "actions": [
                    {
                        "action": "open @s config_moderation",
                        "id": 1768595943916
                    }
                ],
                "id": 1768595943915,
                "type": "button"
            },
            {
                "text": "§dWorld",
                "subtext": "Make changes to your world",
                "requiredTag": "",
                "icon": "azalea/WarpEditor",
                "actions": [
                    {
                        "action": "open @s config_world",
                        "id": 1768599725388
                    }
                ],
                "id": 1768599725387,
                "type": "button"
            },
            {
                "text": "§uTeleportation",
                "subtext": "Edit settings related to Teleportation",
                "requiredTag": "",
                "icon": "vanilla/ender_pearl",
                "actions": [
                    {
                        "action": "open @s config_teleportation",
                        "id": 1768600433326
                    }
                ],
                "id": 1768600433325,
                "type": "button"
            },
            {
                "text": "§1Extra",
                "subtext": "Edit more settings",
                "requiredTag": "",
                "icon": "azalea/DevSettings",
                "actions": [
                    {
                        "action": "open @s config_extra",
                        "id": 1768665743535
                    }
                ],
                "id": 1768665743534,
                "type": "button",
                "permission": "extra_settings"
            }
        ],
        "isBuiltIn": true
    },
    {
        "name": "Config UI - Main",
        "body": "",
        "scriptevent": "config_main",
        "layout": 4,
        "theme": "§u§p§d§4",
        "type": "UI",
        "buttons": [
            {
                "text": "Main Settings",
                "subtext": "",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "open @s config_main",
                        "id": 1768581160210
                    }
                ],
                "id": 1768581160209,
                "type": "button",
                "cherry": [
                    "alt",
                    "disableVertical",
                    "left"
                ]
            },
            {
                "text": "Features",
                "subtext": "",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "/open @s config_misc",
                        "id": 1768581408516
                    }
                ],
                "id": 1768581408515,
                "type": "button",
                "cherry": [
                    "right"
                ]
            },
            {
                "text": "§dUI Builder",
                "subtext": "Create custom, amazing UIs",
                "requiredTag": "",
                "icon": "azalea/9",
                "actions": [
                    {
                        "action": "opengui @s uibuilder_root",
                        "id": 1768584955822
                    }
                ],
                "id": 1768584955821,
                "type": "button",
                "permission": "ui_builder"
            },
            {
                "text": "§gSidebar Editor",
                "subtext": "Create custom sidebars easily",
                "requiredTag": "",
                "icon": "azalea/Sidebar",
                "actions": [
                    {
                        "action": "opengui @s se",
                        "id": 1768585021919
                    }
                ],
                "id": 1768585021918,
                "type": "button",
                "permission": "sidebar_editor"
            },
            {
                "text": "§eModules",
                "subtext": "Edit Modules in Feather",
                "requiredTag": "",
                "icon": "blossom/edit",
                "actions": [
                    {
                        "action": "/opengui @s config_modules",
                        "id": 1768584856119
                    }
                ],
                "id": 1768584856118,
                "type": "button",
                "permission": "modules"
            },
            {
                "text": "§uPermissions",
                "subtext": "Allow tags to do things in the addon",
                "requiredTag": "",
                "icon": "azalea/4",
                "actions": [
                    {
                        "action": "opengui @s permissions",
                        "id": 1768588620010
                    }
                ],
                "id": 1768588620009,
                "type": "button",
                "permission": "administrator"
            },
            {
                "text": "§6Credits",
                "subtext": "See who contributed to the Add-On",
                "requiredTag": "",
                "icon": "azalea/credits(little changes)",
                "actions": [
                    {
                        "action": "opengui @s config_credits",
                        "id": 1768583036013
                    }
                ],
                "id": 1768583036012,
                "type": "button"
            },
            {
                "text": "§eExtensions",
                "subtext": "View installed extensions",
                "requiredTag": "",
                "icon": "azalea/ExtIcon",
                "actions": [
                    {
                        "action": "open @s config_extensions",
                        "id": 1768666262975
                    }
                ],
                "id": 1768666262974,
                "type": "button"
            },
            {
                "text": "§aVoting",
                "subtext": "Allow players to vote",
                "requiredTag": "",
                "icon": "blossom/vote",
                "actions": [
                    {
                        "action": "opengui @s voting_root",
                        "id": 1768681564663
                    }
                ],
                "id": 1768681564662,
                "type": "button"
            },
            {
                "text": "§cBack to Old Config UI",
                "subtext": "Old, unsupported",
                "requiredTag": "",
                "icon": "azalea/DevSettings2",
                "actions": [
                    {
                        "action": "tag @s add oldconfig",
                        "id": 1768666497296
                    },
                    {
                        "action": "opengui @s config",
                        "id": 1768666558399
                    }
                ],
                "id": 1768666497295,
                "type": "button",
                "cherry": [
                    "header"
                ],
                "permission": ""
            }
        ],
        "isBuiltIn": true
    }
];