import { ScryfallCard, Mana, Manified, WUBRGC } from "../schema/schema";

export function manifyDeck(deck: ScryfallCard[]): Promise<Manified> {
  return new Promise((resolve, reject) => {
    const sources = calculateManaBase(deck);
    const costs = calculateManaCosts(deck);
    const manaDeck: Mana[] = [];

    resolve({ sources, costs, manaDeck });
  });
}

function pullPips(text: string, mb: WUBRGC) {
  const matches = text.match(/\{.\}/g);
  for (const match of matches) {
    const pip = match.substr(1, 1);
    if ("WUBRGC".includes(pip)) {
      mb[pip] += 1;
    } else if (parseInt(pip)) {
      mb.generic += parseInt(pip);
    }
  }
}

function calculateManaCosts(deck: ScryfallCard[]): WUBRGC {
  let mb: WUBRGC = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 };
  for (const card of deck) {
    if (card.type_line !== "Land") {
      if (card.mana_cost) pullPips(card.mana_cost, mb);
    }
  }
  return mb;
}

function calculateManaBase(deck: ScryfallCard[]): WUBRGC {
  let mb: WUBRGC = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, generic: 0 };
  for (const card of deck) {
    if (card.type_line === "Land") {
      pullPips(card.oracle_text, mb);
    }
  }
  return mb;
}
