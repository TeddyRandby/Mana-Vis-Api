"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifyDeck = void 0;
function manifyDeck(deck) {
    return new Promise((resolve, reject) => {
        if (!deck)
            reject("Invalid deck");
        let cardTotals = {};
        for (let i = 0; i < 500; i++)
            simulateGame(deck, cardTotals, 5);
        const manaDeck = deck.map((c) => (Object.assign(Object.assign({}, c), { score: (cardTotals[c.name] / 5) || 0 })));
        resolve(manaDeck);
    });
}
exports.manifyDeck = manifyDeck;
function populateDeck(cards) {
    return cards.slice().reduce((acc, curr) => {
        for (let i = 0; i < curr.count; i++) {
            acc.push(curr);
        }
        return acc;
    }, []);
}
function sampleWithRemoval(arr, count) {
    if (count > 0) {
        let index = Math.floor(Math.random() * arr.length);
        let val = arr[index];
        arr.splice(index, 1);
        return [val, ...sampleWithRemoval(arr, count - 1)];
    }
    return [];
}
function simulateGame(deck, cardTotals, turnLimit) {
    for (let i = 1; i < turnLimit; i++) {
        let cards = simulateTurn(populateDeck(deck), i);
        cards.forEach((c) => {
            cardTotals[c.name] = (cardTotals[c.name] || 0) + (c.castable ? 1 : 0);
        });
    }
    return cardTotals;
}
function simulateTurn(deck, turn) {
    const cards = sampleWithRemoval(deck, 7 + turn);
    const lands = cards.filter(c => c.type_line.match(/(Land)/g));
    const prod = parseProduction(lands);
    const curves = cards.filter(c => c.cmc === turn);
    return curves.map(c => (Object.assign(Object.assign({}, c), { castable: castable(c, prod, lands.length) })));
}
function castable(card, prod, landCount) {
    let cost = {};
    ["W", "U", "B", "R", "G", "C"].forEach((pip) => {
        const matches = card.mana_cost.match(new RegExp(pip));
        cost[pip] = matches ? matches.length : 0;
    });
    let cardIsCastable = true;
    ["W", "U", "B", "R", "G", "C"].forEach((pip) => {
        if (prod[pip] < cost[pip] || landCount < card.cmc)
            cardIsCastable = false;
    });
    return cardIsCastable;
}
const exceptions = /(Prismatic Vista)|(Fabled Passage)|(Ancient Ziggurat)|(Cavern of Souls)|(Unclaimed Territory)|(City of Brass)|(Gemstone Mine)|(Mana Confluence)|(Gemstone Caverns)|(Wooded Foothills)|(Verdant Catacombs)|(Misty Rainforest)|(Windswept Heath)|(Flooded Strand)|(Polluted Delta)|(Scalding Tarn)|(Bloodstained Mire)|(Arid Mesa)|(Marsh Flats)/g;
function parseProduction(lands) {
    return lands.reduce((pips, land) => {
        if (land.name.match(exceptions))
            ["W", "U", "B", "R", "G", "C"].forEach((pip) => pips[pip] = (pips[pip] || 0) + 1);
        else
            land.color_identity.forEach((pip) => pips[pip] = (pips[pip] || 0) + 1);
        return pips;
    }, {});
}
