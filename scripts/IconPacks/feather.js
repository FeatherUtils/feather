import icons from "../Modules/icons";
        
    let iconPack = new Map([
    ["pack_name", "Feather"],
    ["pack_icon", "pack_icon.png"],
    ["pack_namespace", "feather"],
    ["pack_data", new Map([
  [
    "bank",
    "textures/feather_icons/bank"
  ],
  [
    "bankdeposit",
    "textures/feather_icons/bankdeposit"
  ],
  [
    "bankwithdraw",
    "textures/feather_icons/bankwithdraw"
  ],
  [
    "chat",
    "textures/feather_icons/chat"
  ],
  [
    "rng",
    "textures/feather_icons/rng"
  ]
])]
]);
icons.install(iconPack)
export { iconPack }