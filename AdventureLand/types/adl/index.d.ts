
declare interface slotInfo {
    name: string;
    level: number;
}

declare interface itemI{
    name: string;
    level: number;
    stat_type: string;
}

declare interface cmMessage {
    name: string;
    message: string;
}

declare interface characterI {
    name: string;
    ctype: string;
    rip: boolean;
    x: number;
    y: number;
    gold: number;
    hp: number;
    mp: number;
    max_hp: number;
    max_mp: number;
    range: number;
    xrange: number;
    targets: number;
    map:string
    slots: { [name: string]: slotInfo };
    items: itemI[];
    ping: number;
    esize: number;
    q: any;
    on: Function;
}

declare interface destinationI {   
    x: number;
    y: number;
    map: string;
}

declare interface destinationI2 {
    to: string;
}

declare var character: characterI;
declare var parent: any;

declare function is_moving(character: characterI): boolean;

declare function move(x:number, y:number):void;

declare function quantity(name: string): number

declare function locate_item(name: string): number

declare function equip(itemIndex: number, slotName: string): void

declare interface buyInfo {

}

declare function sell(index: number):void;
declare function buy(name: string, amount: number): Promise<buyInfo>

declare function game_log(log: any): void

declare interface smart_moveInfo {

}

declare function smart_move(destination: destinationI | destinationI2): Promise<smart_moveInfo>

declare interface upgradeInfo {
    success: boolean;
    level: number;
}

declare function upgrade(itemIndex: number, scrollIndex: number): Promise<upgradeInfo>;

declare function compound(itemIndex1: number, itemIndex2: number, itemIndex3: number, scrollIndex: number): Promise<upgradeInfo>;

declare function loot(): void;

declare interface entities {
    name: string;
    type: string;
    mtype: string;
    xp: number;
    attack: number;
    x: number;
    y: number;
    visible: boolean;
    dead: boolean;
    target: string;
}

declare function get_targeted_monster(): entities;
declare function change_target(target: entities): void;
declare function is_in_range(target: entities): boolean;
declare function can_attack(target: entities): boolean;
declare function attack(target: entities): void;

declare function can_move_to(target: entities): boolean

declare function is_on_cooldown(skillName: string): boolean
declare function use_skill(skillName: string): void

declare function map_key(button: string, skillName: string, command: string): void

////////hiden
declare function mssince(date: Date): number;
declare let last_potion: Date