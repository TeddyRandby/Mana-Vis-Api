"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifyDeck = void 0;
function manifyDeck(deck) {
    return new Promise((resolve, reject) => {
        const turns = 6;
        const games = turns * 1000;
        if (!deck)
            reject("Invalid deck");
        let cardTotals = {};
        let curveTotals = {};
        let cardAppearences = {};
        for (let i = 0; i < games; i++)
            simulateGame(deck, cardTotals, cardAppearences, curveTotals, turns);
        const manaDeck = deck.map((c) => (Object.assign(Object.assign({}, c), { score: (cardTotals[c.name] / cardAppearences[c.name]) || 0, appearences: (cardAppearences[c.name] / games), onCurve: (curveTotals[c.name] / cardTotals[c.name] || 0) })));
        resolve(manaDeck);
    });
}
exports.manifyDeck = manifyDeck;
function simulateGame(deck, cardTotals, cardAppearences, curveTotals, turnLimit) {
    // Populate deck based on card counts
    let simDeck = populateDeck(deck);
    // Draw a 7 card opener
    let opener = sampleWithRemoval(simDeck, 7);
    // Take turns, starting with turn 0
    for (let i = 0; i < turnLimit; i++) {
        // Draw a card for the next turn.
        opener.push(sampleWithRemoval(simDeck, 1)[0]);
        // Simulate the turn (parsing production of lands, calculating castable cards)
        let cards = simulateTurn(opener, i);
        cards.forEach((c, i) => {
            // If the card was cast, remove it and add it to appearences
            if (c.castable && !c.type_line.match(/(Land)/g)) {
                cardTotals[c.name] = (cardTotals[c.name] || 0) + 1;
                curveTotals[c.name] = (curveTotals[c.name] || 0) + (c.onCurve ? 1 : 0);
                cardAppearences[c.name] = (cardAppearences[c.name] || 0) + 1;
                opener.splice(i, 1);
            }
        });
    }
    // Count each card in the hand over all the turns that wasn't cast
    opener.forEach(c => cardAppearences[c.name] = (cardAppearences[c.name] || 0) + 1);
    return cardTotals;
}
function simulateTurn(hand, turn) {
    const lands = hand.filter(c => c.type_line.match(/(Land)/g));
    const prod = parseProduction(lands);
    return hand.map(c => (Object.assign(Object.assign({}, c), { castable: castable(c, prod, lands.length), onCurve: turn === c.cmc })));
}
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
function castable(card, prod, landCount) {
    if (!card.mana_cost)
        return true;
    let cost = {};
    ["W", "U", "B", "R", "G", "C"].forEach((pip) => {
        const matches = card.mana_cost.match(pip);
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
