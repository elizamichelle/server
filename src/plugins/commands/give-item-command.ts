import { ActionType, RunePlugin } from '@server/plugins/plugin';
import { commandAction } from '@server/world/actor/player/action/input-command-action';
import { cache } from '@server/game-server';

const action: commandAction = (details) => {
    const { player, args } = details;

    const inventorySlot = player.inventory.getFirstOpenSlot();

    if(inventorySlot === -1) {
        player.sendMessage(`You don't have enough free space to do that.`);
        return;
    }

    const itemId: number = args.itemId as number;
    let amount: number = args.amount as number;

    if(amount > 2000000000) {
        throw new Error(`Unable to give more than 2,000,000,000.`);
    }

    const itemDefinition = cache.itemDefinitions.get(itemId);
    if(!itemDefinition) {
        throw new Error(`Item ID ${itemId} not found!`);
    }

    let actualAmount = 0;
    if(itemDefinition.stackable) {
        const item = { itemId, amount };
        player.giveItem(item);
        actualAmount = amount;
    } else {
        if(amount > 28) {
            amount = 28;
        }

        for(let i = 0; i < amount; i++) {
            if(player.giveItem({ itemId, amount: 1 })) {
                actualAmount++;
            } else {
                break;
            }
        }
    }

    player.sendMessage(`Added ${actualAmount}x ${itemDefinition.name} to inventory.`);
};

export default new RunePlugin({
    type: ActionType.COMMAND,
    commands: [ 'give', 'item', 'spawn' ],
    args: [
        {
            name: 'itemId',
            type: 'number'
        },
        {
            name: 'amount',
            type: 'number',
            defaultValue: 1
        }
    ],
    action
});
