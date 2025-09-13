import uiManager from "../Libraries/uiManager";
import config from "../config";
import { ModalFormData } from "@minecraft/server-ui";
import { ActionForm } from "../Libraries/form_func";
import { consts } from "../cherryUIConsts";
import clans from "../Modules/clans";
import playerStorage from "../Libraries/playerStorage";
import { prismarineDb } from "../Libraries/prismarinedb";
import { world } from "@minecraft/server";

uiManager.addUI(config.uinames.clans.root, 'clans root', async (player) => {
    let id = player.id
    let clan = clans.getFromPlayerID(id)
    console.log(clan)

    let form = new ActionForm();
    form.title(`${consts.tag}Clans`)
    if (clan) {
        let role = clan.data.members.find(_ => _.id == id).role
        form.button(`§cLeave\n§7Leave this clan`, `.azalea/2`, (player) => {
            clans.leave(id)
            return uiManager.open(player, config.uinames.clans.root)
        })
        form.button(`§bMembers\n§7View all players in clan`, `.azalea/8-old`, (player) => {
            uiManager.open(player, config.uinames.clans.viewMembers)
        })
        if (clan.data.base) {
            form.button(`§aTeleport\n§7Teleport to the clan base`, `.vanilla/ender_pearl`, async (player) => {
                let asd = await clans.teleportToBase(player)
                if(asd === false) return player.error('Something went wrong while teleporting.')
            })
        }
        form.button(`§6Bank\n§7Contribute to the Clan Bank`, `.feather/bank`, (player) => {
            uiManager.open(player, config.uinames.clans.bank)
        })
        if (role > 1) {
            if (clan.data.base) {
                form.button(`§cDelete Clan Base\n§7Delete the clan base`, `.azalea/SidebarTrash`, (player) => {
                    clans.delBase(clan.id)
                    uiManager.open(player, config.uinames.clans.root)
                })
            } else {
                form.button(`§aSet Clan Base\n§7Set the clan base to your location`, '.azalea/1', (player) => {
                    clans.setBase(player)
                    uiManager.open(player, config.uinames.clans.root)
                })
            }
            let invites = clans.inviteDB.findDocuments({ clanID: clan.id, type: 'Request' })
            form.button(`§aJoin Requests\n§7View join requests for clan (${invites.length})`, `.azalea/RequestIncoming`, (player) => {
                let form2 = new ActionForm();
                form2.title(`${consts.tag}Join Requests`)
                form2.button(`${consts.header}§cBack\n§7Go back to clans UI`, `.azalea/2`, (player) => {
                    uiManager.open(player, config.uinames.clans.root)
                })
                for (const invite of invites) {
                    let plr = playerStorage.getPlayerByID(invite.data.plrID)
                    if (!plr) continue;
                    form2.button(`§6${plr.name}\n§7View request`, `.azalea/RequestIncoming`, (player) => {
                        let form3 = new ActionForm();
                        form3.title(`${consts.tag}Clan Request`)
                        form3.button(`§aAccept`, '.azalea/4-a', (player) => {
                            clans.acceptReq(invite.id)
                            uiManager.open(player, config.uinames.clans.root)
                        })
                        form3.button(`§cDecline`, `.azalea/Delete`, (player) => {
                            clans.decline(invite.id)
                            uiManager.open(player, config.uinames.clans.root)
                        })
                        form3.show(player)
                    })
                }
                form2.show(player)
            })
            form.button(`§dInvite\n§7Send someone an invite to the clan`, `.azalea/request`, (player) => {
                let plrids = playerStorage.searchPlayersByName('')
                let form2 = new ActionForm();
                form2.title(`${consts.tag}Invite`)
                form2.button(`${consts.header}§cBack\n§7Back to clans ui`, '.azalea/2', (player) => {
                    uiManager.open(player, config.uinames.clans.root)
                })
                for (const plrid of plrids) {
                    let plr = playerStorage.getPlayerByID(plrid)
                    if (plr.name === player.name) continue;
                    if (clan.data.members.find(_ => _.id === plrid)) continue;
                    form2.button(`§6${plr.name}\n§7Invite player`, `.azalea/request`, (player) => {
                        clans.invite(clan.id, plrid)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                }
                form2.show(player)
            })
            form.button(`§cBans\n§7Unban people from the clan`, `.azalea/5`, (player) => {
                let form2 = new ActionForm();
                form2.title(consts.tag + 'Bans')
                form2.button(`${consts.header}§cBack\n§7Back to clans page`, `.azalea/2`, (player) => {
                    uiManager.open(player, config.uinames.clans.root)
                })
                for (const ban of clan.data.bans) {
                    let plr = playerStorage.getPlayerByID(ban)
                    form2.button(`${plr.name}\n§7Unban player`, `.azalea/8-old`, (player) => {
                        clans.unban(clan.id, ban)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                }
                form2.show(player)
            })
        }
    } else {
        form.button(`§aCreate\n§7Create a clan`, `.azalea/1`, (player) => {
            uiManager.open(player, config.uinames.clans.create);
        })
        let invites = clans.inviteDB.findDocuments({ plrID: id, type: 'Invite' })
        form.button(`§6Invites\n§7View clan invites (${invites.length})`, `.azalea/request`, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}Clan Invites`)
            form2.button(`${consts.header}§cBack\n§7Go back to clans UI`, `.azalea/2`, (player) => {
                uiManager.open(player, config.uinames.clans.root)
            })
            for (const invite of invites) {
                let clan2 = clans.get(invite.data.clanID)
                if (!clan2) continue;
                form2.button(`§6${clan2.data.name}\n§7View invite`, `.azalea/RequestIncoming`, (player) => {
                    let form3 = new ActionForm();
                    form3.title(`${consts.tag}Clan Invite`)
                    form3.button(`§aAccept`, '.azalea/4-a', (player) => {
                        clans.acceptInv(invite.id)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                    form3.button(`§cDecline`, `.azalea/Delete`, (player) => {
                        clans.decline(invite.id)
                        uiManager.open(player, config.uinames.clans.root)
                    })
                    form3.show(player)
                })
            }
            form2.show(player)
        })
        form.button(`§bPublic Clans\n§7View and request to join public clans`, `.azalea/WarpEditor`, (player) => {
            uiManager.open(player, config.uinames.clans.public)
        })
    }
    form.show(player)
})

uiManager.addUI(config.uinames.clans.create, 'clans create', (player) => {
    let form = new ModalFormData();
    form.title('Create Clan')
    form.textField('Name', 'Example: Diamond')
    form.toggle(`Public`, { tooltip: 'Whether your clan can be discovered publicly', defaultValue: true })
    form.show(player).then((res) => {
        let [name, ispublic] = res.formValues
        if (name.length > 12) return player.error('Can not make clan name more than 12 letters long');
        if (!name) return player.error(`No name found`)
        clans.addClan(player, name, ispublic)
        uiManager.open(player, config.uinames.clans.root)
    })
})

uiManager.addUI(config.uinames.clans.public, 'a', (player) => {
    let form = new ActionForm();
    form.title(consts.tag + 'Public Clans')
    form.button(`§4Back\n§7Back to clans menu`, `.azalea/2`, (player) => {
        uiManager.open(player, config.uinames.clans.root)
    })
    for (const clan2 of clans.db.findDocuments()) {
        if (!clan2.data.name) continue;
        if (clan2.data.settings.isPublic !== true) continue;
        let banned = false;
        if (clan2.data.bans.find(_ => _ === player.id)) banned = true
        form.button(`§r${clan2.data.name}\n§r§7[ View Clan ]`, '.vanilla/diamond_sword', (player) => {
            let form2 = new ActionForm();
            form2.title(`${clan2.data.name}`)
            form2.body(`§eName: §r${clan2.data.name}\n§r§7Members: §r${clan2.data.members.length}`)
            if (banned == true) {
                form2.header('§cYou are banned from this clan')
            } else {
                form2.button(`${clan2.data.settings.publicApproval ? '§aRequest' : '§aJoin'}`, null, (player) => {
                    clans.request(clan2.id, player.id)
                    return uiManager.open(player, config.uinames.clans.root)
                })
            }
            form2.show(player)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.clans.viewMembers, 'a', (player) => {
    let clan = clans.getFromPlayerID(player.id)
    let form = new ActionForm();
    form.title(`${consts.tag}§rView Members`)
    form.button(`${consts.header}§cBack\n§7Go back to clan page`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.clans.root)
    })
    for (const plr of clan.data.members) {
        let playr = playerStorage.getPlayerByID(plr.id)
        if (plr.id === player.id) continue;
        form.button(`§r${playr.name}\n§r§7[View Member]`, '.azalea/8', (player) => {
            uiManager.open(player, config.uinames.clans.viewMember, plr)
        })
    }
    form.show(player)
})
uiManager.addUI(config.uinames.clans.viewMember, 'a', (player, plr) => {
    let clan = clans.getFromPlayerID(plr.id)
    if (!clan) return;
    let isOwner = false
    if (player.id === clan.data.ownerID) isOwner = true;
    let role = clan.data.members.find(_ => _.id == player.id).role
    if (!role) return;
    if (!clan) return;
    let playr = playerStorage.getPlayerByID(plr.id)
    let form = new ActionForm();
    form.title(`${consts.tag}${playr.name}`)
    form.button(`${consts.header}§cBack\n§7Back to view members page`, '.azalea/2', (player) => {
        uiManager.open(player, config.uinames.clans.viewMembers)
    })
    if (plr.role >= 3) {
        form.body('This player is the owner.')
    } else {
        form.body(`Name: ${playr.name}\n§rRole: ${plr.role}`)
        if (isOwner) {
            form.button(`§cTransfer Ownership\n§7Give this player FULL ownership of the clan`, `.azalea/10`, (player) => {
                function yes(player) {
                    clans.transferOwnership(player.id, plr.id)
                    uiManager.open(player, config.uinames.clans.root)
                }
                function no(player) {
                    uiManager.open(player, config.uinames.clans.viewMember, plr)
                }
                uiManager.open(player, config.uinames.basic.confirmation, 'Do you want to transfer ownership of this clan to ' + playr.name + '?', yes, no)
            })
        }
        if (role >= 2) {
            form.button(`§4Ban\n§7Ban this player from the clan`, `.azalea/5`, (player) => {
                clans.ban(plr.id)
                uiManager.open(player, config.uinames.clans.viewMembers)
            })
            form.button(`§cKick\n§7Kick this player from the clan`, '.azalea/5-oldmaybe', (player) => {
                clans.kick(plr.id)
                uiManager.open(player, config.uinames.clans.viewMembers)
            })
            form.button(`§eUpdate Role\n§7Change this members's role`, `.azalea/8-old`, (player) => {
                let form2 = new ModalFormData();
                form2.title(`Update Role`)
                form2.dropdown(`Role`, ['Member (1)', 'Admin (2)'])
                form2.show(player).then((res) => {
                    let [role] = res.formValues;
                    clans.updateRole(plr.id, role + 1)
                    uiManager.open(player, config.uinames.clans.viewMember, plr)
                })
            })
        }
    }
    form.show(player)
})

uiManager.addUI(config.uinames.clans.bank, 'clan bank yay!! (fern and isabella ui!)', (player) => {
    let clan = clans.getFromPlayerID(player.id)
    if (!clan) return;
    let role = clan.data.members.find(_ => _.id === player.id).role
    let form = new ActionForm();
    form.title(`${consts.tag}Bank`)
    form.button(`${consts.header}§cBack\n§7Go back to clan`, `.azalea/2`, (player) => {
        uiManager.open(player, config.uinames.clans.root)
    })
    let allowedToWithdraw = false;
    if (clan.data.bank.allowedToWithdraw.find(_ => _ === player.id)) allowedToWithdraw = true
    if (allowedToWithdraw) {
        form.button(`§cWithdraw Menu\n§7Withdraw from bank`, `.feather/bankwithdraw`, (player) => {
            let form2 = new ActionForm();
            form2.title(`${consts.tag}Withdraw Menu`)
            form2.button(`§cWithdraw`, `.feather/bankwithdraw`, (player) => {
                let form3 = new ModalFormData();
                form3.title(`Withdraw from Bank`)
                form3.textField(`Amount`, `Max: ${clan.data.bank.amount}`)
                form3.show(player).then((res) => {
                    let [amount] = res.formValues;
                    if (isNaN(+amount)) return player.error('Withdraw amount is not a number')
                    clans.withdrawFromBank(player.id, +amount);
                    uiManager.open(player, config.uinames.clans.bank)
                })
            })
            form2.button(`§dHistory`, `.azalea/ClickyClick`, (player) => {
                let form3 = new ActionForm();
                form3.title(`${consts.tag}Withdraw History`)
                form3.button(`${consts.header}§cBack\n§7Go back to withdraw ui`, `.azalea/2`, (player) => {
                    form2.show(player)
                })
                for (const withdrawal of clan.data.bank.withdrawHistory) {
                    let author = playerStorage.getPlayerByID(withdrawal.author)
                    form3.button(`§a${author.name}\n§7${withdrawal.name} | $${withdrawal.amount}`)
                }
                form3.show(player)
            })
            if (role > 2) {
                form2.button(`§6Allowed Withdrawers\n§7Add or remove allowed withdrawers`, `.azalea/8`, (player) => {
                    let form3 = new ActionForm();
                    form3.title(`${consts.tag}Allowed Withdraw`)
                    form3.button(`§aAdd\n§7Add an allowed withdrawer`, '.azalea/1', (player) => {
                        let form4 = new ActionForm();
                        form4.title(`${consts.tag}Add allowed withdrawer`)
                        for (const member of clan.data.members) {
                            let memb = playerStorage.getPlayerByID(member.id)
                            if (clan.data.bank.allowedToWithdraw.find(_ => _ === member.id)) continue;
                            form4.button(`${memb.name}\n§7[Add as withdrawer]`, `.azalea/8`, (player) => {
                                clans.addAllowedWithdrawer(clan.id, member.id)
                                uiManager.open(player, config.uinames.clans.bank)
                            })
                        }
                        form4.show(player)
                    })
                    for (const withdrawer of clan.data.bank.allowedToWithdraw) {
                        let memb = playerStorage.getPlayerByID(withdrawer)
                        if (withdrawer === clan.data.ownerID) continue;
                        form3.button(`${memb.name}\n§7[Remove as withdrawer]`, `.azalea/8`, (player) => {
                            clans.removeAllowedWithdrawer(clan.id, withdrawer)
                            uiManager.open(player, config.uinames.clans.bank)
                        })
                    }
                    form3.show(player)
                })
            }
            form2.show(player)
        })
    }

    form.button(`§aDeposit Menu\n§7Deposit into bank`, `.feather/bankdeposit`, (player) => {
        let form2 = new ActionForm();
        form2.title(consts.tag + 'Deposit Menu')
        form2.button(`${consts.header}§cBack\n§7Back to bank menu`, `.azalea/2`, (player) => {
            uiManager.open(player, config.uinames.clans.bank)
        })
        form2.button(`§aDeposit`, `.feather/bankdeposit`, async (player) => {
            let form3 = new ModalFormData();
            let scoreboard = await clans.settingsKV.get('currencyScoreboard')
            console.log(`${scoreboard}`)
            form3.title(`Deposit into Bank`)
            form3.textField(`Amount`, `Max: ${world.scoreboard.getObjective(scoreboard).getScore(player)}`)
            form3.show(player).then((res) => {
                let [amount] = res.formValues;
                if (isNaN(+amount)) return player.error('Deposit amount is not a number')
                clans.depositIntoBank(player.id, +amount);
                uiManager.open(player, config.uinames.clans.bank)
            })
        })
        form2.button(`§dHistory`, `.azalea/ClickyClick`, (player) => {
            let form3 = new ActionForm();
            form3.title(`${consts.tag}Deposit History`)
            form3.button(`${consts.header}§cBack\n§7Go back to deposit ui`, `.azalea/2`, (player) => {
                form2.show(player)
            })
            for (const withdrawal of clan.data.bank.depositHistory) {
                let author = playerStorage.getPlayerByID(withdrawal.author)
                form3.button(`§a${author.name}\n§7${withdrawal.name} | $${withdrawal.amount}`)
            }
            form3.show(player)
        })
        form2.show(player)
    })
    form.show(player)
})