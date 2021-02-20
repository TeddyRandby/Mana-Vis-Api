import { ScryfallCard, ManaCard, WUBRGC } from "../schema/Schema";


export function manifyDeck(deck: ScryfallCard[]): Promise<ManaCard[]> {
  return new Promise((resolve, reject) => {

    const turns = 6;
    const games = turns * 100;

    if (!deck) reject("Invalid deck");

    let cardTotals = {};
    let curveTotals = {};
    let cardAppearences = {};
    for (let i = 0; i < games; i++)
      simulateGame(deck, cardTotals, cardAppearences, curveTotals, turns)

    const manaDeck: ManaCard[] = deck.map((c) => ({ ...c, score: (cardTotals[c.name] / cardAppearences[c.name]) || 0 , appearences: games / (cardAppearences[c.name]), onCurve: (curveTotals[c.name] / cardTotals[c.name] || 0 )}));

    resolve(manaDeck);
  });
}

function simulateGame(deck: ScryfallCard[], cardTotals: any,cardAppearences: any, curveTotals: any, turnLimit: number) {
  // Populate deck based on card counts
  let simDeck = populateDeck(deck);
  // Draw a 7 card opener
  let opener = sampleWithRemoval(simDeck, 7)
  // Take turns, starting with turn 0
  for (let i = 1; i < turnLimit + 1; i++){
    // Draw a card for the next turn.
    opener.push(sampleWithRemoval(simDeck, 1)[0])
    // Simulate the turn (parsing production of lands, calculating castable cards)
    let cards = simulateTurn(opener, i)
    cards.forEach((c)=>{
      // If the card was cast, remove it and add it to appearences
      if (c.castable && !c.type_line.includes("Land")){
        cardTotals[c.name] = (cardTotals[c.name] || 0) + 1 
        curveTotals[c.name] = (curveTotals[c.name] || 0) + (c.onCurve ? 1 : 0)
        cardAppearences[c.name] = (cardAppearences[c.name] || 0) + 1
        opener.splice(opener.findIndex((s)=>s.name === c.name), 1)
      }

    })
  }

  // Count each card in the hand over all the turns that wasn't cast
  opener.forEach(c=>cardAppearences[c.name] = (cardAppearences[c.name] || 0) + 1)

  return cardTotals;
}

function simulateTurn(hand: ScryfallCard[], turn: number) {
  const lands = hand.filter(c=>c.type_line.match(/(Land)/g))
  const prod = parseProduction(lands)
  return hand.map(c=>({...c, castable: castable(c, prod, lands.length, turn), onCurve: turn === c.cmc}))
}


function populateDeck(cards: ScryfallCard[]) {
  return cards.slice().reduce((acc, curr) =>{
    for (let i = 0; i < curr.count; i++) {
      acc.push(curr)
    }
    return acc;
  }, [])
}


function sampleWithRemoval(arr: any[], count: number): ScryfallCard[]{
  if (count > 0) {
    let index = Math.floor(Math.random()*arr.length)
    let val = arr[index]
    arr.splice(index, 1)
    return [val, ...sampleWithRemoval(arr, count-1)]
  } 
  return []
}


function castable(card: ScryfallCard, prod: WUBRGC, landCount: number, turn: number) {
  if (!card.mana_cost)
    return true;

  let cost = {};
  ["W", "U", "B", "R", "G", "C"].forEach((pip) => {
    const matches = card.mana_cost.match(pip) 
    cost[pip] = matches ? matches.length : 0
  })

  let cardIsCastable = true;
  ["W", "U", "B", "R", "G", "C"].forEach((pip)=> {
    if (prod[pip] <  cost[pip] || landCount < card.cmc || turn < card.cmc)
      cardIsCastable = false
  })
  return cardIsCastable
}


const exceptions = /(Prismatic Vista)|(Fabled Passage)|(Ancient Ziggurat)|(Cavern of Souls)|(Unclaimed Territory)|(City of Brass)|(Gemstone Mine)|(Mana Confluence)|(Gemstone Caverns)|(Wooded Foothills)|(Verdant Catacombs)|(Misty Rainforest)|(Windswept Heath)|(Flooded Strand)|(Polluted Delta)|(Scalding Tarn)|(Bloodstained Mire)|(Arid Mesa)|(Marsh Flats)/g
function parseProduction(lands: ScryfallCard[]): WUBRGC {
  return lands.reduce((pips: any, land: any) => {
    if (land.name.match(exceptions))
      ["W", "U", "B", "R", "G", "C"].forEach((pip: string) => pips[pip] = (pips[pip] || 0) + 1)
    else
      land.color_identity.forEach((pip: string) => pips[pip] = (pips[pip] || 0) + 1)
    return pips
  }, {})
}


