import './config/index'
import './ranks/index'
import './basic/basicConfirmation'
import './uiBuilder/index'
import './economy_editor/index'
import './homes/index'
import './Moderation/index'
import './sidebarEditor/index'
import './clans'
import './events'
import './invSee'
import './platformSettings'
import './pay'
import './voting/index'
import './bounty'
// import './shop'
import './playermanagement'
import './warpmanagement'
import './codes'
import './repeatedBroadcasts'
import './leaderboards'
import './permissions'
import '../Modules/rtp'
import './playerShop'
import './mcbetools_auth'
import uiManager from '../Libraries/uiManager'
import { ModalFormData } from '@minecraft/server-ui'
import { ChestFormData } from '../Libraries/ChestUI/chestUI'
import common from '../Libraries/ChestUI/common'

uiManager.addUI('chestui_tester', 'testchest', (player) => {
    let form = new ModalFormData();
    form.title('Rows')
    form.slider('Rows', 1, 6)
    form.show(player).then((res) => {
        let[rows] = res.formValues;
        let chest = new ChestFormData((9 * rows).toString());
        chest.title('tested')
        for(let i =0;i<9 * rows;i++) {
            chest.button(i,'button',[],'textures/blocks/tinted_glass',1,false,() => {
                player.sendMessage(common.slotIdToRowCol(i).toString())
            })
        }
        chest.show(player)
    })
})