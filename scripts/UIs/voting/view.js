import { ActionForm } from "../../Libraries/form_func";
import voting from "../../Modules/voting";
import uiManager from "../../Libraries/uiManager";
import config from "../../config";

uiManager.addUI(config.uinames.voting.view, 'voting view', (player,id) => {
    let downvotes = [];
    let upvotes = [];
    for(const v of voting.db.findDocuments({type:'Vote'})) {
        if(v.data.referendum == id) {
            if(v.data.voteType == 'upvote') {
                upvotes.push(v)
            } else {
                downvotes.push(v)
            }
        }
    }
    let r = voting.get(id)
    if(!r) return;
    let form = new ActionForm();
    form.title(`§f§0§0§f§r${r.data.title.substring(0,45)}`)
    form.body(`${r.data.body}\n§r§cDownvotes: ${downvotes.length}\n§aUpvotes: ${upvotes.length}\n§bTotal: ${upvotes.length + downvotes.length}`)
    form.button(`§cBack\n§7Go to previous UI`, `textures/azalea_icons/2.png`, (player)=>{
        uiManager.open(player, config.uinames.voting.root)
    })
    form.button(`§aUpvote\n§7Upvote this referendum`, 'textures/blossom_icons/upvote.png', (player) => {
        voting.vote(id,player,'upvote')
        uiManager.open(player, config.uinames.voting.view, id)
    })
    form.button(`§cDownvote\n§7Downvote this referendum`, 'textures/blossom_icons/downvote.png', (player) => {
        voting.vote(id,player,'downvote')
        uiManager.open(player, config.uinames.voting.view, id)
    })
    form.show(player)
})