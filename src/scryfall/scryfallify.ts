import axios from "axios";
import { Card, ScryfallCard } from "../schema/schema";

export function scryfallifyDeck(deck: Card[]): Promise<ScryfallCard[]> {
  const url = "https://api.scryfall.com/cards/collection";

  /*
   * Dictionary for recovering the number of each card in the deck.
   *
   * Split cards currently break this.
   */
  let counts = {};
  for (const card of deck) {
    counts[card.name] = card.count;
  }

  const addCountToCard = (card: ScryfallCard) => {
    return { ...card, count: counts[card.name] ? counts[card.name] : -1 };
  };

  return new Promise(async (resolve, reject) => {
    const identifiers = deck.map((card) => ({
      name: card.name,
    }));

    /*
     * Scryfall only accepts collections in chunks of 75 cards.
     * Split into two if necessary (such as for commander decks)
     */
    if (identifiers.length > 75) {
      const ids1 = identifiers.slice(0, 74);
      const ids2 = identifiers.slice(75);

      const result1 = await axios
        .post(url, {
          identifiers: ids1,
        })
        .catch(reject);

      const result2 = await axios
        .post(url, {
          identifiers: ids2,
        })
        .catch(reject);

      /*
       * Stich the two result arrays together
       */
      if (result1 && result2)
        resolve(
          result1.data.data.concat(result2.data.data).map(addCountToCard)
        );
    } else {
      const result = await axios
        .post(url, {
          identifiers,
        })
        .catch(reject);

      if (result) resolve(result.data.data.map(addCountToCard));
    }
  });
}
