"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scryfallifyDeck = void 0;
const axios_1 = __importDefault(require("axios"));
function scryfallifyDeck(deck) {
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
    const addCountToCard = (card) => {
        if (counts[card.name])
            return Object.assign(Object.assign({}, card), { count: counts[card.name] });
        /*
         * This inital check fails if the original name doesn't match the name scryfall gives back.
         * This happens with split cards, usually.
         */
        return Object.assign(Object.assign({}, card), { count: counts[Object.keys(counts).find((key) => card.name.includes(key))] });
    };
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
            const result1 = yield axios_1.default
                .post(url, {
                identifiers: ids1,
            })
                .catch(reject);
            const result2 = yield axios_1.default
                .post(url, {
                identifiers: ids2,
            })
                .catch(reject);
            /*
             * Stich the two result arrays together
             */
            if (result1 && result2)
                resolve(result1.data.data.concat(result2.data.data).map(addCountToCard));
        }
        else {
            const result = yield axios_1.default
                .post(url, {
                identifiers,
            })
                .catch(reject);
            if (result)
                resolve(result.data.data.map(addCountToCard));
        }
    }));
}
exports.scryfallifyDeck = scryfallifyDeck;
