export default [
    {
        "name": "Teleport Requests",
        "body": "",
        "scriptevent": "tpr",
        "layout": 4,
        "theme": 0,
        "type": "UI",
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
                        "action": "tp <name2> @s",
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
        "buttons": [
            {
                "text": "§r<name2>",
                "subtext": "[ Request ]",
                "requiredTag": "",
                "icon": null,
                "actions": [
                    {
                        "action": "tag \"<name2>\" add \"reqfrom:<name>\"",
                        "id": 1750138385975
                    },
                    {
                        "action": "tell \"<name2>\" <name> sent you a TP request!",
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
        "name": "Warps",
        "body": "",
        "scriptevent": "warps",
        "layout": 4,
        "theme": 0,
        "type": "UI",
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
        ]
    }
];