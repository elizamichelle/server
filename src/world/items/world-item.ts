import { Position } from '@server/world/position';
import { Player } from '@server/world/actor/player/player';

export interface WorldItem {
    itemId: number;
    amount: number;
    position: Position;
    initiallyVisibleTo?: Player;
    expires?: number;
    removed?: boolean;
}
