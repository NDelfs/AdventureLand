'use strict';
//beach
//right part with hawks / spiders / scorpions
//place with crocs / armadillos
//Spooky Forest - where pom poms
//Cave of Darkness(in Travel menu option)


let mode = "attack";//attack need to be defaul in case of crash
let specialTarget = "";

map_key("6", "snippet", "if(mode==='attack'){mode='';change_target({});}else{mode='attack';change_target({});}");
let attackFunction: Function;

let sellList = ["stinger"]
let compoundList = ["hpamulet", "hpbelt", "ringsj", "wbook0"];
if (typeof (attackFunction) == 'undefined') {
    if (character.ctype == "warrior")
        attackFunction = attackScript;
    else if (character.ctype == "mage"){
        attackFunction = attackScript;
    }
    else if (character.ctype == "priest") {

    }
}
setInterval(() => {

    if (character.rip)
        return;
    use_hp_or_mp__();
    if (is_moving(character))
        return;
    if (character.esize === 1 && mode === "attack") {
        mode = "";
        smart_move({ to: "upgrade" });
    }
    if(mode == "attack")
        attackFunction();

}, 1000 / 4); // Loops every 1/4 seconds.

//start_character("CHARACTERNAME"); // to run the character from within your Code automatically

//send_cm("CHARACTERNAME", { a: 1, b: 2, c: "something" }); // to send messages, objects to your character

character.on("cm", function (m: cmMessage) {
    if (m.name == "PishiBozorg") // Make sure the message is from a trusted character
        game_log(m.message);  // Do something with the message!
})

function setTarget(name: string) {
    switch (name.toLocaleLowerCase()) {
        case "tiny crab": specialTarget = "Tiny Crab"; break;
        case "bee": specialTarget = "Bee"; break;
        case "bat": specialTarget = "Bat"; break;
        default: specialTarget = ""; game_log("could not find " + name);
    }  
}

