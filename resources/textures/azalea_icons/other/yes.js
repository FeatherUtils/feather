// Leaf icon pack generator. Made for node.js
const fs = require('fs');
let data = [];
fs.readdir('./', (err, files)=>{
    for(const file of files) {
        if(!file.endsWith('.png')) continue;
        let extensionRemoved = file.slice(0,-4);
        data.push([extensionRemoved, `textures/leaf_icons/${extensionRemoved}`])
        let code = `let rpgiabIconPack = new Map([
    ["pack_name", "RPGIAB Icon Pack"],
    ["pack_icon", "textures/azalea_icons/other/rpgiab_logo"],
    ["pack_namespace", "rpgiab"],
    ["pack_data", new Map(${JSON.stringify(data, null, 2)})]
]);
export { rpgiabIconPack }`;
        fs.writeFileSync('code.js', code);
        fs.writeFileSync('list.txt', `${data.map(_=>{
            return `leaf/${_[0]}, <categories>, <name>, <common>`
        }).join('\n')}`);
    }
})