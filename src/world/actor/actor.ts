import { WalkingQueue } from './walking-queue';
import { ItemContainer } from '../items/item-container';
import { Animation, Graphic, UpdateFlags } from './update-flags';
import { Npc } from './npc/npc';
import { Entity } from '../entity';
import { Skills } from '@server/world/actor/skills';
import { Item } from '@server/world/items/item';
import { Position } from '@server/world/position';
import { DirectionData, directionData, directionFromIndex } from '@server/world/direction';

/**
 * Handles an actor within the game world.
 */
export abstract class Actor extends Entity {

    private _worldIndex: number;
    public readonly updateFlags: UpdateFlags;
    private readonly _walkingQueue: WalkingQueue;
    private _walkDirection: number;
    private _runDirection: number;
    private _faceDirection: number;
    private readonly _inventory: ItemContainer;
    public readonly skills: Skills;
    private _busy: boolean;
    public readonly metadata: { [key: string]: any } = {};

    protected constructor() {
        super();
        this.updateFlags = new UpdateFlags();
        this._walkingQueue = new WalkingQueue(this);
        this._walkDirection = -1;
        this._runDirection = -1;
        this._faceDirection = 6;
        this._inventory = new ItemContainer(28);
        this.skills = new Skills(this);
        this._busy = false;
    }

    public face(face: Position | Actor, clearWalkingQueue: boolean = true, autoClear: boolean = true): void {
        if(face instanceof Position) {
            this.updateFlags.facePosition = face;
        } else if(face instanceof Actor) {
            this.updateFlags.faceActor = face;
            this.metadata['faceActor'] = face;

            if(autoClear) {
                setTimeout(() => {
                    this.clearFaceActor();
                }, 20000);
            }
        }

        if(clearWalkingQueue) {
            this.walkingQueue.clear();
            this.walkingQueue.valid = false;
        }
    }

    public clearFaceActor(): void {
        if(this.metadata['faceActor']) {
            this.updateFlags.faceActor = null;
            this.metadata['faceActor'] = undefined;
        }
    }

    public playAnimation(animation: number | Animation): void {
        if(typeof animation === 'number') {
            animation = {id: animation, delay: 0};
        }

        this.updateFlags.animation = animation;
    }

    public playGraphics(graphics: number | Graphic): void {
        if(typeof graphics === 'number') {
            graphics = {id: graphics, delay: 0, height: 120};
        }

        this.updateFlags.graphics = graphics;
    }

    public removeItem(slot: number): void {
        this._inventory.remove(slot);
    }

    public giveItem(item: number | Item): boolean {
        return this._inventory.add(item) !== null;
    }

    public hasItemInInventory(item: number | Item): boolean {
        return this._inventory.has(item);
    }

    public hasItemOnPerson(item: number | Item): boolean {
        return this.hasItemInInventory(item);
    }

    public canMove(): boolean {
        return !this.busy;
    }

    public initiateRandomMovement(): void {
        setInterval(() => {
            if(!this.canMove()) {
                return;
            }

            const movementChance = Math.floor(Math.random() * 10);

            if(movementChance < 7) {
                return;
            }

            let px: number;
            let py: number;
            let movementAllowed = false;

            while(!movementAllowed) {
                px = this.position.x;
                py = this.position.y;

                const moveXChance = Math.floor(Math.random() * 10);

                if(moveXChance > 6) {
                    const moveXAmount = Math.floor(Math.random() * 5);
                    const moveXMod = Math.floor(Math.random() * 2);

                    if(moveXMod === 0) {
                        px -= moveXAmount;
                    } else {
                        px += moveXAmount;
                    }
                }

                const moveYChance = Math.floor(Math.random() * 10);

                if(moveYChance > 6) {
                    const moveYAmount = Math.floor(Math.random() * 5);
                    const moveYMod = Math.floor(Math.random() * 2);

                    if(moveYMod === 0) {
                        py -= moveYAmount;
                    } else {
                        py += moveYAmount;
                    }
                }

                let valid = true;

                if(this instanceof Npc) {
                    if(px > this.initialPosition.x + this.movementRadius || px < this.initialPosition.x - this.movementRadius
                        || py > this.initialPosition.y + this.movementRadius || py < this.initialPosition.y - this.movementRadius) {
                        valid = false;
                    }
                }

                movementAllowed = valid;
            }

            if(px !== this.position.x || py !== this.position.y) {
                this.walkingQueue.clear();
                this.walkingQueue.valid = true;
                this.walkingQueue.add(px, py);
            }
        }, 1000);
    }

    public forceMovement(direction: number, steps: number): void {
        if(!this.canMove()) {
            return;
        }

        let px: number;
        let py: number;
        let movementAllowed = false;

        while(!movementAllowed) {
            px = this.position.x;
            py = this.position.y;

            const movementDirection: DirectionData = directionFromIndex(direction);
            if(!movementDirection) {
                return;
            }
            let valid = true;
            for(let step = 0; step < steps; step++) {
                px += movementDirection.deltaX;
                py += movementDirection.deltaY;

                if(this instanceof Npc) {
                    if(px > this.initialPosition.x + this.movementRadius || px < this.initialPosition.x - this.movementRadius
                        || py > this.initialPosition.y + this.movementRadius || py < this.initialPosition.y - this.movementRadius) {
                        valid = false;
                    }
                }

            }

            movementAllowed = valid;


        }

        if(px !== this.position.x || py !== this.position.y) {
            this.walkingQueue.clear();
            this.walkingQueue.valid = true;
            this.walkingQueue.add(px, py);
        }
    }

    public abstract equals(actor: Actor): boolean;

    public get worldIndex(): number {
        return this._worldIndex;
    }

    public set worldIndex(value: number) {
        this._worldIndex = value;
    }

    public get walkingQueue(): WalkingQueue {
        return this._walkingQueue;
    }

    public get walkDirection(): number {
        return this._walkDirection;
    }

    public set walkDirection(value: number) {
        this._walkDirection = value;
    }

    public get runDirection(): number {
        return this._runDirection;
    }

    public set runDirection(value: number) {
        this._runDirection = value;
    }

    public get faceDirection(): number {
        return this._faceDirection;
    }

    public set faceDirection(value: number) {
        this._faceDirection = value;
    }

    public get inventory(): ItemContainer {
        return this._inventory;
    }

    public get busy(): boolean {
        return this._busy;
    }

    public set busy(value: boolean) {
        this._busy = value;
    }
}