function dist2Char(xPos:number, yPos:number) {
    const xDist = Math.abs(character.x - xPos);
    const yDist = Math.abs(character.y - yPos);
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

function emptyInventory() {
    for (let itemN of sellList) {
        let list = findAllByLevel(itemN);
        for (let index of list[0]) {
            sell(index);
        }
    }
}

function shop(item:string, shopType:string, finalQ:number) {
    return new Promise(function (resolve, reject) {
        if (quantity(item) >= finalQ)
            resolve({ status: "bought" });
        else {
            buy(item, finalQ - quantity(item)).then(data => {
                resolve(data);
            },
                data => {
                    if (data.reason == "distance")
                        smart_move({ to: shopType }).then(
                            data => { shop(item, shopType, finalQ).then(data => resolve(data)); },
                            data => { reject(data) },
                        );
                    else {
                        game_log("Can't buy " + item + data.reason);
                        reject(data);
                    }
                }
            );
        }
    });
}

function shouldUpgrade() {
    //game_log(character.slots["mainhand"])
    //equip(locate_item("blade"), "mainhand")
    let slot = "mainhand";
    let current = character.slots.mainhand;
    if (current.level > character.slots.offhand.level) {
        current = character.slots.offhand;
        slot = "offhand";
    }

    let mult = (character.gold - 10000) / 1000;
    if (mult > current.level && current.level < 7) {
        autoUpgrade(current.name, current.level + 1).then(data => {
            equip(locate_item("blade"), slot);
            game_log("equiped blade in " + slot);
        }, data => { });
    }
}

function autoUpgrade(item: string, targetLevel: number): Promise<upgradeInfo> {
    return new Promise((resolve, reject) => {
        if (character.q.upgrade) {
            game_log("Already upgrading something!")
            reject({ reason: "Already upgrading something!" });
        };
        const objP = locate_item(item);
        let objLevel = 0;
        if (objP >= 0) {
            objLevel = character.items[objP].level
        }
        if (objLevel < targetLevel) {
            return shop("scroll0", "scrolls", 1)
                .then(data => {
                    return shop(item, "scrolls", 1);
                })
                .then(data => {
                    return upgrade(locate_item(item), locate_item("scroll0"))
                        .then(data => {
                            if (data.success) {
                                game_log("I have a +" + data.level + " " + item + " now!");
                                if (data.level < targetLevel)
                                    return autoUpgrade(item, targetLevel);
                                else
                                    resolve(data);
                            }
                            else {
                                return autoUpgrade(item, targetLevel);
                                //reject({ reason: "Rip " + item + ", you'll be missed." });
                            }
                        }, data => {
                            reject(data);
                        });
                });
        }
        else {
            reject({ reason: "target level already reached" })
        }
    });
}

function findAllByLevel(name:string): number[][] {
    let items: number[][]=[[],[],[],[],[]];

    for (var i = 0; i < character.items.length; i++) {
        if (character.items[i] && character.items[i].name == name)
            items[character.items[i].level].push(i);
    }
    return items;
}

async function autoCompoundAll() {
    for (let i = 0; i < compoundList.length; i++) {
        game_log(compoundList[i]);
        await autoCompound2(findAllByLevel(compoundList[i]));
    }
}
//autoCompound(findAllByLevel("ringsj"))
function autoCompound(allItems: number[][]): Promise<upgradeInfo> {
    let prom: Promise<upgradeInfo>;
    let inte = 0;//this gets wrong when multiple same level
    for (const items of allItems) {
        for (let i = 1; i <= items.length / 3; i++) {
            if (prom) {
                prom = prom.then(d =>
                    shop("cscroll0", "scrolls", 1).then(data =>
                        compound(allItems[inte].pop(), allItems[inte].pop(), allItems[inte++].pop(), locate_item("cscroll0"))
                ));
            }
            else {
                prom = shop("cscroll0", "scrolls", 1).then(data => 
                    compound(allItems[inte].pop(), allItems[inte].pop(), allItems[inte++].pop(), locate_item("cscroll0"))
                )
            }
        }
    }
    if (prom)
        return prom;
    else
        return new Promise((resolve, reject) => resolve({ success: false, level: 0 }));
}

async function autoCompound2(allItems: number[][]): Promise<any> {
    for (const items of allItems) {
        for (let i = 1; i <= items.length / 3; i++) {
            game_log(items);
            await shop("cscroll0", "scrolls", 1).then(data =>
                compound(items.pop(), items.pop(), items.pop(), locate_item("cscroll0"))
            )
        }
    }
}



function attackScript() {
    loot();

    var target = get_targeted_monster();
    if (!target) {
        if (quantity("hpot0") < 40 || quantity("mpot0") < 40) {
            shop("hpot0", "potions", 400).then(data => shop("mpot0", "potions", 400))
            return;
        }
        let data = { name: specialTarget, min_xp: 100};

        target = get_nearest_monster__(data);
        if (target) change_target(target);
        else {
            game_log("No Monsters");
            return;
        }
    }

    if (!is_in_range(target)) {
        move(
            character.x + (target.x - character.x) / 2,
            character.y + (target.y - character.y) / 2
        );
        // Walk half the distance
    }
    else if (can_attack(target)) {
        game_log("Attacking");
        attack(target);
    }
}

function use_hp_or_mp__() {
    if (mssince(last_potion) < Math.min(200, character.ping * 3)) return;
    var used = true;
    if (is_on_cooldown("use_hp")) return;
    if (character.mp / character.max_mp < 0.2) {
        buy("mpot0", 1);
        use_skill('use_mp');
        game_log("used mana potion");
    }
    else if (character.hp / character.max_hp > 0.5 && character.max_hp - character.hp > 100) {
        use_skill('regen_hp');
        game_log("free heal");
    }
    else if (character.hp / character.max_hp < 0.5) {
        use_skill('use_hp');
        game_log("used health potion");
    }
    else if (character.mp / character.max_mp > 0.7 && character.max_mp - character.mp >= 100) {
        use_skill('regen_mp');
        game_log("free mp");
    }
    else if (character.mp / character.max_mp < 0.7 && character.max_mp - character.mp >= 300) {
        use_skill('use_mp');
        game_log("used mana potion");
    }
    else used = false;
    if (used) last_potion = new Date();
}

interface nearestMonsterArgs {
    name: string;
    target?: string;
    min_xp?: number;
    max_att?: number;
    no_target?: boolean;
}

function get_nearest_monster__(args: nearestMonsterArgs): entities|null {
    if (args.name == "Tiny Crab") {
        const xPos:number = -1147;
        const yPos:number = -52;
        if (dist2Char(xPos, yPos) > 400)
            smart_move({ x: xPos, y: yPos, map: "main" });
    }
    if (args.name == "Bat") {
        const xPos = 354;
        const yPos = -985;
        if (dist2Char(xPos, yPos) > 400)
            smart_move({ x: xPos, y: yPos, map: "cave" });
    }
    if (args.name == "Bee") {
        const xPos = 532;
        const yPos = 1118;
        if (dist2Char(xPos, yPos) > 400)
            smart_move({ x: xPos, y: yPos, map: "main" });
    }
    //args:
    // max_att - max attack
    // min_xp - min XP
    // target: Only return monsters that target this "name" or player object
    // no_target: Only pick monsters that don't have any target
    // path_check: Checks if the character can move to the target
    // type: Type of the monsters, for example "goo", can be referenced from `show_json(G.monsters)` [08/02/17]
    var min_d = 999999, target = null;

    for (let id in parent.entities) {
        var current: entities = parent.entities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.name != "" && current.name != args.name) continue;
        if (args.min_xp && current.xp < args.min_xp) continue;
        if (args.max_att && current.attack > args.max_att) continue;
        if (args.target && current.target != args.target) continue;
        if (args.no_target && current.target && current.target != character.name) continue;
        //if (args.path_check && !can_move_to(current)) continue;
        var c_dist = parent.distance(character, current);
        if (c_dist < min_d) min_d = c_dist, target = current;
    }
    return target;
}