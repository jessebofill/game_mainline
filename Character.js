class Character {
    constructor(user, x, y, spritePath) {
        let t = this;
        if (user !== "player1" && user !== "player2" && user !== "cpu") console.warn("not valid user type");

        this.x = x;
        this.y = y;
        this.spritePath = spritePath
        this.endTurnDelay = 500;

        //points
        this.hp = 100;
        this.ap = 100
        this.gp = 5
        this.maxgp = 5

        //stats
        this.atk = 4;
        this.hl = 10;
        this.def = 10;
        this.admg = 12;
        this.ahl = 20;

        //multipliers
        this.slMultiplier = 2.5
        this.lkMultiplier = 1.25

        //probabilities
        this.hitChance = 90;
        this.luck = 50; //33
        this.superLuck = 0;  //get calculated based on consecHitCount, 5 by default

        //state tracking
        this.consecHitCount = 0
        this.isArmorBrittle = false
        this.patchArmorCount = 0
        this.ppUpSelection = undefined
        this.armorHasBroken = false

        //other 
        this.patchArmorBrittleThreshold = 5

        this.pp = {
            attack: { cur: 10, max: 10 },
            heal: { cur: 5, max: 5 },
            armorPierce: { cur: 8, max: 8 }
        }

        this.gpCost = {
            regenPP: 2,
            renewArmor: 4,
            special: 5
        }

        this.user = user;

        this.heal = this.heal.bind(this);
        this.attack = this.attack.bind(this);


        this.sprite = loadImage(this.spritePath)

        this.initAnimations()
    }

    async initAnimations(){
        this.animations = {
            a_attack: new Animation(this, await  getPlayerKeyframes('attack', this)),
            a_heal: new Animation(this, await getPlayerKeyframes('heal', this)),
            a_patchArmor: new Animation(this, await getPlayerKeyframes('patchArmor', this)),
            a_armorPierce: new Animation(this, await getPlayerKeyframes('pierceArmor', this)),
            a_regenPP: new Animation(this, await getPlayerKeyframes('ppup', this)),
            a_renewArmor: new Animation(this, await getPlayerKeyframes('renewArmor', this)),
            a_special: new Animation(this, await getPlayerKeyframes('special', this)),
            b_regenPP: new Animation(this, await getPlayerKeyframes('ppup2', this)),
            b_hp: new Animation(this, frames.common.hp),
            b_armor: new Animation(this, frames.common.armor)
        };

        this.animations.b_hp.animatedProps.hp.range[0] = 0;
        this.animations.b_hp.animatedProps.hp.range[1] = 100;
        this.animations.b_armor.animatedProps.ap.range[0] = 0;
        this.animations.b_armor.animatedProps.ap.range[1] = 100;
    }

    animate() {
        for (let eachAni in this.animations) {
            this.animations[eachAni].animate()
        }
    }

    drawCharacter() {
        gameplayFrameBuffer.image(this.sprite, this.x, this.y, 150, 150)
    }

    heal(responsePopup) {
        this.pp['heal'].cur--
        this.animations.b_hp.asPercent(this.hl)

        return () => {
            if (this.hp == 100) {
                responsePopup('alreadyFullHp')
                return Promise.resolve()
            } else {
                responsePopup('heal')
                return this.animations.b_hp.play().then()
            }
        }
    }


    attack(responsePopup, enemy) {
        let hitOutcome = 'normalHit'
        let handleOutcome
        let defWeaknessMultiplier = Character.getDefenseWeaknessMultiplier(enemy.ap)

        this.pp['attack'].cur--

        this.superLuck = this.getSuperLuckMultiplier()

        //hit determination
        if (Character.probability(this.hitChance)) {

            let dmg = Math.round(this.atk * defWeaknessMultiplier);


            //if we get superlucky
            if (Character.probability(this.superLuck)) {
                dmg = Math.round(dmg * this.slMultiplier);
                hitOutcome = 'superLucky'

                //else if we get regular lucky
            } else if (Character.probability(this.luck)) {
                dmg = Math.round(dmg * this.lkMultiplier);
                hitOutcome = 'lucky';

                //else normal hit
            } else {

            }

            enemy.animations.b_hp.asPercent(-dmg);
            handleOutcome = () => {
                responsePopup(hitOutcome)
                if (hitOutcome === 'superLucky') enemy.ap -= 20
                return enemy.animations.b_hp.play().then(() => { if (hitOutcome === 'lucky') this.addGP(1) })
            }
        } else {
            hitOutcome = 'miss'
            handleOutcome = () => {
                enemy.addGP(1)
                responsePopup(hitOutcome)
                return Promise.resolve()
            }
        }
        this.consecHitCount = hitOutcome === 'normalHit' ? this.consecHitCount + 1 : 0
        return handleOutcome
    }

    //corresponding move animation will play first...
    patchArmor(responsePopup) {
        //...then return callback to do next steps...
        //...calculate and apply shield restore

        return () => {
            if (this.ap == 100) {
                responsePopup('alreadyFullAp')
                return Promise.resolve()
            } else {
                this.patchArmorCount++
                if (this.patchArmorCount >= this.patchArmorBrittleThreshold) {
                    this.isArmorBrittle = true
                    responsePopup('brittleArmor')
                } else responsePopup('patchArmor')
                console.log('-- > Character > ahl', this.ahl)

                this.animations.b_armor.asPercent(this.ahl)
                return this.animations.b_armor.play().then()
            }
        }
    }

    //attack shield
    armorPierce(responsePopup, enemy) {
        //...then return callback to do next steps...
        //...calculate and apply shield restore

        this.pp['armorPierce'].cur--

        return () => {
            if (enemy.ap == 0) {
                responsePopup('alreadyBroken')
                return Promise.resolve()
            } else {
                let admg = enemy.isArmorBrittle ? enemy.ap : Math.round(this.admg * random(0.9, 1.1))
                if (admg >= enemy.ap) { 
                    if (!this.armorHasBroken) {
                        this.armorHasBroken = true
                        this.addGP(2)
                    }
                    responsePopup('armorBreak')
                } else responsePopup('armorPierce')
                enemy.animations.b_armor.asPercent(-admg)
                return enemy.animations.b_armor.play().then()
            }
        }
    }

    regenPP(responsePopup) {
        let move = this.ppUpSelection
        return () => {
            this.pp[move].cur = this.pp[move].cur + 5 >= this.pp[move].max ? this.pp[move].max : this.pp[move].cur + 5
            this.gp -= this.gpCost.regenPP
            responsePopup('regenPP')
            return this.animations.b_regenPP.play().then()
        }
    }

    renewArmor(responsePopup) {
        return () => {
            this.gp -= this.gpCost.renewArmor
            this.isArmorBrittle = false
            this.patchArmorCount = 0
            this.armorHasBroken = false
            responsePopup('renewArmor')
            this.animations.b_armor.asPercent(100)
            return this.animations.b_armor.play().then()
        }
    }

    special(responsePopup, enemy) {
        return () => {
            this.gp -= this.gpCost.special
            responsePopup('special')
            enemy.animations.b_hp.asPercent(-30);
            return enemy.animations.b_hp.play().then()
        }
    }

    doMove(move, responsePopup, enemy) {
        if (move !== 'attack') this.consecHitCount = 0
        let characterAnimationPlay = this.animations['a_' + move]?.play ?? (() => Promise.resolve())
        let handleOutcome = this[move](responsePopup, enemy)
        characterAnimationPlay().then(handleOutcome).then(this.delayTurn).then(this.endTurn);
    }

    delayTurn = () => {
        let delay = this.endTurnDelay
        return new Promise((resolve) => {
            setTimeout(resolve, delay)
        })
    }

    endTurn() {
        //this function gets defined outside of class
    }

    addGP(gp) {
        let newGp = this.gp + gp
        this.gp = newGp >= this.maxgp ? this.maxgp : newGp
    }

    getSuperLuckMultiplier() {
        if (this.consecHitCount > 5) this.consecHitCount = 5
        const consecHit = [5, 5, 7, 15, 50, 90]
        return consecHit[this.consecHitCount]
    }

    static getAp(ap, dmg) {
        ap += dmg
        if (ap > 100) ap = 100
        if (ap < 0) ap = 0
        return ap
    }

    static getDefenseWeaknessMultiplier(defense) {
        // multiplier when defense value is [0, 1-25, 26-50, 51-75, 76-100]
        const level = [3, 2, 1.5, 1.25, 1]
        return level[Math.ceil(defense / 25)]
    }

    static probability(chance) {
        if (random(100) < chance) return true;
        else return false;
    }
}


