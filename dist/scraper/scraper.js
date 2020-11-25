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
exports.scrapeDeck = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
function scrape(config) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const ax = axios_1.default.create();
            const result = yield ax.get(config.url);
            if (result.status !== 200)
                reject("Encountered error code: " + result.status);
            const html = result.data;
            const $ = cheerio_1.default.load(html);
            const deckSection = $(config.deckSelector);
            let cards = [];
            deckSection.each((_, elem) => {
                const count = parseInt($(elem).find(config.relativeCardCountSelector).text());
                const name = $(elem).find(config.relativeCardNameSelector).text();
                if (name &&
                    count &&
                    !cards.find((c) => c.name === name && c.count === count))
                    cards.push({ count, name });
            });
            /*
             * Combine repeated cards.
             */
            let data = {};
            cards.forEach((c) => {
                if (data[c.name])
                    data[c.name] += c.count;
                else
                    data[c.name] = c.count;
            });
            resolve(Object.keys(data).map((key) => ({ name: key, count: data[key] })));
        }));
    });
}
function scrapeDeck(url) {
    if (url.includes("mtggoldfish.com"))
        return goldfish(url);
    if (url.includes("tappedout.net"))
        return tapped(url);
    return null;
}
exports.scrapeDeck = scrapeDeck;
// Scrapers for various deck sites begin here
function goldfish(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            url: url,
            deckSelector: ".deck-view-deck-table > tbody > tr ",
            relativeCardNameSelector: "a",
            relativeCardCountSelector: ".text-right",
        };
        return scrape(config);
    });
}
function tapped(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            url: url,
            deckSelector: ".boardlist > li ",
            relativeCardNameSelector: ".card > a",
            relativeCardCountSelector: "a",
        };
        return scrape(config);
    });
}
