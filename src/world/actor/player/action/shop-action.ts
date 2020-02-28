import { world } from '@server/game-server';
import { Player } from '@server/world/actor/player/player';
import { logger } from '@runejs/logger/dist/logger';
import { Shop } from '@server/world/config/shops';
import { widgets } from '@server/world/config/widget';

function findShop(identification: string): Shop {
    for(let i = 0; i <= world.shops.length; i++) {
        if(world.shops[i].identification === identification) return world.shops[i];
    }
    return undefined;
}

export function openShop(player: Player, identification: string, closeOnWalk: boolean = true): void {
    try {
        const openedShop = findShop(identification);
        if(openedShop === undefined) {
            throw `Unable to find the shop with identification of: ${identification}`;
        }
        // player.packetSender.updateWidgetString(widgetIds.shop.shopTitle, openedShop.name);
        for(let i = 0; i < 30; i++) {
            if(openedShop.items.length <= i) {
                player.outgoingPackets.sendUpdateSingleWidgetItem(widgets.shop.shopInventory, i, null);
            } else {
                player.outgoingPackets.sendUpdateSingleWidgetItem(widgets.shop.shopInventory, i, {
                    itemId: openedShop.items[i].id, amount: openedShop.items[i].amountInStock
                });
            }
        }
        for(let i = 0; i < openedShop.items.length; i++) {
            player.outgoingPackets.sendUpdateSingleWidgetItem(widgets.shop.shopInventory, i, {
                itemId: openedShop.items[i].id, amount: openedShop.items[i].amountInStock
            });
        }

        player.outgoingPackets.sendUpdateAllWidgetItems(widgets.shop.playerInventory, player.inventory);

        player.activeWidget = {
            widgetId: widgets.shop.shopScreen,
            secondaryWidgetId: widgets.shop.playerTab,
            type: 'SCREEN_AND_TAB',
            closeOnWalk: closeOnWalk
        };
      
        player.outgoingPackets.sendUpdateAllWidgetItems(widgets.inventory, player.inventory);
        player.outgoingPackets.showScreenAndTabWidgets(widgets.shop.shopScreen, widgets.shop.playerTab);
        for(let i = 0; i < player.inventory.items.length; i++) {
            if(player.inventory.items[i] !== null) {
                player.outgoingPackets.sendUpdateSingleWidgetItem(widgets.shop.playerInventory, i, {
                    itemId: player.inventory.items[i].itemId, amount: player.inventory.items[i].amount
                });
            } else {
                player.outgoingPackets.sendUpdateSingleWidgetItem(widgets.shop.playerInventory, i, null);
            }
        }

    } catch (error) {
        logger.error(`Error opening shop ${identification}: ` + error);
    }

}
