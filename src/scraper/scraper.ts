import axios from "axios";
import cheerio from "cheerio";

import { Card } from "../schema/Schema";

interface scrapeConfig {
  url: string;
  deckSelector: string;
  relativeCardCountSelector: string;
  relativeCardNameSelector: string;
}

async function scrape(config: scrapeConfig): Promise<Card[]> {
  return new Promise(async (resolve, reject) => {
    const ax = axios.create();

    const result = await ax.get(config.url);
    if (result.status !== 200)
      reject("Encountered error code: " + result.status);

    const html = result.data;
    const $ = cheerio.load(html);

    const deckSection: cheerio.Cheerio = $(config.deckSelector);

    let cards: Card[] = [];

    deckSection.each((_, elem) => {
      const count = parseInt(
        $(elem).find(config.relativeCardCountSelector).text()
      );
      const name = $(elem).find(config.relativeCardNameSelector).text().trim();

      if (
        name &&
        count &&
        !cards.find((c) => c.name === name && c.count === count)
      )
        cards.push({ count, name });
    });

    /*
     * Combine repeated cards.
     */
    let data = {};
    cards.forEach((c) => {
      if (data[c.name]) data[c.name] += c.count;
      else data[c.name] = c.count;
    });

    resolve(Object.keys(data).map((key) => ({ name: key, count: data[key] })));
  });
}

export function scrapeDeck(url: string): Promise<Card[]> {
  if (url.includes("mtggoldfish.com"))
    return goldfish(url);
  else if (url.includes("tappedout.net"))
    return tapped(url);
  else
    return Promise.reject("We can't parse " + url + " yet. We're working on it!");
}

// Scrapers for various deck sites begin here

async function goldfish(url: string): Promise<Card[]> {
  const config: scrapeConfig = {
    url: url,
    deckSelector: ".deck-view-deck-table > tbody > tr ",
    relativeCardNameSelector: "a",
    relativeCardCountSelector: ".text-right",
  };

  return scrape(config);
}

async function tapped(url: string): Promise<Card[]> {
  const config: scrapeConfig = {
    url: url,
    deckSelector: ".boardlist > li ",
    relativeCardNameSelector: ".card > a",
    relativeCardCountSelector: "a",
  };

  return scrape(config);
}
