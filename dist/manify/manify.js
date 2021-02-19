"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifyDeck = void 0;
function manifyDeck(deck) {
    return new Promise((resolve, reject) => {
        if (!deck)
            reject("Invalid deck");
        const sources = calculateManaSources(deck);
        const costs = calculateManaCosts(deck);
        const manaDeck = deck.map((c) => (Object.assign(Object.assign({}, c), { score: 0 })));
        resolve({ sources, costs, manaDeck });
    });
}
exports.manifyDeck = manifyDeck;
function pullPips(text, mb) {
    // Scryfall format for mana costs
    //  Ex: {W} {U} {U} {4}
    const matches = text.match(/\{.\}/g);
    for (const match of matches) {
        // The pip is the middle char. Ex: { W }
        const pip = match.substr(1, 1);
        if ("WUBRGC".includes(pip)) {
            mb[pip] += 1;
        }
        else if (parseInt(pip)) {
            mb.generic += parseInt(pip);
        }
    }
}
function calculateManaCosts(deck) {
    let mb = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 };
    for (const card of deck) {
        const mana = calcManaCost(card);
        mb = accumulateWUBRGC(mb, mana);
    }
    return mb;
}
function calcManaCost(card) {
    if (card.type_line !== "Land") {
        let mb = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 };
        if (card.mana_cost)
            pullPips(card.mana_cost, mb);
        return mb;
    }
    else {
        return undefined;
    }
}
function accumulateWUBRGC(a, b) {
    return {
        W: a.W + b.W,
        U: a.U + b.U,
        B: a.B + b.B,
        R: a.R + b.R,
        G: a.G + b.G,
        C: a.C + b.C,
        generic: a.generic + b.generic,
    };
}
function calculateManaSources(deck) {
    let mb = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 };
    for (const card of deck) {
        if (card.type_line === "Land") {
            pullPips(card.oracle_text, mb);
        }
    }
    return mb;
}
