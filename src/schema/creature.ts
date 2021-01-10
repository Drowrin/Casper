


export interface statblock {
    str: number;
    con: number;
    dex: number;
    int: number;
    wis: number;
    cha: number;
}


export interface CreatureData {

    /**
    *List armor class of creature here
    */
    armorclass: number;

    /**
    *List hitpoints here in the format: 69 | 10d8 **todo - input dice roller at some point
    */
    hitpoints: number | string;

    /**
    *Creature speed should be here in the format Fly | 30 or Swim | 60
    */
    speed: string | number;

    /**
    *Size should be a string anywhere from size Tiny to Colossal
    */
    size: string;

    /**
    *Input assigned stats int he below format for a statblock.
    */
    statblock: statblock;

    /**
    *All additional saving throw bonuses (if any) should be here.
    */
    savthrow?: string;

    /**
    *List any damage immunities here
    */
    dmgimm?: string;

    /**
    *List any damage resistances here
    */
    dmgres?: string;

    /**
    *List any condition immunities here
    */
    condimm?: string;

    /**
    *List any bonuses to skills here
    */
    skills?: string;

    /**
    *Senses should be listed here in this format: Darkvision | 60, Blindsight | 120.
    */
    senses?: string | number;

    /**
    *Any known languages should be listed here.
    */
    languages?: string;

    /**
    *Challenge rating should be listed here as a single number.
    */
    cr: number;

    /**
    *Any unique traits such as Undead Resistance should be listed here.
    */
    uniquetraits?: string;

    /**
    *Any actions that can be taken that are - movement, bonus action, reaction, action - should be listed here.
    */
    actions: string;

    /**
    *All spells, spells per day, and level of spell should be listed here.
    */
    spells?: string;

    /**
    *Any legendary actions should be listed here, as well as # per turn.
    */
    legendaryactions?: string;

    /**
    *Any legendary saves should be listed here.
    */
    legendarysaves?: string;

    /**
    *Any lair actions should be listed here, as well as passive environmental effects around the lair.
    */
    lairactions?: string;
}

export class Creature {
    armorclass: number;
    hitpoints: number | string;
    speed: string | number;
    size: string;
    statblock: statblock;
    savthrow?: string;
    dmgimm?: string;
    dmgres?: string;
    condimm?: string;
    skills?: string;
    senses?: string | number;
    languages?: string;
    cr: number;
    uniquetraits?: string;
    actions: string;
    spells?: string;
    legendaryactions?: string;
    legendarysaves?: string;
    lairactions?: string;

    constructor(data: CreatureData) {
        this.armorclass = data.armorclass;
        this.hitpoints = data.hitpoints;
        this.speed = data.speed;
        this.size = data.size;
        this.statblock = data.statblock;
        this.savthrow = data.savthrow;
        this.dmgimm = data.dmgimm;
        this.dmgres = data.dmgres;
        this.condimm = data.condimm;
        this.skills = data.skills;
        this.senses = data.senses;
        this.languages = data.languages;
        this.cr = data.cr;
        this.uniquetraits = data.uniquetraits;
        this.actions = data.actions;
        this.spells = data.spells;
        this.legendaryactions = data.legendaryactions;
        this.legendarysaves = data.legendarysaves;
        this.lairactions = data.lairactions;
    }
}