class Character {
    constructor(userType, x, y, spritePath) {
        let t = this;
        if (userType !== "player" && userType !== "cpu") console.warn("not valid user type");

        this.x = x;
        this.y = y;
        this.spritePath = spritePath
        this.endTurnDelay = 2000;

        //stats
        this.atk = 4;
        this.hl = 10;
        this.def = 10;
        this.admg = 10;
        this.ahl = 10;

        //multipliers
        this.slMultiplier = 2.5
        this.lkMultiplier = 1.25

        //probabilities
        this.hitChance = 90;
        this.luck = 33; //33
        this.superLuck = 0;  //get calculated based on consecHitCount, 5 by default

        //points
        this.gp = 5
        this.maxgp = 5
        this.hp = 100;
        this.ap = 0
        //this.pp = [{ cur: 1, max: 10 }, { cur: 10, max: 10 }, { cur: 10, max: 10 }, { cur: 10, max: 10 }]

        this.consecHitCount = 0

        this.pp = {
            attack: { cur: 1, max: 10 },
            heal: { cur: 10, max: 10 },
            patchArmor: { cur: 10, max: 10 },
            armorPierce: { cur: 10, max: 10 }
        }

        this.gpCost = {
            regenPP: 2,
            renewArmor: 4,
            special: 5
        }

        this.ppUpSelection = undefined

        this.user = userType;

        this.heal = this.heal.bind(this);
        this.attack = this.attack.bind(this);


        this.sprite = loadImage(this.spritePath)

        this.animations = {
            hp: new Animation(this, frames.common.hp),
            attack: new Animation(this, frames[userType].atk),
            refillArmor: new Animation(this, frames.common.refillArmor, 'abs')
        };

        this.animations.hp.animatedProps.hp.range[0] = 0;
        this.animations.hp.animatedProps.hp.range[1] = 100;

    }

    animate() {
        for (let eachAni in this.animations) {
            this.animations[eachAni].animate()
        }
    }

    drawCharacter() {
        gameGraphics.image(this.sprite, this.x, this.y, 150, 150)
    }

    heal(responsePopup) {
        this.pp['heal'].cur--
        this.animations.hp.asPercent(this.hl)

        return () => {
            responsePopup('heal')
            return this.animations.hp.play().then()
        }
    }


    attack(responsePopup, enemy) {
        let hitOutcome = 'normalHit'
        let handleOutcome
        let defWeaknessMultiplier = Character.getDefenseWeaknessMultiplier(enemy.ap)

        this.pp['attack'].cur--

        //this.superLuck = this.getSuperLuckMultiplier()

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


                //add code to increase gauge
                hitOutcome = 'lucky';

                //else normal hit
            } else {

            }

            enemy.animations.hp.asPercent(-dmg);
            handleOutcome = () => {
                responsePopup(hitOutcome)
                if (hitOutcome === 'superLucky') enemy.ap -= 20
                return enemy.animations.hp.play().then(() => { if (hitOutcome === 'lucky' && this.gp < this.maxgp) this.gp++ })
            }
        } else {
            this.consecHitCount = 0
            hitOutcome = 'miss'

            handleOutcome = () => {
                responsePopup(hitOutcome)
                return Promise.resolve()
            }
        }
        this.consecHitCount = hitOutcome === 'hit' ? this.consecHitCount + 1 : 0
        return handleOutcome
    }
    //corresponding move animation will play first...
    patchArmor(responsePopup) {
        //...then return callback to do next steps...
        //...calculate and apply shield restore

        this.pp['patchArmor'].cur--

        return () => {
            this.ap = Character.getAp(this.ap, this.ahl)

            responsePopup('patchArmor')
            return Promise.resolve()
        }
    }

    //attack shield
    armorPierce(responsePopup, enemy) {
        //...then return callback to do next steps...
        //...calculate and apply shield restore

        this.pp['armorPierce'].cur--

        return () => {
            enemy.ap = Character.getAp(enemy.ap, Math.round(-this.admg * random(0.7, 1.3)))
            responsePopup('armorPierce')
            return Promise.resolve()
        }
    }

    regenPP(responsePopup) {
        return () => {
            this.pp[this.ppUpSelection].cur += 5
            this.gp -= this.gpCost.regenPP

            responsePopup('regenPP')
            return Promise.resolve()
        }
    }

    renewArmor(responsePopup) {
        return () => {
            this.gp -= this.gpCost.renewArmor

            responsePopup('renewArmor')
            return this.animations.refillArmor.play().then()
        }

    }

    special(responsePopup, enemy) {

        this.gp -= this.gpCost.special

        return () => {
            responsePopup('special')
            enemy.animations.hp.asPercent(-30);
            return enemy.animations.hp.play().then()
        }


    }

    doMove(move, responsePopup, enemy) {
        if (move !== 'attack') this.consecHitCount = 0
        let characterAnimationPlay = this.animations[move]?.play ?? (() => Promise.resolve())
        let handleOutcome = this[move](responsePopup, enemy)
        characterAnimationPlay().then(handleOutcome).then(this.delayTurn).then(this.endTurn);
    }

    delayTurn = () => {
        let delay = this.endTurnDelay
        return new Promise((resolve) => {
            setTimeout(resolve, delay)
        })
    }

    doWithMoveResult(arg) {

    }

    endTurn() {

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


