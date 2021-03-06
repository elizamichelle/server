import { npcAction } from '@server/world/actor/player/action/npc-action';
import { openShop } from '@server/world/actor/player/action/shop-action';
import { ActionType, RunePlugin } from '@server/plugins/plugin';
import { npcIds } from '@server/world/config/npc-ids';

const tradeAction : npcAction = (details) => {
    openShop(details.player, 'RANAELS_SUPER_SKIRT_STORE');
};

export default new RunePlugin({
    type: ActionType.NPC_ACTION,
    npcIds: npcIds.ranael,
    walkTo: true,
    options: 'trade',
    action: tradeAction,
});